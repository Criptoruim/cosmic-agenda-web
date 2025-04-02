import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import Footer from '@/components/layout/Footer';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <p className="text-xl text-gray-600 mb-4">Oops! Page not found</p>
          <a href="/" className="text-purple-600 hover:text-purple-800 underline">
            Return to Home
          </a>
        </div>
      </div>
      <div className="container mx-auto px-4">
        <Footer />
      </div>
    </div>
  );
};

export default NotFound;
