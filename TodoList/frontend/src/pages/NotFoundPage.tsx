import { usePageTitle } from '../hooks/usePageTitle';

const NotFoundPage = () => {
  usePageTitle('404 - Page Not Found');

  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <div className="not-found-icon">🔍</div>
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>The page you're looking for doesn't exist.</p>
        <a href="/" className="btn-primary">
          Go Back Home
        </a>
      </div>
    </div>
  );
};

export default NotFoundPage;
