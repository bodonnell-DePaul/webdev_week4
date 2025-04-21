## webdev week 4

Collecting workspace information# Introduction to .NET APIs and React Integration

## C# and Java Comparison

### Language Similarities
| Feature | C# | Java |
|---------|-----|------|
| Type System | Static, strong typing | Static, strong typing |
| Syntax | Curly brace syntax | Curly brace syntax |
| Memory Management | Garbage collected | Garbage collected |
| OOP Support | Classes, interfaces, inheritance | Classes, interfaces, inheritance |
| Platform | Cross-platform via .NET | Cross-platform via JVM |

### Key Differences
- **Syntax Sugar**: C# offers more modern features like properties, LINQ, and nullable reference types
- **Value Types**: C# has structs and value types for better performance
- **Generics**: C# generics are fully preserved at runtime (reification)
- **Lambdas/Delegates**: More first-class support in C#
- **Async/Await**: Native support in C# vs CompletableFuture in Java

### Data Structure Comparison
```csharp
// C# List
List<string> csharpList = new List<string> { "apple", "banana", "orange" };
csharpList.Add("grape");
var firstItem = csharpList[0];

// C# Dictionary
Dictionary<string, int> csharpDict = new Dictionary<string, int>
{
    { "apple", 1 },
    { "banana", 2 }
};
csharpDict["orange"] = 3;
```

```java
// Java List
List<String> javaList = new ArrayList<>();
javaList.add("apple");
javaList.add("banana");
javaList.add("orange");
String firstItem = javaList.get(0);

// Java Map
Map<String, Integer> javaMap = new HashMap<>();
javaMap.put("apple", 1);
javaMap.put("banana", 2);
javaMap.put("orange", 3);
```

## HTTP Verbs for Web APIs

| Verb | Description | Example |
|------|-------------|---------|
| **GET** | Retrieve data without modifying resources | Get a list of books or a specific book by ID |
| **POST** | Create new resources or trigger operations | Add a new book to the database |
| **PUT** | Replace an existing resource entirely | Update all fields of a book |
| **PATCH** | Partially update an existing resource | Update only the title of a book |
| **DELETE** | Remove a resource | Delete a book from the database |
| **OPTIONS** | Get information about available communication options | Check what methods are allowed on a resource |
| **HEAD** | Same as GET but returns only headers without body | Check if a book exists without downloading its data |

## Building a Book Management Application

### Step 1: Create a .NET Minimal API Project

```bash
# Create a new minimal API project
dotnet new web -o BookAPI
cd BookAPI
```

### Step 2: Create the Book Model

```csharp
public class Book
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    public int Year { get; set; }
    public string Genre { get; set; } = string.Empty;
    public bool IsAvailable { get; set; } = true;
}
```

### Step 3: Create the API Endpoints in Program.cs

```csharp
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Add CORS support
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173") // Vite's default port
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Add Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Book API", Version = "v1" });
});

var app = builder.Build();

// Configure middleware
app.UseCors("AllowReactApp");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

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
```

### Step 4: Create a React App with Vite

```bash
# Create React app with Vite
npm create vite@latest book-manager -- --template react-ts
cd book-manager
npm install
npm install axios react-router-dom
```
### Step 4a: Why Axios?
# Why Use Axios Instead of JavaScript's Fetch API

While the native `fetch` API is built into modern browsers, Axios offers several advantages that make it a popular choice for HTTP requests in React applications:

## Advantages of Axios over Fetch

### 1. Automatic JSON Parsing
- **Axios**: Automatically transforms JSON data
  ```js
  // Axios
  const response = await axios.get('/api/data');
  console.log(response.data); // Already parsed as JSON
  ```
  
- **Fetch**: Requires manual JSON parsing
  ```js
  // Fetch
  const response = await fetch('/api/data');
  const data = await response.json(); // Extra step required
  console.log(data);
  ```

### 2. Better Error Handling
- **Axios**: Rejects promises on HTTP error status (4xx/5xx)
  ```js
  // Axios
  try {
    const response = await axios.get('/api/data');
    // Only runs on successful responses
  } catch (error) {
    // Handles 404s, 500s automatically
    console.error(error.response.status);
  }
  ```
  
- **Fetch**: Considers HTTP error responses as resolved promises
  ```js
  // Fetch
  const response = await fetch('/api/data');
  if (!response.ok) {
    // Must manually check and throw
    throw new Error(`HTTP error: ${response.status}`);
  }
  ```

### 3. Request Cancellation
- **Axios**: Built-in support for canceling requests
  ```js
  const controller = new AbortController();
  axios.get('/api/data', {
    signal: controller.signal
  });
  
  // Cancel request
  controller.abort();
  ```

- **Fetch**: More complex implementation with AbortController

### 4. Request/Response Interception
- **Axios**: Can intercept requests or responses before they're handled
  ```js
  // Add auth token to all requests
  axios.interceptors.request.use(config => {
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
  ```

### 5. Built-in CSRF Protection
- **Axios**: Has built-in CSRF protection for browsers

### 6. Better Browser Compatibility
- **Axios**: Works in more browsers without polyfills
- **Fetch**: Needs polyfills for older browsers

### 7. Progress Updates on Uploads/Downloads
- **Axios**: Provides progress indicators for file uploads
  ```js
  axios.post('/upload', formData, {
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      console.log(`Upload progress: ${percentCompleted}%`);
    }
  });
  ```

## When to Stick with Fetch

- When you want to minimize dependencies in your project
- For simple requests where Axios's additional features aren't needed
- When bundle size is a critical concern

In the context of our Book Management application, Axios provides a cleaner API for interacting with the .NET backend and helps standardize error handling across all HTTP operations.

---
### Step 5: Create Book Interface in React

```typescript
export interface Book {
  id?: number;
  title: string;
  author: string;
  year: number;
  genre: string;
  isAvailable: boolean;
}
```

### Step 6: Create API Service

```typescript
import axios from 'axios';
import { Book } from '../types/Book';

const API_URL = 'https://localhost:7210/api'; // Adjust port to match your .NET API

export const bookApi = {
  getAll: async (): Promise<Book[]> => {
    const response = await axios.get<Book[]>(`${API_URL}/books`);
    return response.data;
  },

  getById: async (id: number): Promise<Book> => {
    const response = await axios.get<Book>(`${API_URL}/books/${id}`);
    return response.data;
  },

  create: async (book: Book): Promise<Book> => {
    const response = await axios.post<Book>(`${API_URL}/books`, book);
    return response.data;
  },

  update: async (id: number, book: Book): Promise<void> => {
    await axios.put(`${API_URL}/books/${id}`, book);
  },

  updateAvailability: async (id: number, isAvailable: boolean): Promise<void> => {
    await axios.patch(`${API_URL}/books/${id}/availability`, isAvailable);
  },

  delete: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/books/${id}`);
  }
};
```

### Step 7: Create Book List Component

```tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Book } from '../types/Book';
import { bookApi } from '../services/bookApi';

const BookList = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const data = await bookApi.getAll();
        setBooks(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch books');
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await bookApi.delete(id);
        setBooks(books.filter(book => book.id !== id));
      } catch (err) {
        setError('Failed to delete book');
      }
    }
  };

  const toggleAvailability = async (id: number, isAvailable: boolean) => {
    try {
      await bookApi.updateAvailability(id, !isAvailable);
      setBooks(books.map(book => 
        book.id === id ? { ...book, isAvailable: !isAvailable } : book
      ));
    } catch (err) {
      setError('Failed to update book availability');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="book-list">
      <h2>Books Collection</h2>
      <Link to="/add" className="btn-add">Add New Book</Link>
      
      {books.length === 0 ? (
        <p>No books available</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>Year</th>
              <th>Genre</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.map(book => (
              <tr key={book.id}>
                <td>{book.title}</td>
                <td>{book.author}</td>
                <td>{book.year}</td>
                <td>{book.genre}</td>
                <td>
                  <button 
                    className={book.isAvailable ? 'status-available' : 'status-unavailable'}
                    onClick={() => book.id && toggleAvailability(book.id, book.isAvailable)}
                  >
                    {book.isAvailable ? 'Available' : 'Unavailable'}
                  </button>
                </td>
                <td>
                  <Link to={`/edit/${book.id}`} className="btn-edit">Edit</Link>
                  <button 
                    className="btn-delete" 
                    onClick={() => book.id && handleDelete(book.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default BookList;
```

### Step 8: Create Book Form Component

```tsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Book } from '../types/Book';
import { bookApi } from '../services/bookApi';

const BookForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [book, setBook] = useState<Book>({
    title: '',
    author: '',
    year: new Date().getFullYear(),
    genre: '',
    isAvailable: true
  });

  useEffect(() => {
    if (id) {
      const fetchBook = async () => {
        setLoading(true);
        try {
          const data = await bookApi.getById(Number(id));
          setBook(data);
        } catch (err) {
          setError('Failed to fetch book details');
        }
        setLoading(false);
      };

      fetchBook();
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setBook({
      ...book,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : name === 'year' ? Number(value) : value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (id) {
        await bookApi.update(Number(id), book);
      } else {
        await bookApi.create(book);
      }
      navigate('/');
    } catch (err) {
      setError(`Failed to ${id ? 'update' : 'create'} book`);
      setLoading(false);
    }
  };

  if (loading && id) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="book-form">
      <h2>{id ? 'Edit Book' : 'Add New Book'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={book.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="author">Author</label>
          <input
            type="text"
            id="author"
            name="author"
            value={book.author}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="year">Year</label>
          <input
            type="number"
            id="year"
            name="year"
            value={book.year}
            onChange={handleChange}
            min="1000"
            max={new Date().getFullYear()}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="genre">Genre</label>
          <input
            type="text"
            id="genre"
            name="genre"
            value={book.genre}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group checkbox">
          <input
            type="checkbox"
            id="isAvailable"
            name="isAvailable"
            checked={book.isAvailable}
            onChange={handleChange}
          />
          <label htmlFor="isAvailable">Available</label>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Saving...' : id ? 'Update Book' : 'Add Book'}
          </button>
          <button 
            type="button" 
            className="btn-secondary" 
            onClick={() => navigate('/')}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookForm;
```

### Step 9: Set Up Application Routing

Now let's create the main App component that will handle routing:

```tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import BookList from './components/BookList';
import BookForm from './components/BookForm';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <header className="app-header">
          <h1>Book Management System</h1>
        </header>
        <main className="app-content">
          <Routes>
            <Route path="/" element={<BookList />} />
            <Route path="/add" element={<BookForm />} />
            <Route path="/edit/:id" element={<BookForm />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
```

### Step 10: Add Basic Styling

```css
.css */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f8f9fa;
}

.app-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.app-header {
  background-color: #343a40;
  color: white;
  padding: 20px;
  text-align: center;
  margin-bottom: 30px;
  border-radius: 5px;
}

.app-content {
  background-color: white;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.book-list h2, .book-form h2 {
  margin-bottom: 20px;
  color: #343a40;
}

.btn-add {
  display: inline-block;
  background-color: #28a745;
  color: white;
  padding: 10px 15px;
  text-decoration: none;
  border-radius: 5px;
  margin-bottom: 20px;
}

.btn-add:hover {
  background-color: #218838;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

th, td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

th {
  background-color: #f8f9fa;
  font-weight: bold;
}

tr:hover {
  background-color: #f5f5f5;
}

.btn-edit, .btn-delete {
  padding: 5px 10px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  margin-right: 5px;
  font-size: 14px;
}

.btn-edit {
  background-color: #17a2b8;
  color: white;
  text-decoration: none;
}

.btn-delete {
  background-color: #dc3545;
  color: white;
}

.btn-edit:hover {
  background-color: #138496;
}

.btn-delete:hover {
  background-color: #c82333;
}

.status-available {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 3px;
  cursor: pointer;
}

.status-unavailable {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 3px;
  cursor: pointer;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.form-group.checkbox {
  display: flex;
  align-items: center;
}

.form-group.checkbox input {
  width: auto;
  margin-right: 10px;
}

.form-group.checkbox label {
  margin-bottom: 0;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.btn-primary, .btn-secondary {
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-primary:hover {
  background-color: #0069d9;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

.error-message {
  color: #dc3545;
  margin-bottom: 15px;
  padding: 10px;
  background-color: #f8d7da;
  border-radius: 4px;
  border: 1px solid #f5c6cb;
}
```

### Step 11: Set up the main entry point

```tsx
.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

Now your React application is complete and should be fully functional, connecting to the .NET API to perform CRUD operations on books.

To run both applications:

1. Start the .NET API:
```bash
cd BookAPI
dotnet run
```

2. In another terminal, start the React app:
```bash
cd book-manager
npm run dev
```
