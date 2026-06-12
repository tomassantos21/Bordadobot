import { Outlet } from "react-router";
import Navigation from "./Navigation";
import { Toaster } from "./ui/sonner";

export default function Layout() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Outlet />
      <Toaster />
    </div>
  );
}
