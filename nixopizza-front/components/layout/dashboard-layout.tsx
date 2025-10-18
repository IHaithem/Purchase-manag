"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Package,
  Users,
  ShoppingCart,
  AlertTriangle,
  BarChart3,
  Menu,
  LogOut,
  Settings,
  Bell,
  Shapes,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { logoutUser } from "@/lib/apis/auth";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { name: "Categories", href: "/dashboard/categories", icon: Shapes },
  { name: "Products", href: "/dashboard/products", icon: Package },
  { name: "Suppliers", href: "/dashboard/suppliers", icon: Users },
  { name: "Purchase Lists", href: "/dashboard/purchases", icon: ShoppingCart },
  { name: "Low Stock", href: "/dashboard/alerts", icon: AlertTriangle },
  { name: "Stuff", href: "/dashboard/stuff", icon: Users },
  { name: "Tasks", href: "/dashboard/tasks", icon: Users },
  { name: "Notifications", href: "/dashboard/notifications", icon: Bell },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const handleLogout = async () => {
    await logoutUser();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            className="fixed top-4 left-4 z-40 md:hidden"
            size="icon"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <Sidebar />
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="md:pl-64">
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );

  function Sidebar() {
    return (
      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-card border-r border-border px-6 pb-4">
        <div className="flex h-16 shrink-0 items-center">
          <img src="/nexo-logo.png" alt="Logo" className="w-[150px]" />
        </div>
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-medium transition-colors",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-foreground hover:bg-muted hover:text-foreground"
                        )}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <item.icon className="h-5 w-5 shrink-0" />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
            <li className="mt-auto">
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-x-3 p-2 text-sm font-medium"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5 shrink-0" />
                  Sign Out
                </Button>
              </div>
            </li>
          </ul>
        </nav>
      </div>
    );
  }
}
