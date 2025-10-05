# React Hooks Deep Dive: useReducer and useMemo

This document provides a comprehensive explanation of the `useReducer` and `useMemo` React hooks, their use cases, and their implementation in the TodoList application.

## Table of Contents
1. [useReducer Hook](#usereducer-hook)
2. [useMemo Hook](#usememo-hook)
3. [Comparison Summary](#comparison-summary)
4. [Best Practices](#best-practices)

---

## useReducer Hook

### What is useReducer?

`useReducer` is a React hook that provides an alternative to `useState` for managing state logic. It's particularly useful when you have complex state logic that involves multiple sub-values or when the next state depends on the previous one.

### Basic Syntax

```typescript
const [state, dispatch] = useReducer(reducer, initialState);
```

- **state**: The current state value
- **dispatch**: A function to send actions to the reducer
- **reducer**: A function that determines how the state gets updated
- **initialState**: The initial state value

### How useReducer Differs from useState

| Feature | useState | useReducer |
|---------|----------|------------|
| **Complexity** | Simple state updates | Complex state logic with multiple actions |
| **State Structure** | Single values or simple objects | Complex objects with multiple properties |
| **Update Logic** | Inline state updates | Centralized reducer function |
| **Predictability** | Direct state mutations | Predictable state transitions via actions |
| **Testing** | Test components with state | Test reducer functions in isolation |
| **Performance** | Re-renders on every setState | Can be optimized with dispatch stability |

### useState Example (Simple)

```typescript
const [count, setCount] = useState(0);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

// Multiple state updates
const handleSubmit = () => {
  setLoading(true);
  setError(null);
  // ... API call
  setCount(prev => prev + 1);
  setLoading(false);
};
```

### useReducer Example (Complex)

```typescript
interface State {
  count: number;
  loading: boolean;
  error: string | null;
}

type Action = 
  | { type: 'INCREMENT' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'INCREMENT':
      return { ...state, count: state.count + 1 };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

const [state, dispatch] = useReducer(reducer, {
  count: 0,
  loading: false,
  error: null
});

// Centralized state updates
const handleSubmit = () => {
  dispatch({ type: 'SET_LOADING', payload: true });
  dispatch({ type: 'SET_ERROR', payload: null });
  // ... API call
  dispatch({ type: 'INCREMENT' });
  dispatch({ type: 'SET_LOADING', payload: false });
};
```

### When to Use useReducer Instead of useState

1. **Complex State Logic**: When your state has multiple sub-values that are related
2. **State Transitions**: When the next state depends on the previous state in complex ways
3. **Centralized Logic**: When you want to centralize state update logic
4. **Predictable Updates**: When you need predictable state transitions
5. **Testing**: When you want to test state logic separately from components
6. **Performance**: When you have many components that trigger deep updates

### useReducer in the TodoList Application

In our TodoList application, we use `useReducer` for several compelling reasons:

#### 1. Complex State Structure
```typescript
interface TodoState {
  todos: Todo[];           // Array of todo items
  categories: Category[];  // Array of categories
  stats: TodoStats | null; // Statistics object
  loading: boolean;        // Loading state
  error: string | null;    // Error messages
  filters: FilterOptions;  // Filter configuration
}
```

This state has 6 different properties that often need to be updated together or in response to the same user action.

#### 2. Related State Updates
```typescript
const loadTodos = async () => {
  dispatch({ type: 'SET_LOADING', payload: true });  // Start loading
  try {
    const todos = await todoApi.getAll();
    dispatch({ type: 'SET_TODOS', payload: todos }); // Set data
    dispatch({ type: 'SET_ERROR', payload: null });  // Clear errors
  } catch (error) {
    dispatch({ type: 'SET_ERROR', payload: 'Failed to load todos' }); // Set error
  } finally {
    dispatch({ type: 'SET_LOADING', payload: false }); // Stop loading
  }
};
```

Multiple state properties need to be updated in sequence for a single operation.

#### 3. Predictable State Transitions
```typescript
case 'ADD_TODO':
  return { ...state, todos: [...state.todos, action.payload] };
case 'UPDATE_TODO':
  return {
    ...state,
    todos: state.todos.map(todo =>
      todo.id === action.payload.id ? action.payload : todo
    )
  };
```

Each action has a specific, predictable effect on the state, making the application behavior more reliable.

#### 4. Performance Benefits
The `dispatch` function is stable across renders, which means:
- Child components receiving `dispatch` won't re-render unnecessarily
- Can be safely omitted from dependency arrays in `useEffect`
- Better performance in context providers

---

## useMemo Hook

### What is useMemo?

`useMemo` is a React hook that memoizes the result of an expensive computation and only recalculates it when its dependencies change. It's used for performance optimization by preventing unnecessary recalculations on every render.

### Basic Syntax

```typescript
const memoizedValue = useMemo(() => {
  return expensiveCalculation(a, b);
}, [a, b]); // Dependencies array
```

### How useMemo Works

1. **First Render**: Executes the function and caches the result
2. **Subsequent Renders**: 
   - If dependencies haven't changed → returns cached result
   - If dependencies have changed → re-executes function and caches new result

### useMemo vs Regular Calculations

#### Without useMemo (Recalculates Every Render)
```typescript
const TodosPage = ({ todos, filters }) => {
  // This runs on EVERY render, even if todos/filters haven't changed
  const filteredTodos = todos.filter(todo => {
    // Complex filtering logic...
    return todo.title.includes(filters.searchQuery) &&
           (filters.category === '' || todo.category === filters.category) &&
           (filters.priority === '' || todo.priority === filters.priority);
  }).sort((a, b) => {
    // Complex sorting logic...
    return filters.sortOrder === 'desc' ? 
      b[filters.sortBy].localeCompare(a[filters.sortBy]) :
      a[filters.sortBy].localeCompare(b[filters.sortBy]);
  });

  return (
    <div>
      {filteredTodos.map(todo => <TodoCard key={todo.id} todo={todo} />)}
    </div>
  );
};
```

#### With useMemo (Caches Result)
```typescript
const TodosPage = ({ todos, filters }) => {
  // This only runs when todos or filters actually change
  const filteredTodos = useMemo(() => {
    return todos.filter(todo => {
      // Complex filtering logic...
      return todo.title.includes(filters.searchQuery) &&
             (filters.category === '' || todo.category === filters.category) &&
             (filters.priority === '' || todo.priority === filters.priority);
    }).sort((a, b) => {
      // Complex sorting logic...
      return filters.sortOrder === 'desc' ? 
        b[filters.sortBy].localeCompare(a[filters.sortBy]) :
        a[filters.sortBy].localeCompare(b[filters.sortBy]);
    });
  }, [todos, filters]); // Only recalculate when these change

  return (
    <div>
      {filteredTodos.map(todo => <TodoCard key={todo.id} todo={todo} />)}
    </div>
  );
};
```

### When to Use useMemo

1. **Expensive Calculations**: Operations that take significant time to compute
2. **Complex Transformations**: Filtering, sorting, or transforming large datasets
3. **Referential Equality**: When child components depend on object/array props
4. **Preventing Cascading Re-renders**: When the result is used as a dependency in other hooks

### When NOT to Use useMemo

1. **Simple Calculations**: Basic arithmetic or string operations
2. **Primitive Values**: Numbers, strings, booleans (unless the calculation is expensive)
3. **Always Changing Dependencies**: If dependencies change on every render
4. **Premature Optimization**: When there's no actual performance problem

### useMemo in the TodoList Application

#### 1. Todo Filtering and Sorting
```typescript
// TodoList/frontend/src/hooks/useTodoFilter.ts
export const useTodoFilter = (todos: Todo[], filters: FilterOptions): Todo[] => {
  return useMemo(() => {
    let filtered = [...todos];

    // Search filter - potentially expensive string operations
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(todo =>
        todo.title.toLowerCase().includes(query) ||
        todo.description.toLowerCase().includes(query) ||
        todo.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(todo => todo.category === filters.category);
    }

    // Priority filter
    if (filters.priority) {
      filtered = filtered.filter(todo => todo.priority === filters.priority);
    }

    // Completion status filter
    if (filters.isCompleted !== undefined) {
      filtered = filtered.filter(todo => todo.isCompleted === filters.isCompleted);
    }

    // Sorting - potentially expensive comparison operations
    filtered.sort((a, b) => {
      const aValue = a[filters.sortBy];
      const bValue = b[filters.sortBy];
      
      let comparison = 0;
      if (aValue < bValue) comparison = -1;
      if (aValue > bValue) comparison = 1;
      
      return filters.sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [todos, filters]); // Only recalculate when todos or filters change
};
```

**Why useMemo is essential here:**
- **Complex Operations**: Multiple filter operations + sorting
- **Large Datasets**: Could be hundreds or thousands of todos
- **Frequent Re-renders**: Component re-renders on every filter change
- **Performance Impact**: Without memoization, filtering runs on every render

#### 2. Statistics Calculations
```typescript
// TodoList/frontend/src/hooks/useTodoStats.ts
export const useTodoStats = (todos: Todo[]): TodoStats => {
  return useMemo(() => {
    const totalTodos = todos.length;
    const completedTodos = todos.filter(todo => todo.isCompleted).length;
    const pendingTodos = totalTodos - completedTodos;
    
    const todosByCategory = todos.reduce((acc, todo) => {
      acc[todo.category] = (acc[todo.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const todosByPriority = todos.reduce((acc, todo) => {
      acc[todo.priority] = (acc[todo.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const overdueTodos = todos.filter(todo => 
      todo.dueDate && todo.dueDate < new Date() && !todo.isCompleted
    ).length;

    return {
      totalTodos,
      completedTodos,
      pendingTodos,
      todosByCategory,
      todosByPriority,
      overdueTodos,
      totalCategories: Object.keys(todosByCategory).length
    };
  }, [todos]); // Only recalculate when todos array changes
};
```

**Why useMemo is crucial here:**
- **Multiple Iterations**: Several `reduce` and `filter` operations
- **Object Creation**: New objects created on each calculation
- **Dashboard Usage**: Stats displayed on dashboard and navigation
- **Frequent Updates**: Todos change often, but stats calculation is expensive

#### 3. Component Usage Example
```typescript
const TodosPage: React.FC = () => {
  const { todos, filters } = useTodoContext();
  
  // This custom hook uses useMemo internally
  const filteredTodos = useTodoFilter(todos, filters);
  
  // Without useMemo, this would recalculate on every render
  const todoCountsByPriority = useMemo(() => {
    return filteredTodos.reduce((acc, todo) => {
      acc[todo.priority] = (acc[todo.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [filteredTodos]);

  return (
    <div>
      <div className="stats">
        <span>High Priority: {todoCountsByPriority.high || 0}</span>
        <span>Medium Priority: {todoCountsByPriority.medium || 0}</span>
        <span>Low Priority: {todoCountsByPriority.low || 0}</span>
      </div>
      <div className="todos-grid">
        {filteredTodos.map(todo => (
          <TodoCard key={todo.id} todo={todo} />
        ))}
      </div>
    </div>
  );
};
```

---

## Comparison Summary

### useState vs useReducer vs useMemo

| Hook | Purpose | Use Case | TodoList Usage |
|------|---------|----------|----------------|
| **useState** | Simple state management | Single values, simple objects | Form inputs, UI toggles |
| **useReducer** | Complex state management | Multiple related state values | Global application state |
| **useMemo** | Performance optimization | Expensive calculations | Filtering, sorting, statistics |

### Performance Impact in TodoList

#### Without Optimization
```typescript
// Every character typed in search = full recalculation
const handleSearchChange = (query: string) => {
  // This causes expensive filtering on every keystroke
  const filtered = todos.filter(...).sort(...); // Expensive!
};
```

#### With useReducer + useMemo
```typescript
// Search updates dispatch action (fast)
const handleSearchChange = (query: string) => {
  dispatch({ type: 'SET_FILTERS', payload: { searchQuery: query } });
  // useMemo in useTodoFilter prevents unnecessary recalculation
};
```

### Memory vs Performance Trade-offs

**useMemo Benefits:**
- ✅ Prevents expensive recalculations
- ✅ Improves user experience (faster UI)
- ✅ Reduces CPU usage

**useMemo Costs:**
- ❌ Uses memory to cache results
- ❌ Dependency checking overhead
- ❌ Code complexity

**In TodoList, the benefits outweigh the costs because:**
1. **Large datasets**: Potentially hundreds of todos
2. **Complex operations**: Multiple filters + sorting
3. **Frequent updates**: User interactions trigger many re-renders
4. **Real-time feel**: Users expect instant filter results

---

## Best Practices

### useReducer Best Practices

1. **Keep Reducers Pure**: No side effects, always return new state
```typescript
// ✅ Good
const todoReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TODO':
      return { ...state, todos: [...state.todos, action.payload] };
  }
};

// ❌ Bad - mutates state
const todoReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TODO':
      state.todos.push(action.payload); // Mutation!
      return state;
  }
};
```

2. **Use TypeScript for Actions**: Define clear action types
```typescript
type TodoAction =
  | { type: 'ADD_TODO'; payload: Todo }
  | { type: 'DELETE_TODO'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean };
```

3. **Keep Actions Simple**: Actions should be serializable
```typescript
// ✅ Good
dispatch({ type: 'SET_ERROR', payload: 'Network error' });

// ❌ Bad - functions aren't serializable
dispatch({ type: 'SET_CALLBACK', payload: () => console.log('test') });
```

### useMemo Best Practices

1. **Profile Before Optimizing**: Use React DevTools to identify performance issues

2. **Keep Dependencies Accurate**: Include all values used inside the function
```typescript
// ✅ Good
const filteredTodos = useMemo(() => {
  return todos.filter(todo => todo.category === selectedCategory);
}, [todos, selectedCategory]); // Both dependencies included

// ❌ Bad - missing dependency
const filteredTodos = useMemo(() => {
  return todos.filter(todo => todo.category === selectedCategory);
}, [todos]); // Missing selectedCategory
```

3. **Don't Overuse**: Only memoize expensive calculations
```typescript
// ❌ Unnecessary - simple calculation
const doubled = useMemo(() => count * 2, [count]);

// ✅ Necessary - expensive operation
const sortedAndFiltered = useMemo(() => {
  return items.filter(complexFilter).sort(complexSort);
}, [items, filterParams, sortParams]);
```

4. **Consider useCallback for Functions**: When passing functions to child components
```typescript
const handleClick = useCallback((id: string) => {
  dispatch({ type: 'DELETE_TODO', payload: id });
}, [dispatch]); // dispatch is stable from useReducer
```

### TodoList-Specific Optimizations

1. **Stable Dispatch**: `useReducer`'s dispatch function is stable across renders
2. **Memoized Selectors**: Custom hooks with `useMemo` for data transformations
3. **Component Splitting**: Separate components for different concerns
4. **Key Props**: Stable keys for list items to help React optimize renders

```typescript
// Stable dispatch means we can safely omit it from dependencies
useEffect(() => {
  loadTodos(); // dispatch is called inside, but dispatch is stable
}, []); // Empty dependency array is safe

// Custom hook encapsulates memoization
const filteredTodos = useTodoFilter(todos, filters); // Memoized internally

// Stable keys for optimal list rendering
{filteredTodos.map(todo => (
  <TodoCard key={todo.id} todo={todo} /> // todo.id is stable
))}
```

This combination of `useReducer` for state management and `useMemo` for performance optimization makes the TodoList application both maintainable and performant, even as the dataset grows and user interactions become more complex.