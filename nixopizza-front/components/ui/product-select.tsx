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
}

export function ProductSelect({
  products,
  selectedProduct,
  onProductChange,
  placeholder = "Select a product...",
  className,
}: ProductSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [localProducts, setLocalProducts] = useState<IProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch products if not provided via props
  useEffect(() => {
    const fetchProducts = async () => {
      if (!products) {
        // Only fetch if products prop is not provided
        try {
          const response = await getProducts();
          console.log("Fetched products response:", response);

          // Check if response has products property
          if (response && Array.isArray(response.products)) {
            setLocalProducts(response.products || []);
          } else if (response && Array.isArray(response)) {
            // If response is directly an array
            setLocalProducts(response);
          } else {
            console.error("Unexpected response format:", response);
            setLocalProducts([]);
          }
        } catch (error) {
          console.error("Error fetching products:", error);
          setLocalProducts([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setLocalProducts(products);
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [products]);

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

  const handleSelect = (product: IProduct) => {
    onProductChange(product);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onProductChange(null);
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
            className="w-full bg-transparent border-none focus:outline-none focus:ring-0"
          />
        )}

        <div className="flex items-center gap-1">
          {selectedProduct && !searchTerm && (
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
                      src={process.env.NEXT_PUBLIC_BASE_URL + product.imageUrl}
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
