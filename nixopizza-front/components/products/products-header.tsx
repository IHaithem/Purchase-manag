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
import { Plus, Search, Filter, ArrowUpDown } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CategorySelect } from "../ui/category-select";
import { ICategory } from "@/app/dashboard/categories/page";

export function ProductsHeader({
  onSearchChange,
  onCategoryChange,
  onSortChange,
}: {
  onSearchChange: (search: string) => void;
  onCategoryChange: (categoryId: string) => void;
  onSortChange: (sort: { sortBy: string; order: string }) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ICategory | null>(
    null
  );
  const [sortBy, setSortBy] = useState("name");
  const [order, setOrder] = useState("asc");
  const router = useRouter();

  // Handle search change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearchChange(value);
  };

  // Handle category change
  const handleCategoryChange = (category: ICategory | null) => {
    setSelectedCategory(category);
    onCategoryChange(category ? category._id : "");
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
            Products
          </h1>
          <p className="text-muted-foreground">Manage your product inventory</p>
        </div>
        <Button
          className="gap-2"
          onClick={() => router.push("/dashboard/products/add")}
        >
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 border-2 border-input focus-visible:ring-2 focus-visible:ring-primary/30"
          />
        </div>
        <CategorySelect
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
          placeholder="Choose a category..."
          className="min-w-[220px]"
        />
        <div className="flex gap-2">
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[180px] border-2 border-input focus:ring-2 focus:ring-primary/30">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="currentStock">Stock</SelectItem>
              <SelectItem value="createdAt">Date Added</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            className="border-2 border-input"
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
