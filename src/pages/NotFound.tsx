
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import AssistantAvatar from "@/components/AssistantAvatar";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center glass-panel p-8 rounded-lg max-w-md border border-gray-800">
        <div className="flex justify-center mb-6">
          <AssistantAvatar size="lg" />
        </div>
        <h1 className="text-4xl font-bold mb-4 text-nova-500">404</h1>
        <p className="text-xl text-foreground mb-2">System Module Not Found</p>
        <p className="text-gray-400 mb-6">
          The module you're trying to access does not exist or has been temporarily disabled.
        </p>
        <Link to="/">
          <Button className="nova-gradient">
            Return to Command Center
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
