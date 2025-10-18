"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calculator, Package } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { IProduct } from "../products/products-table";

interface LowStockItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  supplier: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  priority: string;
  trend: string;
  daysLeft: number;
  avgDailyUsage: number;
}

interface QuickOrderDialogProps {
  item: IProduct | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickOrderDialog({
  item,
  open,
  onOpenChange,
}: QuickOrderDialogProps) {
  const [orderQuantity, setOrderQuantity] = useState(0);
  const [estimatedPrice, setEstimatedPrice] = useState(0);

  useEffect(() => {
    if (item) {
      // Calculate suggested order quantity (restore to max stock)
      const suggestedQuantity = item.maxQty - item.currentStock;
      setOrderQuantity(suggestedQuantity);
      // Mock price calculation
      setEstimatedPrice(suggestedQuantity * 15.99);
    }
  }, [item]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;

    // Handle order submission
    console.log("Creating order:", {
      productId: item._id,

      quantity: orderQuantity,
      estimatedPrice,
    });
    onOpenChange(false);
  };

  const handleSuggestedQuantity = (type: "min" | "max" | "optimal") => {
    if (!item) return;

    let quantity = 0;
    switch (type) {
      case "min":
        quantity = item.minQty - item.currentStock;
        break;
      case "max":
        quantity = item.maxQty - item.currentStock;
        break;
      case "optimal":
        // 30 days worth of stock
        quantity = Math.ceil((item.maxQty / 2) * 30) - item.currentStock;
        break;
    }
    setOrderQuantity(Math.max(0, quantity));
    setEstimatedPrice(Math.max(0, quantity) * 15.99);
  };

  if (!item) return null;

  const getPriorityText = (stock: number, min: number) => {
    if (stock <= 0) {
      return "Critical";
    }
    if (stock < min / 2) {
      return "High";
    } else {
      return "Medium";
    }
  };

  const getPriorityColor = (stock: number, min: number) => {
    if (stock <= 0) {
      return "destructive";
    }
    if (stock < min / 2) {
      return "secondary";
    } else {
      return "default";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-heading flex items-center gap-2">
            <Package className="h-5 w-5" />
            Quick Order
          </DialogTitle>
          <DialogDescription>
            Create a purchase order for this low stock item.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Product Info */}
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{item.name}</h3>
              <Badge variant={getPriorityColor(item.currentStock, item.minQty)}>
                {getPriorityText(item.currentStock, item.minQty)}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>
                Current Stock: {item.currentStock} / {item.maxQty}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Order Quantity</Label>
              <Input
                id="quantity"
                type="number"
                value={orderQuantity}
                onChange={(e) => {
                  const qty = Number.parseInt(e.target.value) || 0;
                  setOrderQuantity(qty);
                  setEstimatedPrice(qty * 15.99);
                }}
                min="1"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Select supplier</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select a supplier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={"asd"}>
                    <div>
                      <div className="font-medium">bame</div>
                      <div className="text-sm text-muted-foreground">
                        number
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value={"ss"}>
                    <div>
                      <div className="font-medium">bame</div>
                      <div className="text-sm text-muted-foreground">
                        number
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Order Summary */}
            <div className="p-3 bg-card border rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm">Estimated Total:</span>
                <span className="font-medium">
                  ${estimatedPrice.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>New Stock Level:</span>
                <span>{item.currentStock + orderQuantity}</span>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Create Order</Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
