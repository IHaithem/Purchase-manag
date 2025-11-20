import React, { useEffect, useRef, useState } from "react";
import { X, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { resolveImage } from "@/lib/resolveImage";

interface Product {
  _id: string;
  name: string;
  imageUrl?: string;
  barcode?: string;
  currentStock: number;
  minQty: number;
}

interface Props {
  products: Product[];
  selectedProduct: Product | null;
  onSelect: (p: Product | null) => void;
  placeholder?: string;
  className?: string;
  isLoading?: boolean;
  disabled?: boolean;
}

export function ProductSelect({
  products,
  selectedProduct,
  onSelect,
  placeholder = "Select product...",
  className,
  isLoading = false,
  disabled = false,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [localProducts, setLocalProducts] = useState<Product[]>(products);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setLocalProducts(products);
  }, [products]);

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

  const handleSelect = (p: Product) => {
    onSelect(p);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(null);
    setSearchTerm("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSearchTerm(e.target.value);

  const handleInputClick = (e: React.MouseEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (!disabled && !isOpen) setIsOpen(true);
  };

  const filteredProducts =
    searchTerm.trim() === ""
      ? localProducts
      : localProducts.filter((p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase())
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
                src={resolveImage(selectedProduct.imageUrl)}
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
                      src={resolveImage(product.imageUrl)}
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