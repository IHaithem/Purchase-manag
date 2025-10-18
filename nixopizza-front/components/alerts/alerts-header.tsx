// components/alerts/alerts-header.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";

type StatusFilter = "all" | "critical" | "high" | "medium";

export function AlertsHeader({
  name: initialName = "",
  status: initialStatus = "all",
  onFilterChange,
}: {
  name?: string;
  status?: StatusFilter;
  onFilterChange: (filters: { name?: string; status?: string }) => void;
}) {
  const [searchQuery, setSearchQuery] = useState(initialName);
  const [priorityFilter, setPriorityFilter] = useState<StatusFilter>(
    initialStatus as StatusFilter
  );

  // Apply filters when inputs change
  useEffect(() => {
    const handler = setTimeout(() => {
      onFilterChange({ name: searchQuery, status: priorityFilter });
    }, 400); // Debounce search

    return () => clearTimeout(handler);
  }, [searchQuery, priorityFilter, onFilterChange]);

  const handleRefresh = () => {
    onFilterChange({ name: searchQuery, status: priorityFilter });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Low Stock Alerts
          </h1>
          <p className="text-muted-foreground">
            Monitor products that need restocking
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={priorityFilter}
            onValueChange={(v) => setPriorityFilter(v as StatusFilter)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={handleRefresh}>
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
