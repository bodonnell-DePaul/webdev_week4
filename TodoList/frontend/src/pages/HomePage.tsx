import { usePageTitle } from '../hooks/usePageTitle';
import { useTodos } from '../context/TodoContext';

const HomePage = () => {
  usePageTitle('Dashboard');
  const { stats, todos, loading, error } = useTodos();

  const recentTodos = todos
    .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
    .slice(0, 5);

  const priorityColors = {
    urgent: '#ef4444',
    high: '#f97316',
    medium: '#eab308',
    low: '#22c55e'
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading-state">
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="error-state">
          <p>Error: {error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>📊 Dashboard</h1>
        <p>Overview of your todo list and productivity</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <h3>{stats.totalTodos}</h3>
            <p>Total Todos</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.completedTodos}</h3>
            <p>Completed</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>{stats.pendingTodos}</h3>
            <p>Pending</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🚨</div>
          <div className="stat-content">
            <h3>{stats.overdueTodos}</h3>
            <p>Overdue</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📁</div>
          <div className="stat-content">
            <h3>{stats.totalCategories}</h3>
            <p>Categories</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>{Math.round((stats.completedTodos / stats.totalTodos) * 100) || 0}%</h3>
            <p>Completion Rate</p>
          </div>
        </div>
      </div>

      <div className="dashboard-sections">
        <div className="recent-todos">
          <h2>📋 Recent Todos</h2>
          <div className="todo-list">
            {recentTodos.map(todo => (
              <div key={todo.id} className={`todo-item ${todo.isCompleted ? 'completed' : ''}`}>
                <div className="todo-priority" style={{ backgroundColor: priorityColors[todo.priority] }}></div>
                <div className="todo-content">
                  <h4>{todo.title}</h4>
                  <p>{todo.description}</p>
                  <div className="todo-meta">
                    <span className="todo-category">{todo.category}</span>
                    <span className="todo-priority-text">{todo.priority}</span>
                    {todo.dueDate && (
                      <span className="todo-due">
                        Due: {new Date(todo.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="todo-status">
                  {todo.isCompleted ? '✅' : '⏳'}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="priority-breakdown">
          <h2>🎯 Priority Breakdown</h2>
          <div className="priority-chart">
            {Object.entries(stats.todosByPriority).map(([priority, count]) => (
              <div key={priority} className="priority-item">
                <div className="priority-label">
                  <div 
                    className="priority-color" 
                    style={{ backgroundColor: priorityColors[priority as keyof typeof priorityColors] }}
                  ></div>
                  <span>{priority.charAt(0).toUpperCase() + priority.slice(1)}</span>
                </div>
                <div className="priority-count">{count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
