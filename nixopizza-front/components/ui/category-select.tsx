// components/ui/category-select.tsx
"use client";

import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";
import { getCategories } from "@/lib/apis/categories";
import { ICategory } from "@/app/dashboard/categories/page";

interface CategorySelectProps {
  categories?: ICategory[]; // Optional prop for categories to display
  selectedCategory: ICategory | null;
  onCategoryChange: (category: ICategory | null) => void;
  placeholder?: string;
  className?: string;
}

export function CategorySelect({
  categories, // Don't provide a default here to distinguish between passed and undefined
  selectedCategory,
  onCategoryChange,
  placeholder = "Select a category...",
  className,
}: CategorySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [localCategories, setLocalCategories] = useState<ICategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch categories if not provided via props
  useEffect(() => {
    const fetchCategories = async () => {
      if (!categories) {
        // Only fetch if categories prop is not provided
        try {
          const {
            categories: fetchedCategories,
            success,
            message,
          } = await getCategories();
          if (success) {
            setLocalCategories(fetchedCategories || []);
          } else {
            console.error("Error fetching categories:", message);
            setLocalCategories([]);
          }
        } catch (error) {
          console.error("Error fetching categories:", error);
          setLocalCategories([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        // If categories prop is provided, use it
        setLocalCategories(categories);
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [categories]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (category: ICategory) => {
    onCategoryChange(category);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCategoryChange(null);
    setSearchTerm("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (!isOpen) {
      setIsOpen(true);
    }
  };

  const handleInputClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  // Filter categories based on search term
  const filteredCategories =
    searchTerm.trim() === ""
      ? localCategories
      : localCategories.filter((category) =>
          category.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

  if (isLoading) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-md border bg-background px-3 py-2 text-sm",
          className
        )}
      >
        <span className="text-muted-foreground">Loading categories...</span>
      </div>
    );
  }

  return (
    <div className={cn("relative", className)} ref={containerRef}>
      {/* Searchable input display */}
      <div
        className={cn(
          "flex items-center justify-between rounded-md border bg-background px-3 py-2 text-sm",
          "cursor-text hover:border-accent hover:text-accent-foreground",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          "transition-colors"
        )}
        onClick={() => {
          setIsOpen(true);
          if (selectedCategory) {
            setSearchTerm(selectedCategory.name);
          }
        }}
      >
        {selectedCategory && !searchTerm ? (
          <div className="flex items-center gap-2">
            <img
              src={process.env.NEXT_PUBLIC_BASE_URL + selectedCategory.image}
              alt={selectedCategory.name}
              className="w-6 h-6 rounded-full object-cover"
            />
            <span className="truncate">{selectedCategory.name}</span>
          </div>
        ) : (
          <input
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            onClick={handleInputClick}
            placeholder={selectedCategory ? selectedCategory.name : placeholder}
            className="w-full bg-transparent border-none focus:outline-none focus:ring-0"
          />
        )}

        <div className="flex items-center gap-1">
          {selectedCategory && !searchTerm && (
            <button
              type="button"
              onClick={handleClear}
              className="p-0.5 rounded-full hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <Search className="h-4 w-4 ml-1" />
        </div>
      </div>

      {/* Dropdown content */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
          <div className="max-h-60 overflow-auto">
            {filteredCategories && filteredCategories.length > 0 ? (
              filteredCategories.map((category) => (
                <div
                  key={category._id}
                  className={cn(
                    "flex items-center gap-3 rounded-sm px-2 py-1.5 text-sm",
                    "cursor-pointer hover:bg-accent hover:text-accent-foreground",
                    selectedCategory?._id === category._id && "bg-accent"
                  )}
                  onClick={() => handleSelect(category)}
                >
                  <img
                    src={process.env.NEXT_PUBLIC_BASE_URL + category.image}
                    alt={category.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="flex flex-col font-medium">
                    {category.name}
                  </div>
                </div>
              ))
            ) : (
              <div className="px-2 py-3 text-center text-sm text-muted-foreground">
                No categories found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
