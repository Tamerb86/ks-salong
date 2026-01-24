import { useAuth } from "@/_core/hooks/useAuth";
import { Sidebar } from "./Sidebar";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function Layout({ children, className }: LayoutProps) {
  const { user } = useAuth();

  // If no user, don't show sidebar (login page)
  if (!user) {
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
