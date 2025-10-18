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
import { Search, Filter } from "lucide-react";
import { useState } from "react";
import { AddCategoryDialog } from "./add-category-dialog";

export function CategoryHeader({
  setCategories,
  searchQuery,
  setSearchQuery,
}: {
  searchQuery: string;
  setSearchQuery: any;
  setCategories: any;
}) {
  const [statusFilter, setStatusFilter] = useState("all");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">
            Categories
          </h1>
          <p className="text-muted-foreground">Manage your categories</p>
        </div>
        <AddCategoryDialog setCategories={setCategories} />
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
    </div>
  );
}
