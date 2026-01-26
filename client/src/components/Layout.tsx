import { Sidebar } from "./Sidebar";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function Layout({ children, className }: LayoutProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const dashboardAuth = sessionStorage.getItem("dashboardAuth");
    if (!dashboardAuth) {
      setLocation("/dashboard-login");
      return;
    }

    try {
      const auth = JSON.parse(dashboardAuth);
      const expiryTime = 24 * 60 * 60 * 1000; // 24 hours
      if (Date.now() - auth.timestamp > expiryTime) {
        sessionStorage.removeItem("dashboardAuth");
        setLocation("/dashboard-login");
        return;
      }
      setIsAuthenticated(true);
    } catch (e) {
      sessionStorage.removeItem("dashboardAuth");
      setLocation("/dashboard-login");
    }
  }, [setLocation]);

  // If not authenticated, don't show sidebar
  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-amber-50">
      <Sidebar />
      <main
        className={cn(
          "lg:pl-72 transition-all duration-300",
          className
        )}
      >
        {children}
      </main>
    </div>
  );
}
