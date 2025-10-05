using TodoListApi.Models;

namespace TodoListApi.Services;

public interface ITodoService
{
    Task<IEnumerable<Todo>> GetAllTodosAsync();
    Task<Todo?> GetTodoByIdAsync(string id);
    Task<Todo> CreateTodoAsync(Todo todo);
    Task<Todo?> UpdateTodoAsync(string id, Todo updatedTodo);
    Task<bool> DeleteTodoAsync(string id);
    Task<TodoStats> GetStatsAsync();
}

public interface ICategoryService
{
    Task<IEnumerable<Category>> GetAllCategoriesAsync();
    Task<Category?> GetCategoryByIdAsync(string id);
    Task<Category> CreateCategoryAsync(Category category);
    Task<Category?> UpdateCategoryAsync(string id, Category updatedCategory);
    Task<bool> DeleteCategoryAsync(string id);
}

public class InMemoryTodoService : ITodoService
{
    private readonly List<Todo> _todos;
    private readonly ICategoryService _categoryService;

    public InMemoryTodoService(ICategoryService categoryService)
    {
        _categoryService = categoryService;
        _todos = new List<Todo>
        {
            new Todo
            {
                Id = "1",
                Title = "Complete project proposal",
                Description = "Write and submit the final project proposal for CSC436",
                Priority = Priority.High,
                Category = "Academic",
                IsCompleted = false,
                CreatedDate = DateTime.UtcNow.AddDays(-3),
                DueDate = DateTime.UtcNow.AddDays(11),
                Tags = new List<string> { "project", "academic", "deadline" }
            },
            new Todo
            {
                Id = "2",
                Title = "Grocery shopping",
                Description = "Buy groceries for the week including fruits and vegetables",
                Priority = Priority.Medium,
                Category = "Personal",
                IsCompleted = true,
                CreatedDate = DateTime.UtcNow.AddDays(-2),
                DueDate = DateTime.UtcNow.AddDays(1),
                Tags = new List<string> { "shopping", "food", "weekly" }
            },
            new Todo
            {
                Id = "3",
                Title = "Team meeting preparation",
                Description = "Prepare slides and agenda for the weekly team meeting",
                Priority = Priority.High,
                Category = "Work",
                IsCompleted = false,
                CreatedDate = DateTime.UtcNow.AddDays(-1),
                DueDate = DateTime.UtcNow.AddDays(4),
                Tags = new List<string> { "meeting", "presentation", "team" }
            },
            new Todo
            {
                Id = "4",
                Title = "Exercise routine",
                Description = "Complete 30-minute workout including cardio and strength training",
                Priority = Priority.Medium,
                Category = "Health",
                IsCompleted = false,
                CreatedDate = DateTime.UtcNow,
                Tags = new List<string> { "fitness", "health", "routine" }
            },
            new Todo
            {
                Id = "5",
                Title = "Read React documentation",
                Description = "Study advanced React patterns including Context API and custom hooks",
                Priority = Priority.Low,
                Category = "Learning",
                IsCompleted = false,
                CreatedDate = DateTime.UtcNow,
                Tags = new List<string> { "learning", "react", "documentation" }
            }
        };
    }

    public Task<IEnumerable<Todo>> GetAllTodosAsync()
    {
        return Task.FromResult(_todos.AsEnumerable());
    }

    public Task<Todo?> GetTodoByIdAsync(string id)
    {
        var todo = _todos.FirstOrDefault(t => t.Id == id);
        return Task.FromResult(todo);
    }

    public Task<Todo> CreateTodoAsync(Todo todo)
    {
        todo.Id = Guid.NewGuid().ToString();
        todo.CreatedDate = DateTime.UtcNow;
        _todos.Add(todo);
        return Task.FromResult(todo);
    }

    public Task<Todo?> UpdateTodoAsync(string id, Todo updatedTodo)
    {
        var existingTodo = _todos.FirstOrDefault(t => t.Id == id);
        if (existingTodo == null)
            return Task.FromResult<Todo?>(null);

        existingTodo.Title = updatedTodo.Title;
        existingTodo.Description = updatedTodo.Description;
        existingTodo.Priority = updatedTodo.Priority;
        existingTodo.Category = updatedTodo.Category;
        existingTodo.IsCompleted = updatedTodo.IsCompleted;
        existingTodo.DueDate = updatedTodo.DueDate;
        existingTodo.Tags = updatedTodo.Tags;

        return Task.FromResult<Todo?>(existingTodo);
    }

    public Task<bool> DeleteTodoAsync(string id)
    {
        var todo = _todos.FirstOrDefault(t => t.Id == id);
        if (todo == null)
            return Task.FromResult(false);

        _todos.Remove(todo);
        return Task.FromResult(true);
    }

    public Task<TodoStats> GetStatsAsync()
    {
        var completedTodos = _todos.Count(t => t.IsCompleted);
        var overdueTodos = _todos.Count(t => !t.IsCompleted && t.DueDate.HasValue && t.DueDate < DateTime.UtcNow);

        var todosByCategory = _todos
            .GroupBy(t => t.Category)
            .ToDictionary(g => g.Key, g => g.Count());

        var todosByPriority = _todos
            .GroupBy(t => t.Priority.ToString())
            .ToDictionary(g => g.Key, g => g.Count());

        var stats = new TodoStats
        {
            TotalTodos = _todos.Count,
            CompletedTodos = completedTodos,
            PendingTodos = _todos.Count - completedTodos,
            TotalCategories = todosByCategory.Keys.Count,
            TodosByCategory = todosByCategory,
            TodosByPriority = todosByPriority,
            OverdueTodos = overdueTodos
        };

        return Task.FromResult(stats);
    }
}

public class InMemoryCategoryService : ICategoryService
{
    private readonly List<Category> _categories;

    public InMemoryCategoryService()
    {
        _categories = new List<Category>
        {
            new Category { Id = "1", Name = "Academic", Description = "School and university related tasks", Color = "#3b82f6" },
            new Category { Id = "2", Name = "Personal", Description = "Personal life and household tasks", Color = "#10b981" },
            new Category { Id = "3", Name = "Work", Description = "Professional and career related tasks", Color = "#f59e0b" },
            new Category { Id = "4", Name = "Health", Description = "Health and fitness related activities", Color = "#ef4444" },
            new Category { Id = "5", Name = "Learning", Description = "Learning and skill development", Color = "#8b5cf6" }
        };
    }

    public Task<IEnumerable<Category>> GetAllCategoriesAsync()
    {
        return Task.FromResult(_categories.AsEnumerable());
    }

    public Task<Category?> GetCategoryByIdAsync(string id)
    {
        var category = _categories.FirstOrDefault(c => c.Id == id);
        return Task.FromResult(category);
    }

    public Task<Category> CreateCategoryAsync(Category category)
    {
        category.Id = Guid.NewGuid().ToString();
        _categories.Add(category);
        return Task.FromResult(category);
    }

    public Task<Category?> UpdateCategoryAsync(string id, Category updatedCategory)
    {
        var existingCategory = _categories.FirstOrDefault(c => c.Id == id);
        if (existingCategory == null)
            return Task.FromResult<Category?>(null);

        existingCategory.Name = updatedCategory.Name;
        existingCategory.Description = updatedCategory.Description;
        existingCategory.Color = updatedCategory.Color;

        return Task.FromResult<Category?>(existingCategory);
    }

    public Task<bool> DeleteCategoryAsync(string id)
    {
        var category = _categories.FirstOrDefault(c => c.Id == id);
        if (category == null)
            return Task.FromResult(false);

        _categories.Remove(category);
        return Task.FromResult(true);
    }
}
