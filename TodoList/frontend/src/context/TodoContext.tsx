import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { Todo, Category, TodoStats } from '../types';
import { todoApi, categoryApi } from '../services/api';

interface TodoContextType {
  // Todo management
  todos: Todo[];
  addTodo: (todo: Omit<Todo, 'id' | 'createdDate'>) => Promise<void>;
  updateTodo: (id: string, updates: Partial<Todo>) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  toggleTodoComplete: (id: string) => Promise<void>;
  
  // Category management
  categories: Category[];
  addCategory: (category: Omit<Category, 'id' | 'todoCount'>) => Promise<void>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  
  // Search and filter
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedPriority: string;
  setSelectedPriority: (priority: string) => void;
  
  // Statistics
  stats: TodoStats;
  
  // Loading and error states
  loading: boolean;
  error: string | null;
}

const TodoContext = createContext<TodoContextType | undefined>(undefined);

export const TodoProvider = ({ children }: { children: ReactNode }) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [stats, setStats] = useState<TodoStats>({
    totalTodos: 0,
    completedTodos: 0,
    pendingTodos: 0,
    totalCategories: 0,
    todosByCategory: {},
    todosByPriority: {},
    overdueTodos: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [todosData, categoriesData, statsData] = await Promise.all([
          todoApi.getAllTodos(),
          categoryApi.getAllCategories(),
          todoApi.getStats()
        ]);
        
        setTodos(todosData);
        setCategories(categoriesData);
        setStats(statsData);
        setError(null);
      } catch (err) {
        console.error('Failed to load data:', err);
        setError('Failed to load data from server');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Refresh stats whenever todos change
  const refreshStats = async () => {
    try {
      const statsData = await todoApi.getStats();
      setStats(statsData);
    } catch (err) {
      console.error('Failed to refresh stats:', err);
    }
  };

  const addTodo = async (todoData: Omit<Todo, 'id' | 'createdDate'>) => {
    try {
      const newTodo = await todoApi.createTodo(todoData);
      setTodos(prev => [...prev, newTodo]);
      await refreshStats();
    } catch (err) {
      console.error('Failed to create todo:', err);
      setError('Failed to create todo');
      throw err;
    }
  };

  const updateTodo = async (id: string, updates: Partial<Todo>) => {
    try {
      const updatedTodo = await todoApi.updateTodo(id, updates);
      setTodos(prev => prev.map(todo => 
        todo.id === id ? updatedTodo : todo
      ));
      await refreshStats();
    } catch (err) {
      console.error('Failed to update todo:', err);
      setError('Failed to update todo');
      throw err;
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      await todoApi.deleteTodo(id);
      setTodos(prev => prev.filter(todo => todo.id !== id));
      await refreshStats();
    } catch (err) {
      console.error('Failed to delete todo:', err);
      setError('Failed to delete todo');
      throw err;
    }
  };

  const toggleTodoComplete = async (id: string) => {
    try {
      const updatedTodo = await todoApi.toggleTodo(id);
      setTodos(prev => prev.map(todo => 
        todo.id === id ? updatedTodo : todo
      ));
      await refreshStats();
    } catch (err) {
      console.error('Failed to toggle todo:', err);
      setError('Failed to toggle todo completion');
      throw err;
    }
  };

  const addCategory = async (categoryData: Omit<Category, 'id' | 'todoCount'>) => {
    try {
      const newCategory = await categoryApi.createCategory(categoryData);
      setCategories(prev => [...prev, newCategory]);
      await refreshStats();
    } catch (err) {
      console.error('Failed to create category:', err);
      setError('Failed to create category');
      throw err;
    }
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    try {
      const updatedCategory = await categoryApi.updateCategory(id, updates);
      setCategories(prev => prev.map(category => 
        category.id === id ? updatedCategory : category
      ));
    } catch (err) {
      console.error('Failed to update category:', err);
      setError('Failed to update category');
      throw err;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await categoryApi.deleteCategory(id);
      setCategories(prev => prev.filter(category => category.id !== id));
      await refreshStats();
    } catch (err) {
      console.error('Failed to delete category:', err);
      setError('Failed to delete category');
      throw err;
    }
  };

  const value: TodoContextType = {
    todos,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodoComplete,
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedPriority,
    setSelectedPriority,
    stats,
    loading,
    error,
  };

  return (
    <TodoContext.Provider value={value}>
      {children}
    </TodoContext.Provider>
  );
};

export const useTodos = (): TodoContextType => {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error('useTodos must be used within a TodoProvider');
  }
  return context;
};
