import { Link, useLocation } from "react-router";
import { Sparkles, Menu, Home, Wand2, Images, Sun, Moon } from "lucide-react";
import { Button } from "./ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "./ui/sheet";
import { useTheme } from "../context/ThemeContext";

export default function Navigation() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const links = [
    { to: "/", label: "Home", icon: Home },
    { to: "/create", label: "Create", icon: Wand2 },
    { to: "/gallery", label: "Gallery", icon: Images },
  ];

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-2 sm:px-3">
        <div className="flex items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="hidden sm:block font-semibold">BordadoBot</span>
          </Link>

          {/* Desktop Navigation - Centered */}
          <div className="hidden md:flex items-center gap-8 flex-1 justify-center">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`font-sans transition-all ${
                  isActive(link.to)
                    ? "text-primary font-semibold border-b-2 border-primary pb-0.5"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-1 sm:gap-2 ml-auto">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              className="rounded-full"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </Button>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[300px] sm:w-[340px] p-0 flex flex-col gap-0">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <SheetDescription className="sr-only">
                  Mobile navigation menu with links to all pages
                </SheetDescription>

                {/* Branded Header */}
                <div className="px-5 pt-5 pb-4 border-b border-border">
                  <SheetClose asChild>
                    <Link to="/" className="flex items-center gap-2.5 group w-fit">
                      <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Sparkles className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <span className="font-semibold">BordadoBot</span>
                    </Link>
                  </SheetClose>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 overflow-y-auto px-3 py-4">
                  <p className="px-3 pb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Menu
                  </p>
                  <div className="flex flex-col gap-1">
                    {links.map((link) => {
                      const Icon = link.icon;
                      const active = isActive(link.to);
                      return (
                        <SheetClose asChild key={link.to}>
                          <Link
                            to={link.to}
                            className={`font-sans transition-all px-3 py-3 rounded-lg flex items-center gap-3 min-h-[44px] active:scale-[0.98] ${
                              active
                                ? "bg-primary/10 text-primary font-semibold"
                                : "text-foreground hover:bg-muted"
                            }`}
                          >
                            <Icon className={`w-5 h-5 ${active ? "text-primary" : "text-muted-foreground"}`} />
                            <span>{link.label}</span>
                          </Link>
                        </SheetClose>
                      );
                    })}
                  </div>
                </nav>

                {/* Theme Footer */}
                <div className="px-5 py-4 border-t border-border bg-muted/30">
                  <Button
                    onClick={toggleTheme}
                    variant="outline"
                    className="w-full gap-2 h-11"
                  >
                    {theme === "dark" ? (
                      <>
                        <Sun className="w-4 h-4" />
                        Light Mode
                      </>
                    ) : (
                      <>
                        <Moon className="w-4 h-4" />
                        Dark Mode
                      </>
                    )}
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
