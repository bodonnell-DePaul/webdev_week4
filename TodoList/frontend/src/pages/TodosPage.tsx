import { useState } from 'react';
import { usePageTitle } from '../hooks/usePageTitle';
import { useTodos } from '../context/TodoContext';
import { useTodoFilter } from '../hooks/useTodoFilter';
import { Todo, Priority } from '../types';

const TodosPage = () => {
  usePageTitle('Todos');
  const { 
    todos, 
    addTodo, 
    updateTodo, 
    deleteTodo, 
    toggleTodoComplete,
    categories,
    searchQuery,
    setSearchQuery,
    loading,
    error
  } = useTodos();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [sortBy, setSortBy] = useState<'title' | 'priority' | 'dueDate' | 'createdDate'>('createdDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredTodos = useTodoFilter(todos, {
    searchQuery,
    category: filterCategory,
    priority: filterPriority,
    sortBy,
    sortOrder
  });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as Priority,
    category: categories[0]?.name || '',
    dueDate: '',
    tags: [] as string[]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTodo) {
        await updateTodo(editingTodo.id, {
          ...formData,
          dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined
        });
        setEditingTodo(null);
      } else {
        await addTodo({
          ...formData,
          isCompleted: false,
          dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined
        });
      }
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        category: categories[0]?.name || '',
        dueDate: '',
        tags: []
      });
      setShowAddForm(false);
    } catch (err) {
      console.error('Failed to save todo:', err);
      // Error is handled by the context, but you could show a toast notification here
    }
  };

  const handleEdit = (todo: Todo) => {
    setEditingTodo(todo);
    setFormData({
      title: todo.title,
      description: todo.description,
      priority: todo.priority,
      category: todo.category,
      dueDate: todo.dueDate ? new Date(todo.dueDate).toISOString().split('T')[0] : '',
      tags: todo.tags
    });
    setShowAddForm(true);
  };

  const priorityColors = {
    urgent: '#ef4444',
    high: '#f97316',
    medium: '#eab308',
    low: '#22c55e'
  };

  if (loading) {
    return (
      <div className="todos-page">
        <div className="loading-state">
          <p>Loading todos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="todos-page">
        <div className="error-state">
          <p>Error: {error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="todos-page">
      <div className="page-header">
        <h1>📝 Todos Management</h1>
        <button 
          className="btn-primary"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? 'Cancel' : '+ Add Todo'}
        </button>
      </div>

      <div className="filters-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search todos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filters">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="filter-select"
          >
            <option value="createdDate">Created Date</option>
            <option value="title">Title</option>
            <option value="priority">Priority</option>
            <option value="dueDate">Due Date</option>
          </select>

          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="sort-toggle"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="todo-form-container">
          <form onSubmit={handleSubmit} className="todo-form">
            <h3>{editingTodo ? 'Edit Todo' : 'Add New Todo'}</h3>
            
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div className="form-group">
                <label>Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Due Date</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {editingTodo ? 'Update Todo' : 'Add Todo'}
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setShowAddForm(false);
                  setEditingTodo(null);
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="todos-list">
        {filteredTodos.length === 0 ? (
          <div className="empty-state">
            <p>No todos found. Add your first todo to get started!</p>
          </div>
        ) : (
          <div className="todos-grid">
            {filteredTodos.map(todo => (
              <div key={todo.id} className={`todo-card ${todo.isCompleted ? 'completed' : ''}`}>
                <div className="todo-header">
                  <div className="todo-priority" style={{ backgroundColor: priorityColors[todo.priority] }}>
                    {todo.priority.toUpperCase()}
                  </div>
                  <div className="todo-actions">
                    <button onClick={() => handleEdit(todo)} className="btn-edit">
                      ✏️
                    </button>
                    <button onClick={async () => {
                      try {
                        await deleteTodo(todo.id);
                      } catch (err) {
                        console.error('Failed to delete todo:', err);
                      }
                    }} className="btn-delete">
                      🗑️
                    </button>
                  </div>
                </div>

                <div className="todo-content">
                  <h3 className={todo.isCompleted ? 'completed-text' : ''}>
                    {todo.title}
                  </h3>
                  <p className="todo-description">{todo.description}</p>
                  
                  <div className="todo-meta">
                    <span className="todo-category">{todo.category}</span>
                    {todo.dueDate && (
                      <span className={`todo-due ${new Date(todo.dueDate) < new Date() && !todo.isCompleted ? 'overdue' : ''}`}>
                        Due: {new Date(todo.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {todo.tags.length > 0 && (
                    <div className="todo-tags">
                      {todo.tags.map(tag => (
                        <span key={tag} className="tag">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="todo-footer">
                  <button
                    onClick={async () => {
                      try {
                        await toggleTodoComplete(todo.id);
                      } catch (err) {
                        console.error('Failed to toggle todo:', err);
                      }
                    }}
                    className={`btn-toggle ${todo.isCompleted ? 'completed' : 'pending'}`}
                  >
                    {todo.isCompleted ? '✅ Completed' : '⏳ Mark Complete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TodosPage;
