# TodoList API - .NET 8 Minimal API Backend

A comprehensive RESTful API for the TodoList application built with .NET 8 Minimal APIs, featuring clean architecture, Swagger documentation, and CORS support for frontend integration.

## 🚀 Features

- **Minimal APIs**: Clean and lightweight API design using .NET 8 Minimal APIs
- **Swagger UI**: Interactive API documentation available at the root URL
- **CORS Support**: Configured for React frontend integration
- **In-Memory Storage**: Fast development with in-memory data storage
- **Comprehensive Endpoints**: Full CRUD operations for todos and categories
- **Statistics API**: Real-time analytics and statistics
- **Health Check**: API health monitoring endpoint
- **Type Safety**: Strong typing with DTOs and models

## 📡 API Endpoints

### Todos API (`/api/todos`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/todos` | Get all todos |
| GET | `/api/todos/{id}` | Get todo by ID |
| POST | `/api/todos` | Create new todo |
| PUT | `/api/todos/{id}` | Update todo |
| DELETE | `/api/todos/{id}` | Delete todo |
| PATCH | `/api/todos/{id}/toggle` | Toggle todo completion |

### Categories API (`/api/categories`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | Get all categories |
| GET | `/api/categories/{id}` | Get category by ID |
| POST | `/api/categories` | Create new category |
| PUT | `/api/categories/{id}` | Update category |
| DELETE | `/api/categories/{id}` | Delete category |

### Statistics API (`/api/stats`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stats` | Get comprehensive todo statistics |

### Health Check (`/health`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | API health status |

## 🔧 Getting Started

### Prerequisites
- .NET 8.0 SDK or later
- Your favorite code editor (VS Code, Visual Studio, etc.)

### Installation & Running

```bash
# Navigate to the API directory
cd backend/TodoListApi

# Restore dependencies
dotnet restore

# Build the project
dotnet build

# Run the API
dotnet run
```

### API URLs
- **HTTP**: http://localhost:5001
- **Swagger UI**: http://localhost:5001 (root URL)

## 📋 API Models

### Todo Model
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "priority": "Low|Medium|High|Urgent",
  "category": "string",
  "isCompleted": true,
  "createdDate": "2024-10-04T00:00:00Z",
  "dueDate": "2024-10-15T00:00:00Z",
  "tags": ["string"]
}
```

### Category Model
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "color": "#3b82f6",
  "todoCount": 0
}
```

### Statistics Model
```json
{
  "totalTodos": 0,
  "completedTodos": 0,
  "pendingTodos": 0,
  "totalCategories": 0,
  "todosByCategory": {
    "category": 0
  },
  "todosByPriority": {
    "priority": 0
  },
  "overdueTodos": 0
}
```

## 🎯 API Usage Examples

### Create a Todo
```bash
curl -X POST "http://localhost:5001/api/todos" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complete API documentation",
    "description": "Write comprehensive API documentation",
    "priority": "High",
    "category": "Work",
    "dueDate": "2024-10-15T00:00:00Z",
    "tags": ["documentation", "api"]
  }'
```

### Get All Todos
```bash
curl -X GET "http://localhost:5001/api/todos"
```

### Update Todo
```bash
curl -X PUT "http://localhost:5001/api/todos/{id}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated title",
    "isCompleted": true
  }'
```

### Toggle Todo Completion
```bash
curl -X PATCH "http://localhost:5001/api/todos/{id}/toggle"
```

### Create Category
```bash
curl -X POST "http://localhost:5001/api/categories" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Project Work",
    "description": "Work related to projects",
    "color": "#3b82f6"
  }'
```

### Get Statistics
```bash
curl -X GET "http://localhost:5001/api/stats"
```

## 🏗️ Architecture

### Project Structure
```
TodoListApi/
├── Models/
│   └── TodoModels.cs          # Data models
├── DTOs/
│   └── TodoDTOs.cs           # Data transfer objects
├── Services/
│   └── TodoServices.cs       # Business logic services
├── Program.cs                # Minimal API endpoints
├── appsettings.json          # Configuration
└── TodoListApi.csproj        # Project file
```

### Design Patterns
- **Repository Pattern**: Service layer abstraction for data access
- **DTO Pattern**: Separate request/response models from domain models
- **Dependency Injection**: Built-in DI container for service registration
- **Minimal APIs**: Clean, functional approach to API endpoints

### Services
- **ITodoService**: Todo management operations
- **ICategoryService**: Category management operations
- **In-Memory Storage**: Fast development storage (easily replaceable with database)

## 🔒 CORS Configuration

The API is configured with CORS to allow requests from:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000` (Create React App)

## 📚 Swagger Documentation

Interactive API documentation is available at the root URL when running in development mode:
- **Swagger UI**: http://localhost:5001
- **OpenAPI Spec**: http://localhost:5001/swagger/v1/swagger.json

Features:
- Interactive endpoint testing
- Request/response examples
- Model schemas
- Parameter descriptions

## 🚀 Development Features

### Hot Reload
The API supports hot reload during development. Changes to code are automatically reflected without restart.

### Logging
Comprehensive logging is configured for:
- Request/response logging
- Error tracking
- Performance monitoring

### Error Handling
- Proper HTTP status codes
- Descriptive error messages
- Validation error responses

## 🔄 Integration with Frontend

The API is designed to work seamlessly with the React frontend:

1. **CORS enabled** for localhost development
2. **Consistent data models** matching frontend expectations
3. **RESTful design** following standard conventions
4. **JSON responses** with proper content types

### Frontend Integration Example
```javascript
// Get all todos
const response = await fetch('http://localhost:5001/api/todos');
const todos = await response.json();

// Create todo
const newTodo = await fetch('http://localhost:5001/api/todos', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'New Todo',
    description: 'Todo description',
    priority: 'High',
    category: 'Work',
    tags: ['api', 'integration']
  })
});
```

## 📈 Sample Data

The API includes sample data for development:
- **5 sample todos** with various priorities and categories
- **5 sample categories** with different colors
- **Realistic data** for testing and demonstration

## 🔧 Configuration

### appsettings.json
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "Urls": "http://localhost:5001"
}
```

## 🚀 Deployment Ready

The API is ready for deployment with:
- Production-ready configuration
- Health check endpoint
- Proper error handling
- Security best practices

## 🎯 Future Enhancements

Potential improvements for production use:
- **Database Integration**: Entity Framework Core with SQL Server/PostgreSQL
- **Authentication**: JWT token-based authentication
- **Caching**: Redis caching for improved performance
- **Rate Limiting**: API rate limiting for security
- **Validation**: FluentValidation for complex validation rules
- **Logging**: Structured logging with Serilog
- **Monitoring**: Application Insights or similar monitoring

---

## 🏆 Summary

This TodoList API demonstrates:
- ✅ **Modern .NET 8** Minimal APIs implementation
- ✅ **Clean Architecture** with separation of concerns
- ✅ **Comprehensive API** covering all CRUD operations
- ✅ **Interactive Documentation** with Swagger UI
- ✅ **Frontend Integration** ready with CORS support
- ✅ **Professional Quality** production-ready code structure
