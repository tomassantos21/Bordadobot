import { Link } from "react-router";
import { Home } from "lucide-react";
import { Button } from "../components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-blue-50/30 to-accent/20 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-9xl mb-4 bg-gradient-to-r from-primary via-foreground to-primary bg-clip-text text-transparent">
          404
        </h1>
        <h2 className="mb-4">Page Not Found</h2>
        <p className="font-secondary text-xl text-muted-foreground mb-8 italic">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/">
          <Button className="gap-2">
            <Home className="w-5 h-5" />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
