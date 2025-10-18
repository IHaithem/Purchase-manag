// components/suppliers/suppliers-header.tsx
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
import { Search, Filter, ArrowUpDown, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AddSupplierDialog } from "./add-supplier-dialog";
import { getCategories } from "@/lib/apis/categories";
import { ICategory } from "@/app/dashboard/categories/page";
import { Badge } from "@/components/ui/badge";
import { CategorySelect } from "@/components/ui/category-select";
import { ISupplier } from "@/app/dashboard/suppliers/page";

export function SuppliersHeader({
  onSearchChange,
  onStatusChange,
  onSortChange,
  onCategoryChange,
  onAdding,
}: {
  onSearchChange: (search: string) => void;
  onStatusChange: (status: string) => void;
  onSortChange: (sort: { sortBy: string; order: string }) => void;
  onCategoryChange: (categoryIds: string[]) => void;
  onAdding: (supplier: ISupplier) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [order, setOrder] = useState("asc");
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<ICategory[]>([]);
  const router = useRouter();

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      const { success, categories, message } = await getCategories();
      if (success) {
        setCategories(categories);
      } else {
        console.log("Failed to Load Categories:", message);
      }
    };
    fetchCategories();
  }, []);

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

  // Handle category selection
  const handleCategoryChange = (category: ICategory | null) => {
    if (
      category &&
      !selectedCategories.some((cat) => cat._id === category._id)
    ) {
      const newSelectedCategories = [...selectedCategories, category];
      setSelectedCategories(newSelectedCategories);
      onCategoryChange(newSelectedCategories.map((cat) => cat._id));
    }
  };

  // Remove selected category
  const removeCategory = (categoryId: string) => {
    const newSelectedCategories = selectedCategories.filter(
      (cat) => cat._id !== categoryId
    );
    setSelectedCategories(newSelectedCategories);
    onCategoryChange(newSelectedCategories.map((cat) => cat._id));
  };

  // Handle sort change
  const handleSortChange = (field: string) => {
    setSortBy(field);
    // Toggle order if same field is selected
    const newOrder = sortBy === field && order === "asc" ? "desc" : "asc";
    setOrder(newOrder);
    onSortChange({ sortBy: field, order: newOrder });
  };

  // Filter out already selected categories
  const availableCategories = categories.filter(
    (cat) => !selectedCategories.some((selected) => selected._id === cat._id)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">
            Suppliers
          </h1>
          <p className="text-muted-foreground">
            Manage your supplier directory and contacts
          </p>
        </div>
        <AddSupplierDialog onAdding={onAdding} />
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search suppliers..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 border-2 border-input focus-visible:ring-2 focus-visible:ring-primary/30"
          />
        </div>
        <div className="flex gap-2 flex-1">
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[180px] border-2 border-input focus:ring-2 focus:ring-primary/30">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Suppliers</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-[180px] border-2 border-input focus:ring-2 focus:ring-primary/30">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="contactPerson">Contact Person</SelectItem>
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

          {/* Category Selection */}
          <div className="flex flex-wrap gap-2">
            <CategorySelect
              categories={availableCategories}
              selectedCategory={null}
              onCategoryChange={handleCategoryChange}
              placeholder="Select Categories"
              className="min-w-[280px] border-2 border-input focus:ring-2 focus:ring-primary/30"
            />

            {/* Selected Categories */}
            {selectedCategories.map((category) => (
              <Badge
                key={category._id}
                variant="secondary"
                className="flex items-center gap-1 px-2 py-1"
              >
                {category.name}
                <button
                  type="button"
                  onClick={() => removeCategory(category._id)}
                  className="ml-1 rounded-full hover:bg-secondary-foreground/20"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
