import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();
  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <p className="text-xl font-semibold mb-2">Page not found</p>
        <p className="text-muted-foreground mb-8">The page you're looking for doesn't exist.</p>
        <Link to="/dashboard" className="inline-flex items-center px-4 py-2 rounded-lg gradient-primary text-white text-sm font-medium">
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
