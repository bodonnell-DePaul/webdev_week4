import { useMemo } from 'react';
import { Todo, FilterOptions } from '../types';

export const useTodoFilter = (todos: Todo[], options: FilterOptions): Todo[] => {
  return useMemo(() => {
    let filteredTodos = [...todos];

    // Apply search filter
    if (options.searchQuery) {
      const query = options.searchQuery.toLowerCase();
      filteredTodos = filteredTodos.filter(todo => 
        todo.title.toLowerCase().includes(query) ||
        todo.description.toLowerCase().includes(query) ||
        todo.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply category filter
    if (options.category && options.category !== 'all') {
      filteredTodos = filteredTodos.filter(todo => todo.category === options.category);
    }

    // Apply priority filter
    if (options.priority && options.priority !== 'all') {
      filteredTodos = filteredTodos.filter(todo => todo.priority === options.priority);
    }

    // Apply completion status filter
    if (options.isCompleted !== undefined) {
      filteredTodos = filteredTodos.filter(todo => todo.isCompleted === options.isCompleted);
    }

    // Apply sorting
    filteredTodos.sort((a, b) => {
      let comparison = 0;
      
      switch (options.sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case 'dueDate':
          if (!a.dueDate && !b.dueDate) comparison = 0;
          else if (!a.dueDate) comparison = 1;
          else if (!b.dueDate) comparison = -1;
          else comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          break;
        case 'createdDate':
          comparison = new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime();
          break;
      }

      return options.sortOrder === 'desc' ? -comparison : comparison;
    });

    return filteredTodos;
  }, [todos, options]);
};
