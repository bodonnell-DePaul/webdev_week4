import { useMemo } from 'react';
import { Todo, TodoStats } from '../types';

export const useTodoStats = (todos: Todo[]): TodoStats => {
  return useMemo(() => {
    const completedTodos = todos.filter(todo => todo.isCompleted).length;
    const pendingTodos = todos.length - completedTodos;
    
    const todosByCategory = todos.reduce((acc, todo) => {
      acc[todo.category] = (acc[todo.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const todosByPriority = todos.reduce((acc, todo) => {
      acc[todo.priority] = (acc[todo.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const overdueTodos = todos.filter(todo => 
      !todo.isCompleted && 
      todo.dueDate && 
      new Date(todo.dueDate) < new Date()
    ).length;

    const uniqueCategories = new Set(todos.map(todo => todo.category));

    return {
      totalTodos: todos.length,
      completedTodos,
      pendingTodos,
      totalCategories: uniqueCategories.size,
      todosByCategory,
      todosByPriority,
      overdueTodos,
    };
  }, [todos]);
};
