using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using System.Text.Json.Serialization;

const string SummaryCacheKey = "architecture-summary";

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactDevClient", policy =>
    {
        policy
            .WithOrigins("http://localhost:5173", "http://127.0.0.1:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("Default") ?? "Data Source=architecture-demo.db"));

builder.Services.AddMemoryCache();
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

var app = builder.Build();

app.UseCors("ReactDevClient");

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureDeleted();
    db.Database.EnsureCreated();
    SeedData.Initialize(db);
}

app.MapGet("/api/health", () => Results.Ok(new { status = "ok", service = "week04-dotnet-architecture-demo" }));

app.MapGet("/api/projects", async (AppDbContext db) =>
{
    var projects = await db.Projects
        .AsNoTracking()
        .Include(project => project.Features)
        .Include(project => project.Decisions)
        .OrderByDescending(project => project.Id)
        .Select(project => ProjectDto.From(project))
        .ToListAsync();

    return Results.Ok(projects);
});

app.MapPost("/api/projects", async (CreateProjectRequest request, AppDbContext db, IMemoryCache cache) =>
{
    if (string.IsNullOrWhiteSpace(request.Name) || request.Name.Length < 3)
    {
        return Results.BadRequest(new ApiError("Project name must be at least 3 characters."));
    }

    var project = new Project
    {
        Name = request.Name.Trim(),
        Problem = request.Problem.Trim(),
        Audience = request.Audience.Trim(),
        Status = ProjectStatus.DISCOVERY
    };

    db.Projects.Add(project);
    await db.SaveChangesAsync();
    cache.Remove(SummaryCacheKey);

    return Results.Created($"/api/projects/{project.Id}", ProjectDto.From(project));
});

app.MapPost("/api/projects/{projectId:int}/features", async (int projectId, CreateFeatureRequest request, AppDbContext db, IMemoryCache cache) =>
{
    var projectExists = await db.Projects.AnyAsync(project => project.Id == projectId);
    if (!projectExists)
    {
        return Results.NotFound(new ApiError("Project not found."));
    }

    if (string.IsNullOrWhiteSpace(request.Title) || request.Title.Length < 3)
    {
        return Results.BadRequest(new ApiError("Feature title must be at least 3 characters."));
    }

    if (string.IsNullOrWhiteSpace(request.Description) || request.Description.Length < 10)
    {
        return Results.BadRequest(new ApiError("Feature description must be at least 10 characters."));
    }

    var feature = new Feature
    {
        Title = request.Title.Trim(),
        Description = request.Description.Trim(),
        Layer = request.Layer,
        Priority = request.Priority,
        Status = FeatureStatus.IDEA,
        ProjectId = projectId
    };

    db.Features.Add(feature);
    await db.SaveChangesAsync();
    cache.Remove(SummaryCacheKey);

    return Results.Created($"/api/features/{feature.Id}", FeatureDto.From(feature));
});

app.MapPatch("/api/features/{id:int}/status", async (int id, UpdateFeatureStatusRequest request, AppDbContext db, IMemoryCache cache) =>
{
    var feature = await db.Features.FindAsync(id);
    if (feature is null)
    {
        return Results.NotFound(new ApiError("Feature not found."));
    }

    feature.Status = request.Status;
    feature.UpdatedAt = DateTimeOffset.UtcNow;
    await db.SaveChangesAsync();
    cache.Remove(SummaryCacheKey);

    return Results.Ok(FeatureDto.From(feature));
});

app.MapPost("/api/projects/{projectId:int}/decisions", async (int projectId, CreateDecisionRequest request, AppDbContext db, IMemoryCache cache) =>
{
    var projectExists = await db.Projects.AnyAsync(project => project.Id == projectId);
    if (!projectExists)
    {
        return Results.NotFound(new ApiError("Project not found."));
    }

    if (string.IsNullOrWhiteSpace(request.Title) || request.Title.Length < 3)
    {
        return Results.BadRequest(new ApiError("Decision title must be at least 3 characters."));
    }

    var decision = new Decision
    {
        Title = request.Title.Trim(),
        Context = request.Context.Trim(),
        Choice = request.Choice.Trim(),
        Consequence = request.Consequence.Trim(),
        ProjectId = projectId
    };

    db.Decisions.Add(decision);
    await db.SaveChangesAsync();
    cache.Remove(SummaryCacheKey);

    return Results.Created($"/api/decisions/{decision.Id}", DecisionDto.From(decision));
});

app.MapGet("/api/summary", async (AppDbContext db, IMemoryCache cache) =>
{
    if (cache.TryGetValue(SummaryCacheKey, out SummaryDto? cachedSummary) && cachedSummary is not null)
    {
        return Results.Ok(cachedSummary with { Cached = true });
    }

    var features = await db.Features.AsNoTracking().ToListAsync();
    var summary = new SummaryDto(
        ProjectCount: await db.Projects.CountAsync(),
        FeatureCount: features.Count,
        DecisionCount: await db.Decisions.CountAsync(),
        ByLayer: Enum.GetValues<FeatureLayer>().ToDictionary(layer => layer.ToString(), layer => features.Count(feature => feature.Layer == layer)),
        ByStatus: Enum.GetValues<FeatureStatus>().ToDictionary(status => status.ToString(), status => features.Count(feature => feature.Status == status)),
        Cached: false);

    cache.Set(SummaryCacheKey, summary, TimeSpan.FromSeconds(15));
    return Results.Ok(summary);
});

app.Run();

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<Feature> Features => Set<Feature>();
    public DbSet<Decision> Decisions => Set<Decision>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Project>()
            .HasIndex(project => project.Name)
            .IsUnique();

        modelBuilder.Entity<Feature>()
            .HasIndex(feature => new { feature.ProjectId, feature.Layer });

        modelBuilder.Entity<Feature>()
            .HasIndex(feature => feature.Status);

        modelBuilder.Entity<Decision>()
            .HasIndex(decision => decision.ProjectId);
    }
}

public sealed class Project
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string Problem { get; set; }
    public required string Audience { get; set; }
    public ProjectStatus Status { get; set; }
    public List<Feature> Features { get; set; } = [];
    public List<Decision> Decisions { get; set; } = [];
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
}

public sealed class Feature
{
    public int Id { get; set; }
    public required string Title { get; set; }
    public required string Description { get; set; }
    public FeatureLayer Layer { get; set; }
    public FeatureStatus Status { get; set; }
    public Priority Priority { get; set; }
    public int ProjectId { get; set; }
    public Project? Project { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
}

public sealed class Decision
{
    public int Id { get; set; }
    public required string Title { get; set; }
    public required string Context { get; set; }
    public required string Choice { get; set; }
    public required string Consequence { get; set; }
    public int ProjectId { get; set; }
    public Project? Project { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
}

public enum ProjectStatus { DISCOVERY, DESIGN, BUILDING, REVIEW }
public enum FeatureLayer { UI, API, DATA }
public enum FeatureStatus { IDEA, READY, BLOCKED, DONE }
public enum Priority { LOW, MEDIUM, HIGH }

public sealed record CreateProjectRequest(string Name, string Problem, string Audience);
public sealed record CreateFeatureRequest(string Title, string Description, FeatureLayer Layer, Priority Priority);
public sealed record UpdateFeatureStatusRequest(FeatureStatus Status);
public sealed record CreateDecisionRequest(string Title, string Context, string Choice, string Consequence);
public sealed record ApiError(string Message);

public sealed record ProjectDto(
    int Id,
    string Name,
    string Problem,
    string Audience,
    ProjectStatus Status,
    List<FeatureDto> Features,
    List<DecisionDto> Decisions)
{
    public static ProjectDto From(Project project) => new(
        project.Id,
        project.Name,
        project.Problem,
        project.Audience,
        project.Status,
        project.Features.Select(FeatureDto.From).OrderBy(feature => feature.Layer).ThenBy(feature => feature.Status).ToList(),
        project.Decisions.Select(DecisionDto.From).OrderByDescending(decision => decision.Id).ToList());
}

public sealed record FeatureDto(int Id, string Title, string Description, FeatureLayer Layer, FeatureStatus Status, Priority Priority)
{
    public static FeatureDto From(Feature feature) => new(feature.Id, feature.Title, feature.Description, feature.Layer, feature.Status, feature.Priority);
}

public sealed record DecisionDto(int Id, string Title, string Context, string Choice, string Consequence)
{
    public static DecisionDto From(Decision decision) => new(decision.Id, decision.Title, decision.Context, decision.Choice, decision.Consequence);
}

public sealed record SummaryDto(
    int ProjectCount,
    int FeatureCount,
    int DecisionCount,
    Dictionary<string, int> ByLayer,
    Dictionary<string, int> ByStatus,
    bool Cached);

public static class SeedData
{
    public static void Initialize(AppDbContext db)
    {
        if (db.Projects.Any())
        {
            return;
        }

        db.Projects.AddRange(
            new Project
            {
                Name = "Campus Project Studio",
                Problem = "Student teams need a shared place to turn ideas into scoped web app plans.",
                Audience = "CSC 436 project teams",
                Status = ProjectStatus.DESIGN,
                Features =
                [
                    new Feature { Title = "Project dashboard", Description = "Show the current project, feature mix, and architecture decisions.", Layer = FeatureLayer.UI, Priority = Priority.HIGH, Status = FeatureStatus.READY },
                    new Feature { Title = "Feature resource API", Description = "Expose feature creation and status changes through REST endpoints.", Layer = FeatureLayer.API, Priority = Priority.HIGH, Status = FeatureStatus.READY },
                    new Feature { Title = "Durable decision log", Description = "Persist design decisions so teams can explain why choices were made.", Layer = FeatureLayer.DATA, Priority = Priority.MEDIUM, Status = FeatureStatus.IDEA }
                ],
                Decisions =
                [
                    new Decision { Title = "Use REST resources before adding more tooling", Context = "Students already learned REST and need a clear API boundary.", Choice = "Model projects, features, and decisions as resource endpoints.", Consequence = "The frontend can stay focused on user workflows instead of database tables." },
                    new Decision { Title = "Start with SQLite for class demos", Context = "The demo should run locally with minimal setup.", Choice = "Use EF Core with SQLite and seeded data.", Consequence = "Students can inspect persistence concepts before worrying about cloud infrastructure." }
                ]
            },
            new Project
            {
                Name = "Volunteer Match Board",
                Problem = "Campus organizations need a lightweight way to post volunteer opportunities.",
                Audience = "Student organizations and volunteers",
                Status = ProjectStatus.DISCOVERY,
                Features =
                [
                    new Feature { Title = "Opportunity list", Description = "Let students scan available volunteer opportunities.", Layer = FeatureLayer.UI, Priority = Priority.MEDIUM, Status = FeatureStatus.IDEA },
                    new Feature { Title = "Organization ownership", Description = "Associate each opportunity with the organization that created it.", Layer = FeatureLayer.DATA, Priority = Priority.HIGH, Status = FeatureStatus.BLOCKED }
                ]
            });

        db.SaveChanges();
    }
}