// components/shortcuts/shortcuts-grid.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, TrendingUp, AlertCircle, CheckCircle, DollarSign, Zap } from "lucide-react";
import { useRouter } from "next/navigation";

export function ShortcutsGrid() {
  const router = useRouter();

  const getLastThursday = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 4 = Thursday
    
    // Calculate days since last Thursday (inclusive of today if today is Thursday)
    let daysToSubtract;
    if (dayOfWeek >= 4) {
      // If today is Thursday (4) or later, go back to this week's Thursday
      daysToSubtract = dayOfWeek - 4;
    } else {
      // If today is before Thursday, go back to last week's Thursday
      daysToSubtract = dayOfWeek + 3;
    }
    
    const lastThursday = new Date(today);
    lastThursday.setDate(today.getDate() - daysToSubtract);
    lastThursday.setHours(0, 0, 0, 0);
    
    return lastThursday;
  };

  const getTodayRange = () => {
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);
    
    return { startOfDay, endOfDay };
  };

  const handleLastWeekFilter = () => {
    const lastThursday = getLastThursday();
    const today = new Date();
    
    // Format dates as ISO strings for URL params
    const startDate = lastThursday.toISOString();
    const endDate = today.toISOString();
    
    // Navigate to purchases page with query parameters - EXCLUDING paid
    const params = new URLSearchParams({
      dateFrom: startDate,
      dateTo: endDate,
      status: "not assigned,assigned,confirmed", // All statuses EXCEPT paid
    });
    
    router.push(`/dashboard/purchases?${params.toString()}`);
  };

  const handleLastWeekPaidFilter = () => {
    const lastThursday = getLastThursday();
    const today = new Date();
    
    // Format dates as ISO strings for URL params
    const startDate = lastThursday.toISOString();
    const endDate = today.toISOString();
    
    // Navigate to purchases page with query parameters - ONLY paid
    const params = new URLSearchParams({
      dateFrom: startDate,
      dateTo: endDate,
      status: "paid", // Only paid status
    });
    
    router.push(`/dashboard/purchases?${params.toString()}`);
  };

  const handleTodayFilter = () => {
    const { startOfDay, endOfDay } = getTodayRange();
    
    // Navigate to purchases page with query parameters - ALL statuses
    const params = new URLSearchParams({
      dateFrom: startOfDay.toISOString(),
      dateTo: endOfDay.toISOString(),
      status: "all",
    });
    
    router.push(`/dashboard/purchases?${params.toString()}`);
  };

  const handleTodayPaidFilter = () => {
    const { startOfDay, endOfDay } = getTodayRange();
    
    // Navigate to purchases page with query parameters - ONLY paid
    const params = new URLSearchParams({
      dateFrom: startOfDay.toISOString(),
      dateTo: endOfDay.toISOString(),
      status: "paid",
    });
    
    router.push(`/dashboard/purchases?${params.toString()}`);
  };

  const shortcuts = [
    {
      title: "Last Week's Orders",
      description: "From last Thursday to today (excluding paid)",
      icon: Calendar,
      iconColor: "text-blue-600",
      bgColor: "bg-blue-50",
      count: "Active",
      onClick: handleLastWeekFilter,
    },
    {
      title: "Last Week Paid",
      description: "Paid orders from last Thursday to today",
      icon: DollarSign,
      iconColor: "text-green-600",
      bgColor: "bg-green-50",
      count: "Paid",
      onClick: handleLastWeekPaidFilter,
    },
    {
      title: "Today's Orders",
      description: "All purchase orders created today",
      icon: Clock,
      iconColor: "text-purple-600",
      bgColor: "bg-purple-50",
      count: "Today",
      onClick: handleTodayFilter,
    },
    {
      title: "Today's Paid Orders",
      description: "Orders marked as paid today",
      icon: CheckCircle,
      iconColor: "text-emerald-600",
      bgColor: "bg-emerald-50",
      count: "Completed",
      onClick: handleTodayPaidFilter,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {shortcuts.map((shortcut, index) => (
        <Card
          key={index}
          className="cursor-pointer transition-all hover:shadow-lg hover:scale-105"
          onClick={shortcut.onClick}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {shortcut.title}
            </CardTitle>
            <div className={`p-2 rounded-full ${shortcut.bgColor}`}>
              <shortcut.icon className={`h-4 w-4 ${shortcut.iconColor}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{shortcut.count}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {shortcut.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}