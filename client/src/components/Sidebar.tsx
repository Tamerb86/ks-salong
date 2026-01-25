import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  Calendar,
  Users,
  DollarSign,
  Clock,
  BarChart3,
  Settings,
  LogOut,
  Scissors,
  Home,
  UserCircle,
  ChevronLeft,
  Menu,
  Package,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: Home,
  },
  {
    title: "Avtaler",
    href: "/appointments",
    icon: Calendar,
  },
  {
    title: "Kø",
    href: "/queue",
    icon: Users,
  },
  {
    title: "POS",
    href: "/pos",
    icon: DollarSign,
  },
  {
    title: "Kunder",
    href: "/customers",
    icon: UserCircle,
  },
  {
    title: "Rapporter",
    href: "/reports",
    icon: BarChart3,
  },
  {
    title: "Tidsstempling",
    href: "/tidsstempling",
    icon: Clock,
  },
  {
    title: "Ansatte",
    href: "/staff",
    icon: Users,
  },
  {
    title: "Tjenester",
    href: "/services",
    icon: Scissors,
  },
  {
    title: "Produkter",
    href: "/products",
    icon: Package,
  },
  {
    title: "Innstillinger",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!user) return null;

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden bg-white shadow-lg"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen transition-all duration-300 bg-gradient-to-b from-purple-900 via-purple-800 to-purple-900 text-white shadow-2xl",
          isCollapsed ? "w-0 lg:w-20" : "w-72",
          "lg:translate-x-0",
          isCollapsed && "lg:translate-x-0",
          !isCollapsed && "translate-x-0"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-20 items-center justify-between px-6 border-b border-white/10">
            {!isCollapsed && (
              <Link href="/">
                <div className="flex items-center gap-3 cursor-pointer">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Scissors className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold">K.S Salong</h1>
                    <p className="text-xs text-purple-200">Administrasjon</p>
                  </div>
                </div>
              </Link>
            )}
            {isCollapsed && (
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-lg mx-auto">
                <Scissors className="h-5 w-5 text-white" />
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:flex text-white hover:bg-white/10"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              <ChevronLeft
                className={cn(
                  "h-5 w-5 transition-transform",
                  isCollapsed && "rotate-180"
                )}
              />
            </Button>
          </div>

          {/* User Profile */}
          {!isCollapsed && (
            <div className="px-6 py-4 bg-white/5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">{user.name}</p>
                  <p className="text-sm text-purple-200 capitalize">{user.role}</p>
                </div>
              </div>
            </div>
          )}

          <Separator className="bg-white/10" />

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3 py-4">
            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href;

                return (
                  <Link key={item.href} href={item.href}>
                    <div
                      className={cn(
                        "flex items-center gap-3 px-3 py-3 rounded-xl transition-all cursor-pointer group",
                        isActive
                          ? "bg-white text-purple-900 shadow-lg"
                          : "text-purple-100 hover:bg-white/10 hover:text-white",
                        isCollapsed && "justify-center"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-5 w-5 flex-shrink-0",
                          isActive ? "text-purple-900" : "text-purple-200 group-hover:text-white"
                        )}
                      />
                      {!isCollapsed && (
                        <span className="font-medium">{item.title}</span>
                      )}
                      {!isCollapsed && item.badge && (
                        <span className="ml-auto bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </nav>
          </ScrollArea>

          {/* Footer */}
          <div className="p-3 border-t border-white/10">
            <Button
              variant="ghost"
              className={cn(
                "w-full text-purple-100 hover:bg-red-500/20 hover:text-white",
                isCollapsed && "px-0"
              )}
              onClick={() => logout()}
            >
              <LogOut className="h-5 w-5" />
              {!isCollapsed && <span className="ml-3">Logg ut</span>}
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}
    </>
  );
}
