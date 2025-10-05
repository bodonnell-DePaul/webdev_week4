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
