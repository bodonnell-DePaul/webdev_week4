import { useState } from 'react';
import { usePageTitle } from '../hooks/usePageTitle';
import { useTodos } from '../context/TodoContext';
import { Category } from '../types';

const CategoriesPage = () => {
  usePageTitle('Categories');
  const { categories, addCategory, updateCategory, deleteCategory, todos, loading, error } = useTodos();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3b82f6'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, formData);
        setEditingCategory(null);
      } else {
        await addCategory(formData);
      }
      setFormData({ name: '', description: '', color: '#3b82f6' });
      setShowAddForm(false);
    } catch (err) {
      console.error('Failed to save category:', err);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      color: category.color
    });
    setShowAddForm(true);
  };

  const getCategoryTodoCount = (categoryName: string) => {
    return todos.filter(todo => todo.category === categoryName).length;
  };

  if (loading) {
    return (
      <div className="categories-page">
        <div className="loading-state">
          <p>Loading categories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="categories-page">
        <div className="error-state">
          <p>Error: {error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="categories-page">
      <div className="page-header">
        <h1>📁 Categories Management</h1>
        <button 
          className="btn-primary"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? 'Cancel' : '+ Add Category'}
        </button>
      </div>

      {showAddForm && (
        <div className="category-form-container">
          <form onSubmit={handleSubmit} className="category-form">
            <h3>{editingCategory ? 'Edit Category' : 'Add New Category'}</h3>
            
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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

            <div className="form-group">
              <label>Color</label>
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {editingCategory ? 'Update Category' : 'Add Category'}
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setShowAddForm(false);
                  setEditingCategory(null);
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="categories-grid">
        {categories.map(category => {
          const todoCount = getCategoryTodoCount(category.name);
          return (
            <div key={category.id} className="category-card">
              <div className="category-header">
                <div 
                  className="category-color" 
                  style={{ backgroundColor: category.color }}
                />
                <div className="category-actions">
                  <button onClick={() => handleEdit(category)} className="btn-edit">
                    ✏️
                  </button>
                  <button 
                    onClick={async () => {
                      try {
                        await deleteCategory(category.id);
                      } catch (err) {
                        console.error('Failed to delete category:', err);
                      }
                    }} 
                    className="btn-delete"
                    disabled={todoCount > 0}
                    title={todoCount > 0 ? "Cannot delete category with todos" : "Delete category"}
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div className="category-content">
                <h3>{category.name}</h3>
                <p className="category-description">{category.description}</p>
                
                <div className="category-stats">
                  <div className="stat-item">
                    <span className="stat-value">{todoCount}</span>
                    <span className="stat-label">Todos</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {categories.length === 0 && (
        <div className="empty-state">
          <p>No categories found. Add your first category to organize your todos!</p>
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;
