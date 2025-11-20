import React, { useEffect, useRef, useState } from "react";
import { X, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface Category {
  _id: string;
  name: string;
  image: string;
  description?: string;
}

interface Props {
  categories: Category[];
  selectedCategory: Category | null;
  onSelect: (c: Category | null) => void;
  placeholder?: string;
  className?: string;
  isLoading?: boolean;
}

const resolveCategoryImage = (image?: string) => {
  if (!image) return "";
  return image.startsWith("http") ? image : process.env.NEXT_PUBLIC_BASE_URL + image;
};

export function CategorySelect({
  categories,
  selectedCategory,
  onSelect,
  placeholder = "Select category...",
  className,
  isLoading = false,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [localCategories, setLocalCategories] = useState<Category[]>(categories);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setLocalCategories(categories);
  }, [categories]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (c: Category) => {
    onSelect(c);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(null);
    setSearchTerm("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleInputClick = (e: React.MouseEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (!isOpen) setIsOpen(true);
  };

  const filteredCategories =
    searchTerm.trim() === ""
      ? localCategories
      : localCategories.filter((c) =>
          c.name.toLowerCase().includes(searchTerm.toLowerCase())
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
              src={resolveCategoryImage(selectedCategory.image)}
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

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
          <div className="max-h-60 overflow-auto">
            {filteredCategories && filteredCategories.length > 0 ? (
              filteredCategories.map((c) => (
                <div
                  key={c._id}
                  className={cn(
                    "flex items-center gap-3 rounded-sm px-2 py-1.5 text-sm",
                    "cursor-pointer hover:bg-accent hover:text-accent-foreground",
                    selectedCategory?._id === c._id && "bg-accent"
                  )}
                  onClick={() => handleSelect(c)}
                >
                  <img
                    src={resolveCategoryImage(c.image)}
                    alt={c.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="flex flex-col font-medium">{c.name}</div>
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