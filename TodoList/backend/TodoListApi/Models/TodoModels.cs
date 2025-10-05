using System.ComponentModel.DataAnnotations;

namespace TodoListApi.Models;

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
    public string Color { get; set; } = "#3b82f6";
    
    public int TodoCount { get; set; } = 0;
}

public class TodoStats
{
    public int TotalTodos { get; set; }
    public int CompletedTodos { get; set; }
    public int PendingTodos { get; set; }
    public int TotalCategories { get; set; }
    public Dictionary<string, int> TodosByCategory { get; set; } = new();
    public Dictionary<string, int> TodosByPriority { get; set; } = new();
    public int OverdueTodos { get; set; }
}
