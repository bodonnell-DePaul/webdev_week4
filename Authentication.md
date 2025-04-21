# Adding Basic Authentication to the .NET API and React Application

Basic Authentication is a simple authentication scheme that sends user credentials (username and password) in an HTTP header. While not the most secure for production, it's a good starting point to understand authentication flows.

## Step 1: Add Authentication to the .NET API

First, let's modify our .NET API to include Basic Authentication:

```csharp
// Add these at the top with other using statements
using System.Text;
using System.Net.Http.Headers;

var builder = WebApplication.CreateBuilder(args);

// Existing CORS and Swagger configurations...

// Add a simple user repository
var users = new Dictionary<string, string>
{
    { "admin", "password123" }, // In production, use hashed passwords!
    { "user", "userpass" }
};

var app = builder.Build();

// Configure middleware
app.UseCors("AllowReactApp");

// Basic authentication middleware
app.Use(async (context, next) =>
{
    // Skip authentication for OPTIONS requests (CORS preflight)
    if (context.Request.Method == "OPTIONS")
    {
        await next();
        return;
    }
    
    // Skip auth for Swagger documentation
    if (context.Request.Path.StartsWithSegments("/swagger"))
    {
        await next();
        return;
    }

    // Check if authorization header exists
    if (!context.Request.Headers.TryGetValue("Authorization", out var authHeader))
    {
        context.Response.StatusCode = 401; // Unauthorized
        context.Response.Headers.Add("WWW-Authenticate", "Basic");
        return;
    }

    try
    {
        var authHeaderVal = AuthenticationHeaderValue.Parse(authHeader);

        // Check if it's Basic auth
        if (authHeaderVal.Scheme.Equals("Basic", StringComparison.OrdinalIgnoreCase))
        {
            var credentialBytes = Convert.FromBase64String(authHeaderVal.Parameter ?? string.Empty);
            var credentials = Encoding.UTF8.GetString(credentialBytes).Split(':');
            var username = credentials[0];
            var password = credentials[1];

            // Validate credentials
            if (users.TryGetValue(username, out var storedPassword) && password == storedPassword)
            {
                // Add the username as a claim for later use if needed
                context.Items["Username"] = username;
                await next();
                return;
            }
        }

        // Auth failed
        context.Response.StatusCode = 401;
        context.Response.Headers.Add("WWW-Authenticate", "Basic");
        return;
    }
    catch
    {
        context.Response.StatusCode = 401;
        context.Response.Headers.Add("WWW-Authenticate", "Basic");
        return;
    }
});

// Existing middleware configurations...
```

## Step 2: Update the React API Service

Now, let's update our API service in React to include authentication headers:

```typescript
// New authentication service
export const authService = {
  // Store credentials in memory (for demo purposes)
  credentials: {
    username: '',
    password: ''
  },

  // Set the credentials
  setCredentials(username: string, password: string): void {
    this.credentials.username = username;
    this.credentials.password = password;
  },

  // Get the Authorization header
  getAuthHeader(): string {
    if (!this.credentials.username) return '';
    
    const base64Credentials = btoa(`${this.credentials.username}:${this.credentials.password}`);
    return `Basic ${base64Credentials}`;
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.credentials.username;
  },

  // Clear credentials (logout)
  clearCredentials(): void {
    this.credentials.username = '';
    this.credentials.password = '';
  }
};
```

Now modify the API service to include the authentication header:

```typescript
import axios from 'axios';
import { Book } from '../types/Book';
import { authService } from './authService';

const API_URL = 'https://localhost:7210/api';

// Create axios instance with interceptor
const apiClient = axios.create({
  baseURL: API_URL
});

// Add request interceptor to include auth header
apiClient.interceptors.request.use(config => {
  const authHeader = authService.getAuthHeader();
  if (authHeader) {
    config.headers.Authorization = authHeader;
  }
  return config;
});

export const bookApi = {
  getAll: async (): Promise<Book[]> => {
    const response = await apiClient.get<Book[]>('/books');
    return response.data;
  },

  getById: async (id: number): Promise<Book> => {
    const response = await apiClient.get<Book>(`/books/${id}`);
    return response.data;
  },

  create: async (book: Book): Promise<Book> => {
    const response = await apiClient.post<Book>('/books', book);
    return response.data;
  },

  update: async (id: number, book: Book): Promise<void> => {
    await apiClient.put(`/books/${id}`, book);
  },

  updateAvailability: async (id: number, isAvailable: boolean): Promise<void> => {
    await apiClient.patch(`/books/${id}/availability`, isAvailable);
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/books/${id}`);
  }
};
```

## Step 3: Create Login Component

```tsx
import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { authService } from '../services/authService';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Redirect if already logged in
  if (authService.isAuthenticated()) {
    return <Navigate to="/" />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError('Username and password are required');
      return;
    }

    try {
      // Set the credentials
      authService.setCredentials(username, password);
      
      // Test the credentials by making a request
      await bookApi.getAll();
      
      // If no error was thrown, redirect to home
      navigate('/');
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('Invalid username or password');
      } else {
        setError('An error occurred. Please try again.');
      }
      // Clear credentials on failed login
      authService.clearCredentials();
    }
  };

  return (
    <div className="login-form">
      <h2>Login to Book Manager</h2>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <button type="submit" className="btn-primary">Login</button>
      </form>
    </div>
  );
};

export default Login;
```

## Step 4: Create Auth Protection for Routes

```tsx
import { Navigate } from 'react-router-dom';
import { authService } from '../services/authService';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // If not authenticated, redirect to login
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
```

## Step 5: Update App Component with Routes

```tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import BookList from './components/BookList';
import BookForm from './components/BookForm';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <div className="content">
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/" element={
              <ProtectedRoute>
                <BookList />
              </ProtectedRoute>
            } />
            
            <Route path="/add" element={
              <ProtectedRoute>
                <BookForm />
              </ProtectedRoute>
            } />
            
            <Route path="/edit/:id" element={
              <ProtectedRoute>
                <BookForm />
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
```

## Step 6: Create a Navbar Component

```tsx
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

const Navbar = () => {
  const navigate = useNavigate();
  const isAuthenticated = authService.isAuthenticated();
  
  const handleLogout = () => {
    authService.clearCredentials();
    navigate('/login');
  };
  
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">Book Manager</Link>
      </div>
      
      <div className="navbar-menu">
        {isAuthenticated ? (
          <>
            <Link to="/" className="navbar-item">Books</Link>
            <Link to="/add" className="navbar-item">Add Book</Link>
            <button onClick={handleLogout} className="btn-logout">Logout</button>
          </>
        ) : (
          <Link to="/login" className="navbar-item">Login</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
```

## Step 7: Error Handling for 401 Unauthorized Responses

```typescript
// Add this to book-manager/src/services/bookApi.ts
// Response interceptor to handle authentication errors
apiClient.interceptors.response.use(
  response => response,
  error => {
    // If 401 Unauthorized and not on login page, redirect to login
    if (error.response?.status === 401 && window.location.pathname !== '/login') {
      authService.clearCredentials();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

## Security Considerations for Production

1. **Don't use Basic Auth without HTTPS**: Basic Authentication sends credentials in base64 encoding which is easily decoded if intercepted.

2. **Consider token-based authentication**: For production, consider using JWT (JSON Web Tokens) or OAuth 2.0 instead.

3. **Never store passwords in plain text**: In the API, use password hashing with a library like BCrypt.

4. **Implement proper session management**: For a real application, implement proper session timeouts and refreshes.

5. **Store credentials securely**: For a production app, consider using HTTP-only cookies or secure storage methods instead of in-memory storage.

This implementation provides a simple but functional authentication system that demonstrates the key concepts of protecting routes and API endpoints.

