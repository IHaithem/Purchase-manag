"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Package, Trash2, AlertCircle, Loader2 } from "lucide-react";
import { ProductSelect } from "@/components/ui/product-select";
import { SupplierSelect } from "@/components/ui/supplier-select";
import { createOrder } from "@/lib/apis/purchase-list";
import { getProducts } from "@/lib/apis/products";
import toast from "react-hot-toast";
import { IProduct } from "@/app/dashboard/products/page";
import { ISupplier } from "@/app/dashboard/suppliers/page";
import { IOrder } from "@/app/dashboard/purchases/page";

interface IOrderItem {
  productId: string;
  quantity: number;
  unitCost: number;
  expirationDate: Date;
}

export function ManualOrderDialog({
  addNewOrder,
}: {
  addNewOrder: (newOrder: IOrder) => void;
}) {
  const [open, setOpen] = useState(false);
  const [supplier, setSupplier] = useState<ISupplier | null>(null);
  const [orderItems, setOrderItems] = useState<IOrderItem[]>([
    { productId: "", quantity: 1, unitCost: 0, expirationDate: new Date() },
  ]);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<(IProduct | null)[]>([null]);
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --------------------------
  // Fetch Products when Supplier changes
  // --------------------------
  useEffect(() => {
    const fetchProducts = async () => {
      if (!supplier?.categoryIds?.length) {
        setProducts([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // You can adjust this depending on your backend query param (categoryId or multiple)
        const categoryIds = supplier.categoryIds.join(",");
        const res = await getProducts({ categoryIds: categoryIds , limit: 100 });
        const list = Array.isArray(res?.products) ? res.products : Array.isArray(res) ? res : [];
        console.log(list);
        setProducts(list);
      } catch (e) {
        console.error(e);
        setError("Failed to load products for this supplier.");
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
    // Reset items when supplier changes
    setOrderItems([{ productId: "", quantity: 1, unitCost: 0, expirationDate: new Date() }]);
    setSelectedProducts([null]);
  }, [supplier?.name]);

  // --------------------------
  // Handlers
  // --------------------------
  const addItem = () => {
    setOrderItems(prev => [...prev, { productId: "", quantity: 1, unitCost: 0, expirationDate: new Date() }]);
    setSelectedProducts(prev => [...prev, null]);
  };

  const removeItem = (i: number) => {
    if (orderItems.length <= 1) return;
    setOrderItems(prev => prev.filter((_, idx) => idx !== i));
    setSelectedProducts(prev => prev.filter((_, idx) => idx !== i));
  };

  const updateItem = (i: number, field: keyof IOrderItem, value: any) => {
    setOrderItems(prev => prev.map((item, idx) => (idx === i ? { ...item, [field]: value } : item)));
  };

  const handleProductSelect = (i: number, product: IProduct | null) => {
    setSelectedProducts(prev => prev.map((p, idx) => (idx === i ? product : p)));
    updateItem(i, "productId", product?._id || "");
  };

  const resetForm = useCallback(() => {
    setSupplier(null);
    setOrderItems([{ productId: "", quantity: 1, unitCost: 0, expirationDate: new Date() }]);
    setSelectedProducts([null]);
    setProducts([]);
    setNotes("");
    setError(null);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplier) return setError("Please select a supplier.");
    if (orderItems.some(i => !i.productId)) return setError("All items must have a product.");

    setIsSubmitting(true);
    setError(null);

    try {
      const form = new FormData();
      form.append("supplierId", supplier._id);
      form.append("notes", notes);
      orderItems.forEach((item, i) => {
        form.append(`items[${i}][productId]`, item.productId);
        form.append(`items[${i}][quantity]`, String(item.quantity));
        form.append(`items[${i}][unitCost]`, String(item.unitCost));
        form.append(`items[${i}][expirationDate]`, item.expirationDate.toISOString());
      });

      const res = await createOrder(form);
      if (res?.success) {
        toast.success("Order created successfully!");
        addNewOrder(res.order);
        resetForm();
        setOpen(false);
      } else {
        setError(res?.message || "Failed to create order.");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDialogChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) resetForm();
  };

  // --------------------------
  // Render
  // --------------------------
  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogTrigger asChild>
        <Button className="gap-2 rounded-full">
          <Plus className="h-4 w-4" /> Manual Order
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-heading">
            <Package className="h-5 w-5" /> Create Manual Order
          </DialogTitle>
          <DialogDescription>
            Create a custom purchase order by selecting supplier and products.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="flex items-center gap-2 p-3 text-sm border border-destructive/20 rounded-lg bg-destructive/15 text-destructive">
            <AlertCircle className="h-4 w-4" /> {error}
          </div>
        )}

        {isLoading && (
          <div className="flex items-center gap-2 p-3 text-sm border border-blue-200 rounded-lg bg-blue-50 text-blue-700">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading products...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Supplier */}
          <div className="space-y-2">
            <Label>Supplier *</Label>
            <SupplierSelect
              selectedSupplier={supplier}
              onSupplierChange={setSupplier}
              placeholder="Select a supplier"
              className="border-2 border-input rounded-lg focus:ring-2 focus:ring-primary/30"
            />
            {supplier && (
              <div className="text-sm text-muted-foreground">
                Contact: {supplier.phone} • {supplier.email}
              </div>
            )}
            {supplier && !isLoading && products.length === 0 && (
              <div className="flex items-center gap-2 p-3 text-sm border border-yellow-200 rounded-lg bg-yellow-50 text-yellow-700">
                <AlertCircle className="h-4 w-4" /> No products found for this supplier.
              </div>
            )}
          </div>

          {/* Order Items */}
          <Card className="shadow-sm border-0 rounded-xl">
            <CardHeader className="pb-4 flex justify-between items-center">
              <CardTitle className="text-lg font-heading">Order Items</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2 rounded-full border-2 border-input"
                onClick={addItem}
                disabled={!supplier || isLoading || products.length === 0}
              >
                <Plus className="h-4 w-4" /> Add Item
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {orderItems.map((item, i) => (
                <div key={i} className="flex flex-col sm:flex-row gap-4 p-4 bg-card border rounded-xl">
                  <div className="flex-1 space-y-2">
                    <Label>Product *</Label>
                    <ProductSelect
                      products={products}
                      selectedProduct={selectedProducts[i]}
                      onProductChange={p => handleProductSelect(i, p)}
                      placeholder={supplier ? "Select product" : "Select supplier first"}
                      className="border-2 border-input rounded-lg focus:ring-2 focus:ring-primary/30"
                      disabled={!supplier || products.length === 0}
                    />
                  </div>

                  <div className="w-full sm:w-24 space-y-2">
                    <Label>Quantity *</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={e => updateItem(i, "quantity", Number(e.target.value) || 1)}
                      className="border-2 border-input rounded-lg py-5 focus:ring-2 focus:ring-primary/30"
                    />
                  </div>

                  <div className="w-full sm:w-28 space-y-2">
                    <Label>Expiry Date *</Label>
                    <Input
                      type="date"
                      value={new Date(item.expirationDate).toISOString().split("T")[0]}
                      onChange={e => updateItem(i, "expirationDate", new Date(e.target.value))}
                      className="border-2 border-input rounded-lg py-5 focus:ring-2 focus:ring-primary/30"
                    />
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={orderItems.length <= 1}
                    onClick={() => removeItem(i)}
                    className="text-destructive border-2 border-input rounded-full w-10 h-10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes (Optional)</Label>
            <Textarea
              placeholder="Add special instructions..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              className="border-2 border-input rounded-lg focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
              className="rounded-full px-6"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!supplier || isSubmitting || isLoading || products.length === 0 || orderItems.some(i => !i.productId)}
              className="rounded-full px-6 bg-primary hover:bg-primary/90"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Create Order"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
