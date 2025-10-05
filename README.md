# Web Development Week 4: .NET APIs and React Integration

## Introduction to .NET APIs and React Integration

This document provides an introduction to building full-stack applications using .NET Minimal APIs and React with TypeScript, demonstrated through a comprehensive TodoList application.

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
- **Syntax Sugar**: C# offers more modern features like properties, LINQ, nullable reference types, and pattern matching
- **Value Types**: C# has structs and value types for better memory performance and reduced GC pressure
- **Generics**: C# generics are fully preserved at runtime (reification) with better type safety
- **Lambdas/Delegates**: More first-class functional programming support in C#
- **Async/Await**: Native async/await support in C# vs CompletableFuture/reactive streams in Java
- **Properties**: C# has native property syntax vs Java's getter/setter methods
- **LINQ**: Language Integrated Query provides SQL-like syntax for data operations

### Enhanced Data Structure Comparison
```csharp
// C# List with collection initializers and LINQ
List<string> csharpList = new List<string> { "apple", "banana", "orange" };
csharpList.Add("grape");
var firstItem = csharpList.First();
var filtered = csharpList.Where(f => f.StartsWith("a")).ToList();

// C# Dictionary with object initializer syntax
Dictionary<string, int> csharpDict = new()
{
    { "apple", 1 },
    { "banana", 2 },
    ["orange"] = 3  // Index initializer syntax
};

// C# Record types for immutable data
public record FruitRecord(string Name, int Count, decimal Price);
var apple = new FruitRecord("Apple", 5, 1.99m);
```

```java
// Java List with streams for functional operations
List<String> javaList = new ArrayList<>();
javaList.add("apple");
javaList.add("banana");
javaList.add("orange");
String firstItem = javaList.get(0);
List<String> filtered = javaList.stream()
    .filter(f -> f.startsWith("a"))
    .collect(Collectors.toList());

// Java Map
Map<String, Integer> javaMap = new HashMap<>();
javaMap.put("apple", 1);
javaMap.put("banana", 2);
javaMap.put("orange", 3);

// Java Record (Java 14+) for immutable data
public record FruitRecord(String name, int count, BigDecimal price) {}
var apple = new FruitRecord("Apple", 5, new BigDecimal("1.99"));
```

## HTTP Verbs for Web APIs

Understanding REST API design principles is crucial for building maintainable web services:

| Verb | Description | TodoList Example | Idempotent | Safe |
|------|-------------|------------------|------------|------|
| **GET** | Retrieve data without modifying resources | Get all todos: `GET /api/todos` | ✅ | ✅ |
| **POST** | Create new resources or trigger operations | Create todo: `POST /api/todos` | ❌ | ❌ |
| **PUT** | Replace an existing resource entirely | Update todo: `PUT /api/todos/{id}` | ✅ | ❌ |
| **PATCH** | Partially update an existing resource | Mark complete: `PATCH /api/todos/{id}/complete` | ✅ | ❌ |
| **DELETE** | Remove a resource | Delete todo: `DELETE /api/todos/{id}` | ✅ | ❌ |
| **OPTIONS** | Get information about available communication options | Check allowed methods on todos endpoint | ✅ | ✅ |
| **HEAD** | Same as GET but returns only headers without body | Check if todo exists without downloading data | ✅ | ✅ |

### REST API Design Best Practices
- Use nouns for resource endpoints (`/todos` not `/getTodos`)
- Use HTTP status codes appropriately (200, 201, 404, 500, etc.)
- Version your APIs (`/api/v1/todos`)
- Implement proper error handling with consistent error response format
- Use query parameters for filtering, sorting, and pagination

## Building a TodoList Management Application

This section demonstrates building a full-stack TodoList application using .NET 8 Minimal APIs and React with TypeScript.

### Architecture Overview

**Frontend (React + TypeScript)**
- Framework: React 18 with TypeScript for type safety
- State Management: React Context API for global state
- Routing: React Router v6 for navigation
- API Communication: Axios for HTTP requests with interceptors
- UI: Modern responsive CSS with component-based styling

**Backend (.NET 8 Minimal API)**
- Framework: .NET 8 with Minimal APIs for lightweight, high-performance APIs
- Data Storage: In-memory storage with service layer abstraction
- Documentation: Swagger/OpenAPI for API documentation
- CORS: Configured for cross-origin requests from React frontend
- Validation: Data annotations and custom validation logic

### Step 1: Understanding the .NET Minimal API Structure

The TodoList backend uses .NET 8 Minimal APIs with a clean architecture:

```csharp
// TodoList/backend/TodoListApi/Program.cs
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

// Add CORS with multiple origins for development
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:5174", "http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Register services with dependency injection
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

// Todo API Endpoints using route groups for organization
var todosGroup = app.MapGroup("/api/todos")
    .WithTags("Todos")
    .WithOpenApi();

// GET /api/todos - Get all todos
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

// POST /api/todos - Create a new todo
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
    return Results.Created($"/api/todos/{createdTodo.Id}", createdTodo);
})
.WithName("CreateTodo")
.WithSummary("Create a new todo");

app.Run();
```

### Step 2: Understanding the Todo Model Structure

The TodoList uses a comprehensive model with priority levels and categories:

```csharp
// TodoList/backend/TodoListApi/Models/TodoModels.cs
public class Todo
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    
    [Required]
    [StringLength(200)]
    public string Title { get; set; } = string.Empty;
    
    [StringLength(1000)]
    public string Description { get; set; } = string.Empty;
    
    [Required]
    public Priority Priority { get; set; } = Priority.Medium;
    
    [Required]
    [StringLength(100)]
    public string Category { get; set; } = string.Empty;
    
    public bool IsCompleted { get; set; } = false;
    
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    
    public DateTime? DueDate { get; set; }
    
    public List<string> Tags { get; set; } = new();
}

public enum Priority
{
    Low = 1,
    Medium = 2,
    High = 3,
    Urgent = 4
}

public class Category
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;
    
    [StringLength(500)]
    public string Description { get; set; } = string.Empty;
    
    [Required]
    [StringLength(7)]
    public string Color { get; set; } = "#007bff";
}
```

### Step 3: Service Layer Architecture

The TodoList implements a clean service layer pattern for better testability and separation of concerns:

```csharp
// TodoList/backend/TodoListApi/Services/TodoServices.cs
public interface ITodoService
{
    Task<IEnumerable<Todo>> GetAllTodosAsync();
    Task<Todo?> GetTodoByIdAsync(string id);
    Task<Todo> CreateTodoAsync(Todo todo);
    Task<Todo?> UpdateTodoAsync(string id, Todo todo);
    Task<bool> DeleteTodoAsync(string id);
    Task<TodoStats> GetTodoStatsAsync();
}

public class InMemoryTodoService : ITodoService
{
    private readonly List<Todo> _todos = new();
    
    public async Task<IEnumerable<Todo>> GetAllTodosAsync()
    {
        return await Task.FromResult(_todos.AsEnumerable());
    }
    
    public async Task<Todo> CreateTodoAsync(Todo todo)
    {
        _todos.Add(todo);
        return await Task.FromResult(todo);
    }
    
    // Additional methods implementation...
}
```

### Step 4: Create a React App with Vite

The TodoList frontend is built with React 18 and TypeScript for better development experience:

```bash
# Create React app with Vite and TypeScript template
npm create vite@latest todolist-frontend -- --template react-ts
cd todolist-frontend
npm install
npm install axios react-router-dom
```

### Project Structure
```
TodoList/frontend/
├── src/
│   ├── components/
│   │   └── layout/
│   │       ├── Layout.tsx          # Main layout wrapper
│   │       └── Navigation.tsx      # Navigation component
│   ├── context/
│   │   └── TodoContext.tsx         # Global state management
│   ├── hooks/
│   │   ├── useLocalStorage.ts      # Local storage hook
│   │   ├── usePageTitle.ts         # Dynamic page titles
│   │   ├── useTodoFilter.ts        # Todo filtering logic
│   │   └── useTodoStats.ts         # Statistics calculations
│   ├── pages/
│   │   ├── HomePage.tsx            # Dashboard with statistics
│   │   ├── TodosPage.tsx           # Todo management page
│   │   ├── CategoriesPage.tsx      # Category management
│   │   ├── AboutPage.tsx           # About page
│   │   └── NotFoundPage.tsx        # 404 page
│   ├── services/
│   │   └── api.ts                  # API service layer
│   ├── types/
│   │   ├── index.ts               # Type exports
│   │   └── Todo.ts                # Todo-related types
│   └── utils/
│       └── apiTest.ts             # API connection testing
```
# Why Use Axios Instead of JavaScript's Fetch API

While the native `fetch` API is built into modern browsers, Axios offers several advantages that make it a popular choice for HTTP requests in React applications. The TodoList application demonstrates these benefits in practice.

## Advantages of Axios over Fetch

### 1. Automatic JSON Parsing
- **Axios**: Automatically transforms JSON data with proper typing
  ```typescript
  // TodoList API service using Axios
  const response = await axios.get<TodoResponse[]>('/api/todos');
  console.log(response.data); // Already parsed as TodoResponse[]
  ```
  
- **Fetch**: Requires manual JSON parsing and type assertions
  ```typescript
  // Fetch equivalent
  const response = await fetch('/api/todos');
  const data = await response.json() as TodoResponse[]; // Extra step + manual typing
  ```

### 2. Enhanced Error Handling
- **Axios**: Rejects promises on HTTP error status (4xx/5xx) with detailed error information
  ```typescript
  // TodoList error handling with Axios
  try {
    const response = await axios.get('/api/todos');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('API Error:', error.response?.status, error.response?.data);
      throw new Error(`Failed to fetch todos: ${error.response?.data?.message}`);
    }
  }
  ```
  
- **Fetch**: Considers HTTP error responses as resolved promises
  ```typescript
  // Fetch error handling (more verbose)
  const response = await fetch('/api/todos');
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`HTTP ${response.status}: ${errorData.message}`);
  }
  ```

### 3. Request/Response Interception
The TodoList uses Axios interceptors for consistent error handling and request logging:

```typescript
// TodoList API service with interceptors
axios.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API call failed:', error.response?.data);
    return Promise.reject(error);
  }
);
```

### 4. Built-in Request Cancellation
- **Axios**: Simplified cancellation with AbortController integration
  ```typescript
  const controller = new AbortController();
  const todoData = await axios.get('/api/todos', {
    signal: controller.signal
  });
  
  // Cancel if component unmounts
  useEffect(() => {
    return () => controller.abort();
  }, []);
  ```

### 5. TypeScript Integration
Axios provides excellent TypeScript support with generic types:

```typescript
// TodoList typed API calls
interface TodoResponse {
  id: string;
  title: string;
  priority: string;
  // ... other properties
}

const createTodo = async (todo: CreateTodoRequest): Promise<TodoResponse> => {
  const response = await axios.post<TodoResponse>('/api/todos', todo);
  return response.data; // Properly typed as TodoResponse
};
```

### 6. Consistent Configuration
The TodoList API service demonstrates centralized configuration:

```typescript
// TodoList API configuration
const API_BASE_URL = 'http://localhost:5001/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### 7. Advanced Features
- **Progress tracking**: For file uploads (useful for future attachments feature)
- **Request retries**: Built-in retry mechanisms
- **Concurrent requests**: Built-in support for Promise.all scenarios

## When to Consider Fetch

- **Minimal dependencies**: When bundle size is critical
- **Simple use cases**: Basic GET/POST requests without complex error handling
- **Native browser features**: When you need direct access to Response objects

## TodoList Implementation Choice

The TodoList application uses Axios because it provides:
- Type-safe API calls with proper error handling
- Centralized configuration for the API base URL
- Consistent error handling across all components
- Better developer experience with automatic JSON parsing
- Future-ready architecture for features like authentication tokens and request retry logic

---

### Step 5: Create Todo Types in React

The TodoList uses comprehensive TypeScript interfaces for type safety:

```typescript
// TodoList/frontend/src/types/Todo.ts
export interface Todo {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  isCompleted: boolean;
  createdDate: Date;
  dueDate?: Date;
  tags: string[];
}

export interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  todoCount: number;
}

export interface TodoStats {
  totalTodos: number;
  completedTodos: number;
  pendingTodos: number;
  totalCategories: number;
  todosByCategory: Record<string, number>;
  todosByPriority: Record<string, number>;
  overdueTodos: number;
}

export interface FilterOptions {
  searchQuery: string;
  category: string;
  priority: string;
  isCompleted?: boolean;
  sortBy: 'title' | 'priority' | 'dueDate' | 'createdDate';
  sortOrder: 'asc' | 'desc';
}

export type Priority = 'low' | 'medium' | 'high' | 'urgent';
```

### Step 6: Create API Service Layer

The TodoList implements a comprehensive API service with proper error handling:

```typescript
// TodoList/frontend/src/services/api.ts
import axios from 'axios';
import { Todo, Category, Priority } from '../types';

const API_BASE_URL = 'http://localhost:5001/api';

// Response interfaces matching the backend DTOs
interface TodoResponse {
  id: string;
  title: string;
  description: string;
  priority: string;
  category: string;
  isCompleted: boolean;
  createdDate: string;
  dueDate?: string;
  tags: string[];
}

// Request interfaces for creating/updating
interface CreateTodoRequest {
  title: string;
  description: string;
  priority: Priority;
  category: string;
  dueDate?: string;
  tags: string[];
}

// Configure Axios instance with interceptors
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Todo API service
export const todoApi = {
  // Get all todos
  getAll: async (): Promise<Todo[]> => {
    const response = await apiClient.get<TodoResponse[]>('/todos');
    return response.data.map(transformTodoResponse);
  },

  // Get todo by ID
  getById: async (id: string): Promise<Todo> => {
    const response = await apiClient.get<TodoResponse>(`/todos/${id}`);
    return transformTodoResponse(response.data);
  },

  // Create new todo
  create: async (todo: CreateTodoRequest): Promise<Todo> => {
    const response = await apiClient.post<TodoResponse>('/todos', todo);
    return transformTodoResponse(response.data);
  },

  // Update todo
  update: async (id: string, todo: Partial<CreateTodoRequest>): Promise<Todo> => {
    const response = await apiClient.put<TodoResponse>(`/todos/${id}`, todo);
    return transformTodoResponse(response.data);
  },

  // Toggle todo completion
  toggleComplete: async (id: string): Promise<Todo> => {
    const response = await apiClient.patch<TodoResponse>(`/todos/${id}/toggle`);
    return transformTodoResponse(response.data);
  },

  // Delete todo
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/todos/${id}`);
  },

  // Get todo statistics
  getStats: async (): Promise<TodoStats> => {
    const response = await apiClient.get<TodoStats>('/todos/stats');
    return response.data;
  }
};

// Transform backend response to frontend Todo interface
const transformTodoResponse = (response: TodoResponse): Todo => ({
  id: response.id,
  title: response.title,
  description: response.description,
  priority: response.priority.toLowerCase() as Priority,
  category: response.category,
  isCompleted: response.isCompleted,
  createdDate: new Date(response.createdDate),
  dueDate: response.dueDate ? new Date(response.dueDate) : undefined,
  tags: response.tags
});

// Category API service
export const categoryApi = {
  getAll: async (): Promise<Category[]> => {
    const response = await apiClient.get<Category[]>('/categories');
    return response.data;
  },

  create: async (category: Omit<Category, 'id' | 'todoCount'>): Promise<Category> => {
    const response = await apiClient.post<Category>('/categories', category);
    return response.data;
  },

  update: async (id: string, category: Partial<Category>): Promise<Category> => {
    const response = await apiClient.put<Category>(`/categories/${id}`, category);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/categories/${id}`);
  }
};
```

### Step 7: Create React Context for Global State Management

The TodoList uses React Context API for centralized state management:

```tsx
// TodoList/frontend/src/context/TodoContext.tsx
import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Todo, Category, TodoStats, FilterOptions } from '../types';
import { todoApi, categoryApi } from '../services/api';

interface TodoState {
  todos: Todo[];
  categories: Category[];
  stats: TodoStats | null;
  loading: boolean;
  error: string | null;
  filters: FilterOptions;
}

type TodoAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_TODOS'; payload: Todo[] }
  | { type: 'ADD_TODO'; payload: Todo }
  | { type: 'UPDATE_TODO'; payload: Todo }
  | { type: 'DELETE_TODO'; payload: string }
  | { type: 'SET_CATEGORIES'; payload: Category[] }
  | { type: 'SET_STATS'; payload: TodoStats }
  | { type: 'SET_FILTERS'; payload: Partial<FilterOptions> };

const initialState: TodoState = {
  todos: [],
  categories: [],
  stats: null,
  loading: false,
  error: null,
  filters: {
    searchQuery: '',
    category: '',
    priority: '',
    isCompleted: undefined,
    sortBy: 'createdDate',
    sortOrder: 'desc'
  }
};

const todoReducer = (state: TodoState, action: TodoAction): TodoState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_TODOS':
      return { ...state, todos: action.payload };
    case 'ADD_TODO':
      return { ...state, todos: [...state.todos, action.payload] };
    case 'UPDATE_TODO':
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload.id ? action.payload : todo
        )
      };
    case 'DELETE_TODO':
      return {
        ...state,
        todos: state.todos.filter(todo => todo.id !== action.payload)
      };
    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload };
    case 'SET_STATS':
      return { ...state, stats: action.payload };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    default:
      return state;
  }
};

interface TodoContextValue extends TodoState {
  loadTodos: () => Promise<void>;
  addTodo: (todo: Omit<Todo, 'id' | 'createdDate'>) => Promise<void>;
  updateTodo: (id: string, updates: Partial<Todo>) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  toggleTodoComplete: (id: string) => Promise<void>;
  loadCategories: () => Promise<void>;
  loadStats: () => Promise<void>;
  updateFilters: (filters: Partial<FilterOptions>) => void;
}

const TodoContext = createContext<TodoContextValue | undefined>(undefined);

export const TodoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(todoReducer, initialState);

  const loadTodos = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const todos = await todoApi.getAll();
      dispatch({ type: 'SET_TODOS', payload: todos });
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load todos' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const addTodo = async (todoData: Omit<Todo, 'id' | 'createdDate'>) => {
    try {
      const newTodo = await todoApi.create({
        title: todoData.title,
        description: todoData.description,
        priority: todoData.priority,
        category: todoData.category,
        dueDate: todoData.dueDate?.toISOString(),
        tags: todoData.tags
      });
      dispatch({ type: 'ADD_TODO', payload: newTodo });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create todo' });
    }
  };

  const toggleTodoComplete = async (id: string) => {
    try {
      const updatedTodo = await todoApi.toggleComplete(id);
      dispatch({ type: 'UPDATE_TODO', payload: updatedTodo });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update todo' });
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      await todoApi.delete(id);
      dispatch({ type: 'DELETE_TODO', payload: id });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete todo' });
    }
  };

  const updateFilters = (filters: Partial<FilterOptions>) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  };

  // Load initial data
  useEffect(() => {
    loadTodos();
    loadCategories();
    loadStats();
  }, []);

  const value: TodoContextValue = {
    ...state,
    loadTodos,
    addTodo,
    updateTodo: async () => {}, // Implementation similar to above
    deleteTodo,
    toggleTodoComplete,
    loadCategories: async () => {}, // Implementation similar to loadTodos
    loadStats: async () => {}, // Implementation similar to loadTodos
    updateFilters
  };

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
};

export const useTodoContext = () => {
  const context = useContext(TodoContext);
  if (context === undefined) {
    throw new Error('useTodoContext must be used within a TodoProvider');
  }
  return context;
};
```
```

### Step 8: Create TodoList Page Component

The TodosPage demonstrates advanced React patterns with filtering, sorting, and state management:

```tsx
// TodoList/frontend/src/pages/TodosPage.tsx
import React, { useState, useMemo } from 'react';
import { useTodoContext } from '../context/TodoContext';
import { usePageTitle } from '../hooks/usePageTitle';
import { useTodoFilter } from '../hooks/useTodoFilter';
import { Todo, Priority } from '../types';

const TodosPage: React.FC = () => {
  usePageTitle('Todos');
  
  const {
    todos,
    categories,
    loading,
    error,
    addTodo,
    toggleTodoComplete,
    deleteTodo,
    filters,
    updateFilters
  } = useTodoContext();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTodo, setNewTodo] = useState({
    title: '',
    description: '',
    priority: 'medium' as Priority,
    category: '',
    dueDate: '',
    tags: [] as string[]
  });

  // Custom hook for filtering and sorting todos
  const filteredTodos = useTodoFilter(todos, filters);

  const handleCreateTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addTodo({
        ...newTodo,
        dueDate: newTodo.dueDate ? new Date(newTodo.dueDate) : undefined,
        isCompleted: false
      });
      setNewTodo({
        title: '',
        description: '',
        priority: 'medium',
        category: '',
        dueDate: '',
        tags: []
      });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create todo:', error);
    }
  };

  const handleFilterChange = (key: keyof typeof filters, value: any) => {
    updateFilters({ [key]: value });
  };

  const getPriorityColor = (priority: Priority): string => {
    const colors = {
      low: '#28a745',
      medium: '#ffc107',
      high: '#fd7e14',
      urgent: '#dc3545'
    };
    return colors[priority];
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  if (loading) return <div className="loading">Loading todos...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="todos-page">
      <div className="page-header">
        <h1>Todo Management</h1>
        <button
          className="btn-primary"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Cancel' : 'Add New Todo'}
        </button>
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Search todos..."
            value={filters.searchQuery}
            onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="filter-select"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <select
            value={filters.priority}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
            className="filter-select"
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <div className="filter-group">
          <select
            value={filters.isCompleted?.toString() || ''}
            onChange={(e) => handleFilterChange('isCompleted', 
              e.target.value === '' ? undefined : e.target.value === 'true'
            )}
            className="filter-select"
          >
            <option value="">All Status</option>
            <option value="false">Pending</option>
            <option value="true">Completed</option>
          </select>
        </div>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="create-form-container">
          <form onSubmit={handleCreateTodo} className="create-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="title">Title</label>
                <input
                  type="text"
                  id="title"
                  value={newTodo.title}
                  onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="priority">Priority</label>
                <select
                  id="priority"
                  value={newTodo.priority}
                  onChange={(e) => setNewTodo({ ...newTodo, priority: e.target.value as Priority })}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={newTodo.description}
                onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  value={newTodo.category}
                  onChange={(e) => setNewTodo({ ...newTodo, category: e.target.value })}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="dueDate">Due Date</label>
                <input
                  type="date"
                  id="dueDate"
                  value={newTodo.dueDate}
                  onChange={(e) => setNewTodo({ ...newTodo, dueDate: e.target.value })}
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">Create Todo</button>
              <button 
                type="button" 
                className="btn-secondary"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Todos List */}
      <div className="todos-container">
        {filteredTodos.length === 0 ? (
          <div className="empty-state">
            <p>No todos found matching your filters.</p>
          </div>
        ) : (
          <div className="todos-grid">
            {filteredTodos.map(todo => (
              <div key={todo.id} className={`todo-card ${todo.isCompleted ? 'completed' : ''}`}>
                <div className="todo-header">
                  <h3 className="todo-title">{todo.title}</h3>
                  <div className="todo-actions">
                    <button
                      className="btn-toggle"
                      onClick={() => toggleTodoComplete(todo.id)}
                      title={todo.isCompleted ? 'Mark as pending' : 'Mark as completed'}
                    >
                      {todo.isCompleted ? '↩️' : '✅'}
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this todo?')) {
                          deleteTodo(todo.id);
                        }
                      }}
                      title="Delete todo"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <p className="todo-description">{todo.description}</p>

                <div className="todo-meta">
                  <span 
                    className="priority-badge"
                    style={{ backgroundColor: getPriorityColor(todo.priority) }}
                  >
                    {todo.priority.toUpperCase()}
                  </span>
                  <span className="category-badge">{todo.category}</span>
                </div>

                <div className="todo-footer">
                  <span className="created-date">
                    Created: {formatDate(todo.createdDate)}
                  </span>
                  {todo.dueDate && (
                    <span className={`due-date ${todo.dueDate < new Date() ? 'overdue' : ''}`}>
                      Due: {formatDate(todo.dueDate)}
                    </span>
                  )}
                </div>

                {todo.tags.length > 0 && (
                  <div className="todo-tags">
                    {todo.tags.map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TodosPage;
```

### Step 9: Set Up Application Routing and Layout

The TodoList application demonstrates a clean routing structure with layout components:

```tsx
// TodoList/frontend/src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import { TodoProvider } from './context/TodoContext';
import HomePage from './pages/HomePage';
import TodosPage from './pages/TodosPage';
import CategoriesPage from './pages/CategoriesPage';
import AboutPage from './pages/AboutPage';
import NotFoundPage from './pages/NotFoundPage';
import { testApiConnection } from './utils/apiTest';
import './index.css';

// Test API connection on app startup
testApiConnection();

function App() {
  return (
    <TodoProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/todos" element={<TodosPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Layout>
      </Router>
    </TodoProvider>
  );
}

export default App;
```

### Layout Component with Navigation

```tsx
// TodoList/frontend/src/components/layout/Layout.tsx
import React, { ReactNode } from 'react';
import Navigation from './Navigation';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="app-layout">
      <Navigation />
      <main className="main-content">
        <div className="container">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
```

### Navigation Component

```tsx
// TodoList/frontend/src/components/layout/Navigation.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTodoContext } from '../../context/TodoContext';

const Navigation: React.FC = () => {
  const location = useLocation();
  const { stats } = useTodoContext();

  const isActive = (path: string): boolean => {
    return location.pathname === path;
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        <Link to="/" className="nav-brand">
          <h1>TodoList App</h1>
        </Link>
        
        <ul className="nav-menu">
          <li className="nav-item">
            <Link 
              to="/" 
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
            >
              🏠 Dashboard
            </Link>
          </li>
          
          <li className="nav-item">
            <Link 
              to="/todos" 
              className={`nav-link ${isActive('/todos') ? 'active' : ''}`}
            >
              📝 Todos
              {stats && stats.totalTodos > 0 && (
                <span className="nav-badge">{stats.totalTodos}</span>
              )}
            </Link>
          </li>
          
          <li className="nav-item">
            <Link 
              to="/categories" 
              className={`nav-link ${isActive('/categories') ? 'active' : ''}`}
            >
              📂 Categories
              {stats && stats.totalCategories > 0 && (
                <span className="nav-badge">{stats.totalCategories}</span>
              )}
            </Link>
          </li>
          
          <li className="nav-item">
            <Link 
              to="/about" 
              className={`nav-link ${isActive('/about') ? 'active' : ''}`}
            >
              ℹ️ About
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;
```

### Custom Hooks for Enhanced Functionality

The TodoList demonstrates several custom hooks for reusable logic:

```typescript
// TodoList/frontend/src/hooks/useTodoFilter.ts
import { useMemo } from 'react';
import { Todo, FilterOptions } from '../types';

export const useTodoFilter = (todos: Todo[], filters: FilterOptions): Todo[] => {
  return useMemo(() => {
    let filtered = [...todos];

    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(todo =>
        todo.title.toLowerCase().includes(query) ||
        todo.description.toLowerCase().includes(query) ||
        todo.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(todo => todo.category === filters.category);
    }

    // Priority filter
    if (filters.priority) {
      filtered = filtered.filter(todo => todo.priority === filters.priority);
    }

    // Completion status filter
    if (filters.isCompleted !== undefined) {
      filtered = filtered.filter(todo => todo.isCompleted === filters.isCompleted);
    }

    // Sorting
    filtered.sort((a, b) => {
      const aValue = a[filters.sortBy];
      const bValue = b[filters.sortBy];
      
      let comparison = 0;
      if (aValue < bValue) comparison = -1;
      if (aValue > bValue) comparison = 1;
      
      return filters.sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [todos, filters]);
};
```

```typescript
// TodoList/frontend/src/hooks/usePageTitle.ts
import { useEffect } from 'react';

export const usePageTitle = (title: string): void => {
  useEffect(() => {
    const originalTitle = document.title;
    document.title = `${title} - TodoList App`;
    
    return () => {
      document.title = originalTitle;
    };
  }, [title]);
};
```

### Step 10: Modern CSS Styling with TodoList Theme

The TodoList application uses modern CSS with custom properties and responsive design:

```css
/* TodoList/frontend/src/index.css */
:root {
  /* Color Palette */
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --success-color: #28a745;
  --warning-color: #ffc107;
  --danger-color: #dc3545;
  --info-color: #17a2b8;
  
  /* Priority Colors */
  --priority-low: #28a745;
  --priority-medium: #ffc107;
  --priority-high: #fd7e14;
  --priority-urgent: #dc3545;
  
  /* Background Colors */
  --bg-primary: #ffffff;
  --bg-secondary: #f8f9fa;
  --bg-dark: #343a40;
  
  /* Text Colors */
  --text-primary: #333333;
  --text-secondary: #6c757d;
  --text-light: #ffffff;
  
  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  
  /* Border Radius */
  --border-radius-sm: 0.25rem;
  --border-radius-md: 0.5rem;
  --border-radius-lg: 0.75rem;
  
  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  color: var(--text-primary);
  background-color: var(--bg-secondary);
  font-size: 16px;
}

/* Layout Components */
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.navigation {
  background-color: var(--bg-dark);
  color: var(--text-light);
  padding: var(--spacing-md) 0;
  box-shadow: var(--shadow-md);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-md);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-brand h1 {
  color: var(--text-light);
  text-decoration: none;
  font-size: 1.5rem;
  font-weight: 600;
}

.nav-menu {
  display: flex;
  list-style: none;
  gap: var(--spacing-lg);
}

.nav-link {
  color: var(--text-light);
  text-decoration: none;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-md);
  transition: background-color 0.3s ease;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.nav-link:hover,
.nav-link.active {
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-badge {
  background-color: var(--primary-color);
  color: var(--text-light);
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: bold;
}

/* Main Content */
.main-content {
  flex: 1;
  padding: var(--spacing-xl) 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-md);
}

/* Page Components */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
  padding-bottom: var(--spacing-md);
  border-bottom: 2px solid var(--bg-secondary);
}

.page-header h1 {
  color: var(--text-primary);
  font-size: 2rem;
  font-weight: 700;
}

/* Todo Cards */
.todos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: var(--spacing-lg);
  margin-top: var(--spacing-lg);
}

.todo-card {
  background: var(--bg-primary);
  border: 1px solid #e9ecef;
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.todo-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.todo-card.completed {
  opacity: 0.7;
  background-color: #f8f9fa;
}

.todo-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-md);
}

.todo-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  flex: 1;
}

.todo-actions {
  display: flex;
  gap: var(--spacing-xs);
}

.btn-toggle,
.btn-delete {
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: var(--border-radius-sm);
  font-size: 1.2rem;
  transition: background-color 0.2s ease;
}

.btn-toggle:hover {
  background-color: rgba(40, 167, 69, 0.1);
}

.btn-delete:hover {
  background-color: rgba(220, 53, 69, 0.1);
}

.todo-description {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-md);
  line-height: 1.5;
}

.todo-meta {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.priority-badge,
.category-badge {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.priority-badge {
  color: var(--text-light);
}

.category-badge {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid #e9ecef;
}

.todo-footer {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: var(--spacing-sm);
}

.due-date.overdue {
  color: var(--danger-color);
  font-weight: 600;
}

.todo-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
}

.tag {
  background-color: var(--info-color);
  color: var(--text-light);
  padding: 2px 6px;
  border-radius: var(--border-radius-sm);
  font-size: 0.75rem;
}

/* Forms */
.create-form-container {
  background: var(--bg-primary);
  border: 1px solid #e9ecef;
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
}

.create-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: 600;
  margin-bottom: var(--spacing-xs);
  color: var(--text-primary);
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid #ced4da;
  border-radius: var(--border-radius-md);
  font-size: 1rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

/* Buttons */
.btn-primary,
.btn-secondary {
  padding: var(--spacing-sm) var(--spacing-lg);
  border: none;
  border-radius: var(--border-radius-md);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.1s ease;
}

.btn-primary {
  background-color: var(--primary-color);
  color: var(--text-light);
}

.btn-primary:hover {
  background-color: #0056b3;
  transform: translateY(-1px);
}

.btn-secondary {
  background-color: var(--secondary-color);
  color: var(--text-light);
}

.btn-secondary:hover {
  background-color: #545b62;
}

/* Filters */
.filters-section {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-lg);
  background: var(--bg-primary);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
}

.search-input,
.filter-select {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid #ced4da;
  border-radius: var(--border-radius-md);
  font-size: 1rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .nav-container {
    flex-direction: column;
    gap: var(--spacing-md);
  }
  
  .nav-menu {
    flex-direction: column;
    width: 100%;
    text-align: center;
  }
  
  .page-header {
    flex-direction: column;
    gap: var(--spacing-md);
    align-items: stretch;
  }
  
  .todos-grid {
    grid-template-columns: 1fr;
  }
  
  .filters-section {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
}

/* Loading and Error States */
.loading,
.error {
  text-align: center;
  padding: var(--spacing-xl);
  font-size: 1.1rem;
}

.error {
  color: var(--danger-color);
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: var(--border-radius-md);
}

.empty-state {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--text-secondary);
}
```

### Step 11: Running the TodoList Application

The TodoList application is now complete and demonstrates a modern full-stack architecture with comprehensive features.

## 🚀 Getting Started with TodoList

### Prerequisites
- Node.js 18+ and npm
- .NET 8 SDK
- Modern web browser

### Running the Application

1. **Start the Backend API**
```bash
cd TodoList/backend/TodoListApi
dotnet restore
dotnet run --urls "http://localhost:5001"
```

The backend will be available at:
- API: http://localhost:5001
- Swagger UI: http://localhost:5001 (API documentation)

2. **Start the Frontend** (in a new terminal)
```bash
cd TodoList/frontend
npm install
npm run dev
```

The frontend will be available at: http://localhost:5173

### API Testing

You can test the API using the included HTTP file:

```bash
# Using VS Code with REST Client extension
# Open TodoList/backend/TodoListApi/api-tests.http
```

### Application Features Demonstrated

**Backend (.NET 8 Minimal API)**
- ✅ RESTful API design with proper HTTP verbs and status codes
- ✅ Service layer architecture with dependency injection  
- ✅ Data Transfer Objects (DTOs) for API contracts
- ✅ Comprehensive error handling and validation
- ✅ Swagger/OpenAPI documentation
- ✅ CORS configuration for cross-origin requests
- ✅ Route grouping and endpoint organization

**Frontend (React + TypeScript)**
- ✅ Modern React with hooks and context API
- ✅ TypeScript for type safety and better developer experience
- ✅ Responsive design with CSS custom properties
- ✅ Advanced filtering and searching capabilities
- ✅ Real-time statistics and data visualization
- ✅ Custom hooks for reusable logic
- ✅ Error boundaries and loading states
- ✅ Routing with React Router v6

**Development Best Practices**
- ✅ Clean architecture with separation of concerns
- ✅ Consistent error handling across frontend and backend
- ✅ Type-safe API communication
- ✅ Responsive and accessible UI design
- ✅ Performance optimization with useMemo and useCallback
- ✅ Code organization with logical folder structure

## 🔧 Development Tools and Extensions

**Recommended VS Code Extensions for .NET + React Development:**
- C# Dev Kit (Microsoft)
- REST Client (for API testing)
- ES7+ React/Redux/React-Native snippets
- Auto Rename Tag
- Prettier - Code formatter
- ESLint
- Thunder Client (alternative to Postman)

**Useful Commands:**
```bash
# Backend
dotnet watch run              # Hot reload for backend
dotnet ef migrations add      # Entity Framework migrations (if using)
dotnet test                   # Run unit tests

# Frontend  
npm run dev                   # Development server with hot reload
npm run build                 # Production build
npm run preview               # Preview production build
npm run lint                  # Run ESLint
```

This TodoList application demonstrates production-ready patterns for building scalable full-stack applications with .NET and React, serving as an excellent foundation for more complex projects.
