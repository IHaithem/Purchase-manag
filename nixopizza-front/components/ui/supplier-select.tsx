// components/ui/supplier-select.tsx
"use client";

import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";
import { get_all_suppliers } from "@/lib/apis/suppliers";
import { ISupplier } from "@/app/dashboard/suppliers/page";

interface SupplierSelectProps {
  suppliers?: ISupplier[]; // Optional prop for suppliers to display
  selectedSupplier: ISupplier | null;
  onSupplierChange: (supplier: ISupplier | null) => void;
  placeholder?: string;
  className?: string;
}

export function SupplierSelect({
  suppliers, // Don't provide a default here to distinguish between passed and undefined
  selectedSupplier,
  onSupplierChange,
  placeholder = "Select a supplier...",
  className,
}: SupplierSelectProps) {
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
          console.log("Fetching suppliers...");
          const response = await get_all_suppliers(); // This returns the data directly
          console.log("Raw API response:", response);

          // Check if response is an array directly (most likely case)
          if (Array.isArray(response)) {
            setLocalSuppliers(response);
          }
          // Sometimes APIs wrap the array in a 'data' property
          else if (response && Array.isArray(response.data)) {
            setLocalSuppliers(response.data);
          }
          // Sometimes APIs wrap the array in a 'suppliers' property
          else if (response && Array.isArray(response.suppliers)) {
            setLocalSuppliers(response.suppliers);
          } else {
            console.error(
              "Unexpected response format for suppliers:",
              response
            );
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
    onSupplierChange(supplier);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSupplierChange(null);
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

  // Filter suppliers based on search term
  const filteredSuppliers =
    searchTerm.trim() === ""
      ? localSuppliers
      : localSuppliers.filter(
          (supplier) =>
            supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (supplier.contactPerson &&
              supplier.contactPerson
                .toLowerCase()
                .includes(searchTerm.toLowerCase()))
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
          if (selectedSupplier) {
            setSearchTerm(selectedSupplier.name);
          }
        }}
      >
        {selectedSupplier && !searchTerm ? (
          <div className="flex items-center gap-2">
            {selectedSupplier.image ? (
              <img
                src={process.env.NEXT_PUBLIC_BASE_URL + selectedSupplier.image}
                alt={selectedSupplier.name}
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                <span className="text-xs font-medium">
                  {selectedSupplier.name.charAt(0)}
                </span>
              </div>
            )}
            <span className="truncate">{selectedSupplier.name}</span>
          </div>
        ) : (
          <input
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            onClick={handleInputClick}
            placeholder={selectedSupplier ? selectedSupplier.name : placeholder}
            className="w-full bg-transparent border-none focus:outline-none focus:ring-0"
          />
        )}

        <div className="flex items-center gap-1">
          {selectedSupplier && !searchTerm && (
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
            {filteredSuppliers && filteredSuppliers.length > 0 ? (
              filteredSuppliers.map((supplier) => (
                <div
                  key={supplier._id}
                  className={cn(
                    "flex items-center gap-3 rounded-sm px-2 py-1.5 text-sm",
                    "cursor-pointer hover:bg-accent hover:text-accent-foreground",
                    selectedSupplier?._id === supplier._id && "bg-accent"
                  )}
                  onClick={() => handleSelect(supplier)}
                >
                  {supplier.image ? (
                    <img
                      src={process.env.NEXT_PUBLIC_BASE_URL + supplier.image}
                      alt={supplier.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-xs font-medium">
                        {supplier.name.charAt(0)}
                      </span>
                    </div>
                  )}
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
                No suppliers found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
