using Microsoft.AspNetCore.Mvc;
using TodoListApi.DTOs;
using TodoListApi.Models;
using TodoListApi.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { 
        Title = "TodoList API", 
        Version = "v1",
        Description = "A comprehensive TodoList API built with .NET 8 Minimal APIs"
    });
});

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:5174", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:5174")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Register services
builder.Services.AddSingleton<ICategoryService, InMemoryCategoryService>();
builder.Services.AddSingleton<ITodoService, InMemoryTodoService>();

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "TodoList API v1");
        c.RoutePrefix = string.Empty; // Serve Swagger UI at root
    });
}

app.UseHttpsRedirection();
app.UseCors("AllowReactApp");

// Todo API Endpoints
var todosGroup = app.MapGroup("/api/todos")
    .WithTags("Todos")
    .WithOpenApi();

todosGroup.MapGet("/", async (ITodoService todoService) =>
{
    var todos = await todoService.GetAllTodosAsync();
    var response = todos.Select(t => new TodoResponse
    {
        Id = t.Id,
        Title = t.Title,
        Description = t.Description,
        Priority = t.Priority.ToString(),
        Category = t.Category,
        IsCompleted = t.IsCompleted,
        CreatedDate = t.CreatedDate,
        DueDate = t.DueDate,
        Tags = t.Tags
    });
    return Results.Ok(response);
})
.WithName("GetAllTodos")
.WithSummary("Get all todos")
.WithDescription("Retrieves all todos from the system");

todosGroup.MapGet("/{id}", async (string id, ITodoService todoService) =>
{
    var todo = await todoService.GetTodoByIdAsync(id);
    if (todo == null)
        return Results.NotFound($"Todo with ID {id} not found");

    var response = new TodoResponse
    {
        Id = todo.Id,
        Title = todo.Title,
        Description = todo.Description,
        Priority = todo.Priority.ToString(),
        Category = todo.Category,
        IsCompleted = todo.IsCompleted,
        CreatedDate = todo.CreatedDate,
        DueDate = todo.DueDate,
        Tags = todo.Tags
    };
    return Results.Ok(response);
})
.WithName("GetTodoById")
.WithSummary("Get todo by ID")
.WithDescription("Retrieves a specific todo by its ID");

todosGroup.MapPost("/", async ([FromBody] CreateTodoRequest request, ITodoService todoService) =>
{
    var todo = new Todo
    {
        Title = request.Title,
        Description = request.Description,
        Priority = request.Priority,
        Category = request.Category,
        DueDate = request.DueDate,
        Tags = request.Tags
    };

    var createdTodo = await todoService.CreateTodoAsync(todo);
    var response = new TodoResponse
    {
        Id = createdTodo.Id,
        Title = createdTodo.Title,
        Description = createdTodo.Description,
        Priority = createdTodo.Priority.ToString(),
        Category = createdTodo.Category,
        IsCompleted = createdTodo.IsCompleted,
        CreatedDate = createdTodo.CreatedDate,
        DueDate = createdTodo.DueDate,
        Tags = createdTodo.Tags
    };

    return Results.Created($"/api/todos/{createdTodo.Id}", response);
})
.WithName("CreateTodo")
.WithSummary("Create a new todo")
.WithDescription("Creates a new todo item");

todosGroup.MapPut("/{id}", async (string id, [FromBody] UpdateTodoRequest request, ITodoService todoService) =>
{
    var existingTodo = await todoService.GetTodoByIdAsync(id);
    if (existingTodo == null)
        return Results.NotFound($"Todo with ID {id} not found");

    var updatedTodo = new Todo
    {
        Id = existingTodo.Id,
        Title = request.Title ?? existingTodo.Title,
        Description = request.Description ?? existingTodo.Description,
        Priority = request.Priority ?? existingTodo.Priority,
        Category = request.Category ?? existingTodo.Category,
        IsCompleted = request.IsCompleted ?? existingTodo.IsCompleted,
        CreatedDate = existingTodo.CreatedDate,
        DueDate = request.DueDate ?? existingTodo.DueDate,
        Tags = request.Tags ?? existingTodo.Tags
    };

    var result = await todoService.UpdateTodoAsync(id, updatedTodo);
    if (result == null)
        return Results.NotFound($"Todo with ID {id} not found");

    var response = new TodoResponse
    {
        Id = result.Id,
        Title = result.Title,
        Description = result.Description,
        Priority = result.Priority.ToString(),
        Category = result.Category,
        IsCompleted = result.IsCompleted,
        CreatedDate = result.CreatedDate,
        DueDate = result.DueDate,
        Tags = result.Tags
    };

    return Results.Ok(response);
})
.WithName("UpdateTodo")
.WithSummary("Update a todo")
.WithDescription("Updates an existing todo item");

todosGroup.MapDelete("/{id}", async (string id, ITodoService todoService) =>
{
    var deleted = await todoService.DeleteTodoAsync(id);
    if (!deleted)
        return Results.NotFound($"Todo with ID {id} not found");

    return Results.NoContent();
})
.WithName("DeleteTodo")
.WithSummary("Delete a todo")
.WithDescription("Deletes a todo item by ID");

todosGroup.MapPatch("/{id}/toggle", async (string id, ITodoService todoService) =>
{
    var existingTodo = await todoService.GetTodoByIdAsync(id);
    if (existingTodo == null)
        return Results.NotFound($"Todo with ID {id} not found");

    var updatedTodo = new Todo
    {
        Id = existingTodo.Id,
        Title = existingTodo.Title,
        Description = existingTodo.Description,
        Priority = existingTodo.Priority,
        Category = existingTodo.Category,
        IsCompleted = !existingTodo.IsCompleted,
        CreatedDate = existingTodo.CreatedDate,
        DueDate = existingTodo.DueDate,
        Tags = existingTodo.Tags
    };

    var result = await todoService.UpdateTodoAsync(id, updatedTodo);
    if (result == null)
        return Results.NotFound($"Todo with ID {id} not found");

    var response = new TodoResponse
    {
        Id = result.Id,
        Title = result.Title,
        Description = result.Description,
        Priority = result.Priority.ToString(),
        Category = result.Category,
        IsCompleted = result.IsCompleted,
        CreatedDate = result.CreatedDate,
        DueDate = result.DueDate,
        Tags = result.Tags
    };

    return Results.Ok(response);
})
.WithName("ToggleTodoComplete")
.WithSummary("Toggle todo completion")
.WithDescription("Toggles the completion status of a todo item");

// Category API Endpoints
var categoriesGroup = app.MapGroup("/api/categories")
    .WithTags("Categories")
    .WithOpenApi();

categoriesGroup.MapGet("/", async (ICategoryService categoryService) =>
{
    var categories = await categoryService.GetAllCategoriesAsync();
    var response = categories.Select(c => new CategoryResponse
    {
        Id = c.Id,
        Name = c.Name,
        Description = c.Description,
        Color = c.Color,
        TodoCount = c.TodoCount
    });
    return Results.Ok(response);
})
.WithName("GetAllCategories")
.WithSummary("Get all categories")
.WithDescription("Retrieves all categories from the system");

categoriesGroup.MapGet("/{id}", async (string id, ICategoryService categoryService) =>
{
    var category = await categoryService.GetCategoryByIdAsync(id);
    if (category == null)
        return Results.NotFound($"Category with ID {id} not found");

    var response = new CategoryResponse
    {
        Id = category.Id,
        Name = category.Name,
        Description = category.Description,
        Color = category.Color,
        TodoCount = category.TodoCount
    };
    return Results.Ok(response);
})
.WithName("GetCategoryById")
.WithSummary("Get category by ID")
.WithDescription("Retrieves a specific category by its ID");

categoriesGroup.MapPost("/", async ([FromBody] CreateCategoryRequest request, ICategoryService categoryService) =>
{
    var category = new Category
    {
        Name = request.Name,
        Description = request.Description,
        Color = request.Color
    };

    var createdCategory = await categoryService.CreateCategoryAsync(category);
    var response = new CategoryResponse
    {
        Id = createdCategory.Id,
        Name = createdCategory.Name,
        Description = createdCategory.Description,
        Color = createdCategory.Color,
        TodoCount = createdCategory.TodoCount
    };

    return Results.Created($"/api/categories/{createdCategory.Id}", response);
})
.WithName("CreateCategory")
.WithSummary("Create a new category")
.WithDescription("Creates a new category");

categoriesGroup.MapPut("/{id}", async (string id, [FromBody] UpdateCategoryRequest request, ICategoryService categoryService) =>
{
    var existingCategory = await categoryService.GetCategoryByIdAsync(id);
    if (existingCategory == null)
        return Results.NotFound($"Category with ID {id} not found");

    var updatedCategory = new Category
    {
        Id = existingCategory.Id,
        Name = request.Name ?? existingCategory.Name,
        Description = request.Description ?? existingCategory.Description,
        Color = request.Color ?? existingCategory.Color,
        TodoCount = existingCategory.TodoCount
    };

    var result = await categoryService.UpdateCategoryAsync(id, updatedCategory);
    if (result == null)
        return Results.NotFound($"Category with ID {id} not found");

    var response = new CategoryResponse
    {
        Id = result.Id,
        Name = result.Name,
        Description = result.Description,
        Color = result.Color,
        TodoCount = result.TodoCount
    };

    return Results.Ok(response);
})
.WithName("UpdateCategory")
.WithSummary("Update a category")
.WithDescription("Updates an existing category");

categoriesGroup.MapDelete("/{id}", async (string id, ICategoryService categoryService) =>
{
    var deleted = await categoryService.DeleteCategoryAsync(id);
    if (!deleted)
        return Results.NotFound($"Category with ID {id} not found");

    return Results.NoContent();
})
.WithName("DeleteCategory")
.WithSummary("Delete a category")
.WithDescription("Deletes a category by ID");

// Stats API Endpoint
app.MapGet("/api/stats", async (ITodoService todoService) =>
{
    var stats = await todoService.GetStatsAsync();
    return Results.Ok(stats);
})
.WithTags("Statistics")
.WithName("GetTodoStats")
.WithSummary("Get todo statistics")
.WithDescription("Retrieves comprehensive statistics about todos")
.WithOpenApi();

// Health check endpoint
app.MapGet("/health", () => Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow }))
.WithTags("Health")
.WithName("HealthCheck")
.WithSummary("Health check")
.WithDescription("Returns the health status of the API")
.WithOpenApi();

app.Run();
