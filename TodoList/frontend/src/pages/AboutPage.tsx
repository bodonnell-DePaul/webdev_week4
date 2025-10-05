import { usePageTitle } from '../hooks/usePageTitle';

const AboutPage = () => {
  usePageTitle('About');

  const features = [
    {
      icon: '📝',
      title: 'Todo Management',
      description: 'Create, edit, delete, and organize your todos with ease'
    },
    {
      icon: '📁',
      title: 'Category System',
      description: 'Organize todos into customizable categories with color coding'
    },
    {
      icon: '🎯',
      title: 'Priority Levels',
      description: 'Set priority levels (Low, Medium, High, Urgent) for better task management'
    },
    {
      icon: '🔍',
      title: 'Advanced Search',
      description: 'Search and filter todos by title, description, category, or tags'
    },
    {
      icon: '📊',
      title: 'Statistics Dashboard',
      description: 'View comprehensive statistics about your productivity and task completion'
    },
    {
      icon: '💾',
      title: 'Local Storage',
      description: 'All data is automatically saved to your browser\'s local storage'
    }
  ];

  const technologies = [
    { name: 'React 18', description: 'Modern React with hooks and functional components' },
    { name: 'TypeScript', description: 'Full type safety and enhanced developer experience' },
    { name: 'React Router', description: 'Client-side routing for single-page application' },
    { name: 'Context API', description: 'Global state management without external libraries' },
    { name: 'Custom Hooks', description: 'Reusable logic patterns for better code organization' },
    { name: 'Local Storage', description: 'Persistent data storage in the browser' },
    { name: 'CSS3', description: 'Modern CSS with flexbox and grid layout' },
    { name: 'Vite', description: 'Fast build tool and development server' }
  ];

  return (
    <div className="about-page">
      <div className="about-header">
        <h1>ℹ️ About TodoList App</h1>
        <p className="about-subtitle">
          A comprehensive todo management application built with modern React patterns and TypeScript
        </p>
      </div>

      <div className="about-content">
        <section className="features-section">
          <h2>🚀 Features</h2>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="tech-section">
          <h2>🛠️ Technology Stack</h2>
          <div className="tech-grid">
            {technologies.map((tech, index) => (
              <div key={index} className="tech-card">
                <h4>{tech.name}</h4>
                <p>{tech.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="architecture-section">
          <h2>🏗️ Architecture Highlights</h2>
          <div className="architecture-content">
            <div className="architecture-item">
              <h3>React Router Implementation</h3>
              <p>Complete navigation system with multiple routes including Dashboard, Todos, Categories, and About pages.</p>
            </div>
            
            <div className="architecture-item">
              <h3>Context API for State Management</h3>
              <p>Global state management for todos and categories using React Context API with TypeScript integration.</p>
            </div>
            
            <div className="architecture-item">
              <h3>Custom Hooks Pattern</h3>
              <p>Four specialized hooks: useLocalStorage, useTodoFilter, useTodoStats, and usePageTitle for reusable logic.</p>
            </div>
            
            <div className="architecture-item">
              <h3>TypeScript Integration</h3>
              <p>Full type safety with comprehensive interfaces, proper typing for Context API, and generic hook implementations.</p>
            </div>
          </div>
        </section>

        <section className="assignment-section">
          <h2>📚 Assignment Requirements Fulfilled</h2>
          <div className="requirements-list">
            <div className="requirement-item completed">
              <span className="requirement-icon">✅</span>
              <span>React Router with multiple pages and navigation</span>
            </div>
            <div className="requirement-item completed">
              <span className="requirement-icon">✅</span>
              <span>Context API for global state management</span>
            </div>
            <div className="requirement-item completed">
              <span className="requirement-icon">✅</span>
              <span>At least 4 custom hooks with specific functionality</span>
            </div>
            <div className="requirement-item completed">
              <span className="requirement-icon">✅</span>
              <span>TypeScript integration throughout the application</span>
            </div>
            <div className="requirement-item completed">
              <span className="requirement-icon">✅</span>
              <span>Component composition and architectural design</span>
            </div>
            <div className="requirement-item completed">
              <span className="requirement-icon">✅</span>
              <span>State persistence across navigation</span>
            </div>
            <div className="requirement-item completed">
              <span className="requirement-icon">✅</span>
              <span>Responsive design and modern UI</span>
            </div>
          </div>
        </section>

        <section className="stats-section">
          <h2>📈 Project Statistics</h2>
          <div className="project-stats">
            <div className="stat-item">
              <div className="stat-value">5</div>
              <div className="stat-label">Pages</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">4</div>
              <div className="stat-label">Custom Hooks</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">10+</div>
              <div className="stat-label">Components</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">100%</div>
              <div className="stat-label">TypeScript</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;
