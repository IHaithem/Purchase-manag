// components/ui/product-select.tsx
"use client";

import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";
import { getProducts } from "@/lib/apis/products";
import { IProduct } from "@/app/dashboard/products/page";

interface ProductSelectProps {
  products?: IProduct[];
  selectedProduct: IProduct | null;
  onProductChange: (product: IProduct | null) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function ProductSelect({
  products,
  selectedProduct,
  onProductChange,
  placeholder = "Select a product...",
  className,
  disabled = false,
}: ProductSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [localProducts, setLocalProducts] = useState<IProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Synchronize provided products prop or fetch when missing
  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      try {
        if (!products) {
          const response = await getProducts();
          if (!isMounted) return;


          if (response && Array.isArray(response.products)) {
            setLocalProducts(response.products || []);
          } else if (response && Array.isArray(response)) {

            setLocalProducts(response);
          } else {
            console.error("Unexpected response format:", response);
            setLocalProducts([]);
          }
        } else {
          setLocalProducts(products);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setLocalProducts([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    setIsLoading(true);
    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, [products]);

  // Close dropdown if clicking outside
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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Ensure dropdown closes when disabled toggles on
  useEffect(() => {
    if (disabled) {
      setIsOpen(false);
      setSearchTerm("");
    }
  }, [disabled]);

  const handleSelect = (product: IProduct) => {
    if (disabled) return;
    onProductChange(product);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClear = () => {
    if (disabled) return;
    onProductChange(null);
    setSearchTerm("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const value = e.target.value;
    setSearchTerm(value);

    if (!isOpen) {
      setIsOpen(true);
    }
  };

  const handleInputClick = (e: React.MouseEvent) => {
    if (disabled) return;
    e.stopPropagation();
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  // Filter products based on search term
  const filteredProducts =
    searchTerm.trim() === ""
      ? localProducts
      : localProducts.filter(
          (product) =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.barcode.toLowerCase().includes(searchTerm.toLowerCase())
        );

  if (isLoading) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-md border bg-background px-3 py-2 text-sm",
          className
        )}
      >
        <span className="text-muted-foreground">Loading products...</span>
      </div>
    );
  }

  return (
    <div
      className={cn("relative", className)}
      ref={containerRef}
      aria-disabled={disabled || undefined}
    >
      {/* Searchable input display */}
      <div
        className={cn(
          "flex items-center justify-between rounded-md border bg-background px-3 py-2 text-sm",
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "cursor-text hover:border-accent hover:text-accent-foreground",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          "transition-colors"
        )}
        onClick={() => {
          if (disabled) return;
          setIsOpen(true);
          if (selectedProduct) {
            setSearchTerm(selectedProduct.name);
          }
        }}
      >
        {selectedProduct && !searchTerm ? (
          <div className="flex items-center gap-2">
            {selectedProduct.imageUrl ? (
              <img
                src={
                  process.env.NEXT_PUBLIC_BASE_URL + selectedProduct.imageUrl
                }
                alt={selectedProduct.name}
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                <span className="text-xs font-medium">
                  {selectedProduct.name.charAt(0)}
                </span>
              </div>
            )}
            <span className="truncate">{selectedProduct.name}</span>
          </div>
        ) : (
          <input
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            onClick={handleInputClick}
            placeholder={selectedProduct ? selectedProduct.name : placeholder}
            className={cn(
              "w-full bg-transparent border-none focus:outline-none focus:ring-0",
              disabled && "cursor-not-allowed"
            )}
            disabled={disabled}
          />
        )}

        <div className="flex items-center gap-1">
          {selectedProduct && !searchTerm && (
            <button
              type="button"
              onClick={handleClear}
              className={cn(
                "p-0.5 rounded-full hover:bg-muted",
                disabled && "pointer-events-none opacity-50"
              )}
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <Search className="h-4 w-4 ml-1" />
        </div>
      </div>

      {/* Dropdown content */}
      {isOpen && !disabled && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
          <div className="max-h-60 overflow-auto">
            {filteredProducts && filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <div
                  key={product._id}
                  className={cn(
                    "flex items-center gap-3 rounded-sm px-2 py-1.5 text-sm",
                    "cursor-pointer hover:bg-accent hover:text-accent-foreground",
                    selectedProduct?._id === product._id && "bg-accent"
                  )}
                  onClick={() => handleSelect(product)}
                >
                  {product.imageUrl ? (
                    <img
                      src={
                        process.env.NEXT_PUBLIC_BASE_URL + product.imageUrl
                      }
                      alt={product.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-xs font-medium">
                        {product.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="font-medium">{product.name}</span>
                    <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                      {product.barcode} - {product.currentStock} in stock
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-2 py-3 text-center text-sm text-muted-foreground">
                No products found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
