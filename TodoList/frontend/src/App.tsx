import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import { TodoProvider } from './context/TodoContext';
import HomePage from './pages/HomePage';
import TodosPage from './pages/TodosPage';
import CategoriesPage from './pages/CategoriesPage';
import AboutPage from './pages/AboutPage';
import NotFoundPage from './pages/NotFoundPage';
import { testApiConnection } from './utils/apiTest';
import './index.css';

// Test API connection on app startup
testApiConnection();

function App() {
  return (
    <TodoProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/todos" element={<TodosPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Layout>
      </Router>
    </TodoProvider>
  );
}

export default App;
