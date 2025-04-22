using BookAPI.Models;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Book API", Version = "v1" });
});

// Add CORS support
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.AllowAnyOrigin() // Vite's default port
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Configure middleware
app.UseCors("AllowReactApp");

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.MapGet("/HelloWorld", () =>
{
    return "Hello World!";
})
.WithName("HelloWorld")
.WithOpenApi();

// In-memory database
var books = new List<Book>
{
    new Book { Id = 1, Title = "To Kill a Mockingbird", Author = "Harper Lee", Year = 1960, Genre = "Fiction" },
    new Book { Id = 2, Title = "1984", Author = "George Orwell", Year = 1949, Genre = "Dystopian" },
    new Book { Id = 3, Title = "The Great Gatsby", Author = "F. Scott Fitzgerald", Year = 1925, Genre = "Classic" }
};

// GET - Get all books
app.MapGet("/api/books", () => books)
   .WithName("GetAllBooks");

// GET - Get a specific book by ID
app.MapGet("/api/books/{id}", (int id) =>
{
    var book = books.Find(b => b.Id == id);
    return book == null ? Results.NotFound() : Results.Ok(book);
})
.WithName("GetBookById");

// POST - Add a new book
app.MapPost("/api/books", (Book book) =>
{
    book.Id = books.Count > 0 ? books.Max(b => b.Id) + 1 : 1;
    books.Add(book);
    return Results.Created($"/api/books/{book.Id}", book);
})
.WithName("AddBook");

// PUT - Update a book
app.MapPut("/api/books/{id}", (int id, Book updatedBook) =>
{
    var index = books.FindIndex(b => b.Id == id);
    if (index == -1) return Results.NotFound();
    
    updatedBook.Id = id;
    books[index] = updatedBook;
    return Results.NoContent();
})
.WithName("UpdateBook");

// PATCH - Update book availability
app.MapPatch("/api/books/{id}/availability", (int id, bool isAvailable) =>
{
    // Book found = null;
    // foreach(Book b in books){
    //     if(b.Title.ToLower() == title.ToLower()){
    //         found = b;
    //     }
    // }
    var book = books.Find(b => b.Id == id);
    if (book == null) return Results.NotFound();
    
    book.IsAvailable = isAvailable;
    return Results.NoContent();
})
.WithName("UpdateBookAvailability");

// DELETE - Delete a book
app.MapDelete("/api/books/{id}", (int id) =>
{
    var index = books.FindIndex(b => b.Id == id);
    if (index == -1) return Results.NotFound();
    
    books.RemoveAt(index);
    return Results.NoContent();
})
.WithName("DeleteBook");

app.Run();
