// components/ui/multi-supplier-select.tsx
"use client";

import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";
import { get_all_suppliers } from "@/lib/apis/suppliers";
import { ISupplier } from "@/app/dashboard/suppliers/page";
import { Badge } from "@/components/ui/badge";

interface MultiSupplierSelectProps {
  suppliers?: ISupplier[]; // Optional prop for suppliers to display
  selectedSuppliers: ISupplier[];
  onSuppliersChange: (suppliers: ISupplier[]) => void;
  placeholder?: string;
  className?: string;
}

export function MultiSupplierSelect({
  suppliers, // Don't provide a default here to distinguish between passed and undefined
  selectedSuppliers,
  onSuppliersChange,
  placeholder = "Select suppliers...",
  className,
}: MultiSupplierSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [localSuppliers, setLocalSuppliers] = useState<ISupplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch suppliers if not provided via props
  useEffect(() => {
    const fetchSuppliers = async () => {
      if (!suppliers) {
        // Only fetch if suppliers prop is not provided
        try {
          const response = await get_all_suppliers();
          console.log("Fetched suppliers response:", response);

          // Check if response has suppliers property
          if (response && Array.isArray(response.suppliers)) {
            setLocalSuppliers(response.suppliers || []);
          } else if (response && Array.isArray(response)) {
            // If response is directly an array
            setLocalSuppliers(response);
          } else {
            console.error("Unexpected response format:", response);
            setLocalSuppliers([]);
          }
        } catch (error) {
          console.error("Error fetching suppliers:", error);
          setLocalSuppliers([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        // If suppliers prop is provided, use it
        setLocalSuppliers(suppliers);
        setIsLoading(false);
      }
    };

    fetchSuppliers();
  }, [suppliers]);

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

  const handleSelect = (supplier: ISupplier) => {
    if (!selectedSuppliers.some((s) => s._id === supplier._id)) {
      const newSelectedSuppliers = [...selectedSuppliers, supplier];
      onSuppliersChange(newSelectedSuppliers);
    }
    setSearchTerm("");
  };

  const handleRemove = (supplierId: string) => {
    const newSelectedSuppliers = selectedSuppliers.filter(
      (s) => s._id !== supplierId
    );
    onSuppliersChange(newSelectedSuppliers);
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

  // Filter suppliers based on search term and exclude already selected
  const filteredSuppliers =
    searchTerm.trim() === ""
      ? localSuppliers.filter(
          (supplier) =>
            !selectedSuppliers.some((selected) => selected._id === supplier._id)
        )
      : localSuppliers.filter(
          (supplier) =>
            (supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              supplier.contactPerson
                .toLowerCase()
                .includes(searchTerm.toLowerCase())) &&
            !selectedSuppliers.some((selected) => selected._id === supplier._id)
        );

  if (isLoading) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-md border bg-background px-3 py-2 text-sm",
          className
        )}
      >
        <span className="text-muted-foreground">Loading suppliers...</span>
      </div>
    );
  }

  return (
    <div className={cn("relative", className)} ref={containerRef}>
      {/* Multi-select input display */}
      <div
        className={cn(
          "flex flex-wrap items-center gap-1 rounded-md border bg-background px-3 py-1 text-sm min-h-[38px]",
          "cursor-text hover:border-accent hover:text-accent-foreground",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          "transition-colors"
        )}
        onClick={() => {
          setIsOpen(true);
        }}
      >
        {/* Selected supplier badges */}
        {selectedSuppliers.map((supplier) => (
          <Badge
            key={supplier._id}
            variant="secondary"
            className="flex items-center gap-1 px-2 py-1"
          >
            {supplier.name}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove(supplier._id);
              }}
              className="ml-1 rounded-full hover:bg-secondary-foreground/20"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}

        {/* Search input */}
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onClick={handleInputClick}
          placeholder={selectedSuppliers.length === 0 ? placeholder : ""}
          className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 min-w-[100px]"
        />

        <Search className="h-4 w-4 ml-1 text-muted-foreground" />
      </div>

      {/* Dropdown content */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
          <div className="max-h-60 overflow-auto">
            {filteredSuppliers && filteredSuppliers.length > 0 ? (
              filteredSuppliers.map((supplier) => (
                <div
                  key={supplier._id}
                  className={cn(
                    "flex items-center gap-3 rounded-sm px-2 py-1.5 text-sm",
                    "cursor-pointer hover:bg-accent hover:text-accent-foreground"
                  )}
                  onClick={() => handleSelect(supplier)}
                >
                  <img
                    src={process.env.NEXT_PUBLIC_BASE_URL + supplier.image}
                    alt={supplier.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">{supplier.name}</span>
                    <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                      {supplier.contactPerson} - {supplier.email}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-2 py-3 text-center text-sm text-muted-foreground">
                {searchTerm
                  ? "No suppliers found"
                  : "No more suppliers to select"}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
