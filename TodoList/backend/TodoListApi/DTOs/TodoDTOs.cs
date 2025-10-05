using System.ComponentModel.DataAnnotations;
using TodoListApi.Models;

namespace TodoListApi.DTOs;

public class CreateTodoRequest
{
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
    
    public DateTime? DueDate { get; set; }
    
    public List<string> Tags { get; set; } = new();
}

public class UpdateTodoRequest
{
    [StringLength(200)]
    public string? Title { get; set; }
    
    [StringLength(1000)]
    public string? Description { get; set; }
    
    public Priority? Priority { get; set; }
    
    [StringLength(100)]
    public string? Category { get; set; }
    
    public bool? IsCompleted { get; set; }
    
    public DateTime? DueDate { get; set; }
    
    public List<string>? Tags { get; set; }
}

public class CreateCategoryRequest
{
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;
    
    [StringLength(500)]
    public string Description { get; set; } = string.Empty;
    
    [Required]
    [StringLength(7)]
    public string Color { get; set; } = "#3b82f6";
}

public class UpdateCategoryRequest
{
    [StringLength(100)]
    public string? Name { get; set; }
    
    [StringLength(500)]
    public string? Description { get; set; }
    
    [StringLength(7)]
    public string? Color { get; set; }
}

public class TodoResponse
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public bool IsCompleted { get; set; }
    public DateTime CreatedDate { get; set; }
    public DateTime? DueDate { get; set; }
    public List<string> Tags { get; set; } = new();
}

public class CategoryResponse
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public int TodoCount { get; set; }
}
