// components/purchases/manual-order-dialog.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  Package,
  Trash2,
  AlertCircle,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { createOrder } from "@/lib/apis/purchase-list";
import { ProductSelect } from "@/components/ui/product-select";
import { SupplierSelect } from "@/components/ui/supplier-select";
import { getProducts } from "@/lib/apis/products";
import { IProduct } from "@/app/dashboard/products/page";
import { ISupplier } from "@/app/dashboard/suppliers/page";
import { IOrder } from "@/app/dashboard/purchases/page";
import toast from "react-hot-toast";

// Types for real data
interface IOrderItem {
  _id?: string;
  productId: string;
  quantity: number;
  expirationDate: Date;
  unitCost: number;
  remainingQte?: number;
  isExpired?: boolean;
  expiredQuantity?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export function ManualOrderDialog({
  addNewOrder,
}: {
  addNewOrder: (newOrder: IOrder) => void;
}) {
  const [open, setOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<ISupplier | null>(
    null
  );
  const [orderItems, setOrderItems] = useState<IOrderItem[]>([
    { productId: "", quantity: 1, unitCost: 0, expirationDate: new Date() },
  ]);
  const [notes, setNotes] = useState("");
  const [billFile, setBillFile] = useState<File | null>(null);
  const [billPreview, setBillPreview] = useState<string | null>(null);

  // Add state for products and selected products
  const [products, setProducts] = useState<IProduct[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<(IProduct | null)[]>(
    [null]
  );
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // Data fetching states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch products when component mounts
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoadingProducts(true);
        const response = await getProducts();

        if (response && Array.isArray(response.products)) {
          setProducts(response.products);
        } else if (response && Array.isArray(response)) {
          setProducts(response);
        } else {
          console.error("Unexpected response format:", response);
          setProducts([]);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
        setError("Failed to load products. Please refresh the page.");
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  const addOrderItem = () => {
    setOrderItems([
      ...orderItems,
      { productId: "", quantity: 1, unitCost: 0, expirationDate: new Date() },
    ]);
    setSelectedProducts([...selectedProducts, null]);
  };

  const removeOrderItem = (index: number) => {
    if (orderItems.length <= 1) return;
    setOrderItems(orderItems.filter((_, i) => i !== index));
    setSelectedProducts(selectedProducts.filter((_, i) => i !== index));
  };

  const updateOrderItem = (
    index: number,
    field: keyof IOrderItem,
    value: string | number | Date
  ) => {
    const updated = [...orderItems];
    updated[index] = { ...updated[index], [field]: value };
    setOrderItems(updated);
  };

  const handleProductSelect = (index: number, product: IProduct | null) => {
    // Update selected products array
    const updatedSelectedProducts = [...selectedProducts];
    updatedSelectedProducts[index] = product;
    setSelectedProducts(updatedSelectedProducts);

    // Update order item with product ID
    if (product) {
      updateOrderItem(index, "productId", product._id);
    } else {
      updateOrderItem(index, "productId", "");
    }
  };

  const handleBillUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.match("image.*") && !file.type.match("application/pdf")) {
        alert("Please select an image or PDF file");
        return;
      }

      setBillFile(file);
      setBillPreview(URL.createObjectURL(file));
    }
  };

  const removeBill = () => {
    setBillFile(null);
    setBillPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!selectedSupplier) {
      setError("Please select a supplier");
      return;
    }

    if (orderItems.length === 0) {
      setError("Please add at least one order item");
      return;
    }

    // Check if all items have products selected
    const hasEmptyProducts = orderItems.some((item) => !item.productId);
    if (hasEmptyProducts) {
      setError("Please select products for all order items");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const dataToSend = new FormData();
      dataToSend.append("supplierId", selectedSupplier._id);
      dataToSend.append("notes", notes);

      // Add bill if provided
      if (billFile) {
        dataToSend.append("image", billFile);
      }

      // Add order items
      orderItems.forEach((item, index) => {
        dataToSend.append(`items[${index}][productId]`, item.productId);
        dataToSend.append(
          `items[${index}][quantity]`,
          item.quantity.toString()
        );
        dataToSend.append(
          `items[${index}][unitCost]`,
          item.unitCost.toString()
        );
        dataToSend.append(
          `items[${index}][expirationDate]`,
          new Date(item.expirationDate).toISOString()
        );
      });

      const { success, message, order } = await createOrder(dataToSend);
      if (success) {
        console.log("Order created successfully :", order);
        addNewOrder(order);
        toast.success("Order created successfully");
        resetForm();
        setOpen(false);
      } else {
        setError(message || "Failed to create order. Please try again.");
        console.error("Error creating order:", message);
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Error creating order:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedSupplier(null);
    setOrderItems([
      { productId: "", quantity: 1, unitCost: 0, expirationDate: new Date() },
    ]);
    setSelectedProducts([null]);
    setNotes("");
    setBillFile(null);
    setBillPreview(null);
    setError(null);
  };

  const handleDialogChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      resetForm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogTrigger asChild>
        <Button variant="default" className="gap-2 rounded-full">
          <Plus className="h-4 w-4" />
          Manual Order
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading flex items-center gap-2 text-xl">
            <Package className="h-5 w-5" />
            Create Manual Order
          </DialogTitle>
          <DialogDescription>
            Create a custom purchase order by selecting supplier and products.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-lg flex items-center gap-2 border border-destructive/20">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {isLoadingProducts && (
          <div className="bg-blue-50 text-blue-700 px-4 py-3 rounded-lg flex items-center gap-2 border border-blue-200">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Loading products...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Supplier Selection */}
          <div className="space-y-2">
            <Label htmlFor="supplier" className="text-sm font-medium">
              Supplier *
            </Label>
            <SupplierSelect
              selectedSupplier={selectedSupplier}
              onSupplierChange={setSelectedSupplier}
              placeholder="Select a supplier"
              className="border-2 border-input focus:ring-2 focus:ring-primary/30 rounded-lg"
            />
            {selectedSupplier && (
              <div className="text-sm text-muted-foreground mt-2">
                Contact: {selectedSupplier.phone} • {selectedSupplier.email}
              </div>
            )}
          </div>

          {/* Order Items */}
          <Card className="border-0 shadow-sm rounded-xl">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="font-heading text-lg">
                  Order Items
                </CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addOrderItem}
                  disabled={!selectedSupplier || isLoadingProducts}
                  className="gap-2 rounded-full border-2 border-input"
                >
                  <Plus className="h-4 w-4" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {orderItems.length > 0 && (
                <div className="space-y-4">
                  {orderItems.map((item, index) => {
                    return (
                      <div
                        key={index}
                        className="flex flex-col sm:flex-row items-start sm:items-end gap-4 p-4 border rounded-xl bg-card"
                      >
                        <div className="flex-1 space-y-2">
                          <Label className="text-sm font-medium">
                            Product *
                          </Label>
                          <ProductSelect
                            products={products}
                            selectedProduct={selectedProducts[index] || null}
                            onProductChange={(product) =>
                              handleProductSelect(index, product)
                            }
                            placeholder="Select product"
                            className="border-2 border-input focus:ring-2 focus:ring-primary/30 rounded-lg"
                          />
                        </div>
                        <div className="w-full sm:w-24 space-y-2">
                          <Label className="text-sm font-medium">
                            Quantity *
                          </Label>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              updateOrderItem(
                                index,
                                "quantity",
                                parseInt(e.target.value) || 1
                              )
                            }
                            className="border-2 border-input focus:ring-2 focus:ring-primary/30 rounded-lg py-5"
                          />
                        </div>
                        <div className="w-full sm:w-28 space-y-2">
                          <Label className="text-sm font-medium">
                            Unit Price *
                          </Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.unitCost}
                            onChange={(e) =>
                              updateOrderItem(
                                index,
                                "unitCost",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="border-2 border-input focus:ring-2 focus:ring-primary/30 rounded-lg py-5"
                          />
                        </div>
                        <div className="w-full sm:w-28 space-y-2">
                          <Label className="text-sm font-medium">
                            Expiry Date *
                          </Label>
                          <Input
                            type="date"
                            value={
                              item.expirationDate
                                ? new Date(item.expirationDate)
                                    .toISOString()
                                    .split("T")[0]
                                : ""
                            }
                            onChange={(e) =>
                              updateOrderItem(
                                index,
                                "expirationDate",
                                new Date(e.target.value)
                              )
                            }
                            className="border-2 border-input focus:ring-2 focus:ring-primary/30 rounded-lg py-5"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeOrderItem(index)}
                          disabled={orderItems.length <= 1}
                          className="text-destructive hover:text-destructive border-2 border-input w-10 h-10 rounded-full mt-4 sm:mt-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bill Upload */}
          <div className="space-y-2">
            <Label htmlFor="bill" className="text-sm font-medium">
              Bill (Bon) (Optional)
            </Label>
            <div className="flex items-center gap-4">
              {billPreview ? (
                <div className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-input shadow-sm">
                  {billFile?.type === "application/pdf" ? (
                    <div className="w-full h-full flex items-center justify-center bg-red-50">
                      <span className="text-red-500 font-medium">PDF</span>
                    </div>
                  ) : (
                    <img
                      src={billPreview}
                      alt="Bill preview"
                      className="w-full h-full object-cover"
                    />
                  )}
                  <button
                    type="button"
                    onClick={removeBill}
                    className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 hover:opacity-80 shadow-sm"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center w-24 h-24 border-2 border-dashed border-input rounded-xl bg-muted/20">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                </div>
              )}

              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="bill-upload"
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md cursor-pointer hover:opacity-90 transition-opacity"
                >
                  <Upload className="h-4 w-4" />
                  {billPreview ? "Change Bill" : "Upload Bill"}
                </Label>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG, PDF up to 5MB
                </p>
                <Input
                  id="bill-upload"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleBillUpload}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">
              Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              placeholder="Add any special instructions or notes for this order..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="border-2 border-input focus:ring-2 focus:ring-primary/30 rounded-lg"
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
              disabled={
                !selectedSupplier ||
                orderItems.length === 0 ||
                isSubmitting ||
                isLoadingProducts ||
                orderItems.some((item) => !item.productId)
              }
              className="rounded-full px-6 bg-primary hover:bg-primary/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                "Create Order"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
