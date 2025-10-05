import { ReactNode } from 'react';
import Navigation from './Navigation';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="app-layout">
      <Navigation />
      <main className="main-content">
        {children}
      </main>
      <footer className="footer">
        <div className="footer-content">
          <p>&copy; 2024 TodoList App. Built with React & TypeScript.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
