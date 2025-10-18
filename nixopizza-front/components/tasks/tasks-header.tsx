// components/tasks/tasks-header.tsx
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
import { Search, Filter, ArrowUpDown } from "lucide-react";
import { useState } from "react";
import { Plus } from "lucide-react";

interface TasksHeaderProps {
  onSearchChange: (search: string) => void;
  onStatusChange: (status: string) => void;
  onSortChange: (sort: { sortBy: string; order: string }) => void;
}

export function TasksHeader({
  onSearchChange,
  onStatusChange,
  onSortChange,
}: TasksHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [order, setOrder] = useState("desc");

  // Handle search change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearchChange(value);
  };

  // Handle status change
  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    onStatusChange(value);
  };

  // Handle sort change
  const handleSortChange = (field: string) => {
    setSortBy(field);
    // Toggle order if same field is selected
    const newOrder = sortBy === field && order === "asc" ? "desc" : "asc";
    setOrder(newOrder);
    onSortChange({ sortBy: field, order: newOrder });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">
            Task Management
          </h1>
          <p className="text-muted-foreground">
            Manage and assign tasks to your team
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 border-2 border-input focus-visible:ring-2 focus-visible:ring-primary/30 rounded-lg"
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[180px] border-2 border-input focus:ring-2 focus:ring-primary/30 rounded-lg">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tasks</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="canceled">Canceled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[180px] border-2 border-input focus:ring-2 focus:ring-primary/30 rounded-lg">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">Date Created</SelectItem>
              <SelectItem value="deadline">Deadline</SelectItem>
              <SelectItem value="taskNumber">Task Number</SelectItem>
              <SelectItem value="staffId.fullname">Assigned To</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            className="border-2 border-input rounded-lg"
            onClick={() => {
              const newOrder = order === "asc" ? "desc" : "asc";
              setOrder(newOrder);
              onSortChange({ sortBy, order: newOrder });
            }}
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
