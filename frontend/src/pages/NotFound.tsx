import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { SEO } from "@/components/SEO";
import PageTransition from "@/components/PageTransition";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <PageTransition className="pt-16 min-h-screen flex items-center justify-center bg-background">
      <SEO title="Page Not Found | Ayosi" description="The page you are looking for does not exist." canonical={location.pathname} />
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-6">Oops! Page not found</p>
        <Link to="/" className="underline hover:opacity-80">
          Return to Home
        </Link>
      </div>
    </PageTransition>
  );
};

export default NotFound;
