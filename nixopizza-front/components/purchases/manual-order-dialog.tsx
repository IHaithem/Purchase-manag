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
import { resolveImage } from "@/lib/resolveImage";

interface IOrderItem {
  _id?: string;
  productId: string;
  quantity: number;
  unitCost: number;
  expirationDate: Date;
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
  const [expectedDate, setExpectedDate] = useState<string>("");
  const [billFile, setBillFile] = useState<File | null>(null);
  const [billPreview, setBillPreview] = useState<string | null>(null);

  // Products state
  const [products, setProducts] = useState<IProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<IProduct[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<(IProduct | null)[]>([
    null,
  ]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // Submission/Error state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch products on mount
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
      } catch (err) {
        console.error("Error fetching products:", err);
        setProducts([]);
        setError("Failed to load products. Please refresh the page.");
      } finally {
        setIsLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  // Filter products based on supplier categories
  useEffect(() => {
    if (selectedSupplier && selectedSupplier.categoryIds) {
      const filtered = products.filter((product) => {
        const productCategoryId =
          typeof product.categoryId === "object"
            ? (product.categoryId as any)?._id
            : (product as any).categoryId;
        return selectedSupplier.categoryIds.includes(productCategoryId);
      });
      setFilteredProducts(filtered);
      setSelectedProducts(orderItems.map(() => null));
      setOrderItems((prev) =>
        prev.map((item) => ({ ...item, productId: "" }))
      );
    } else {
      setFilteredProducts([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSupplier, products]);

  const addOrderItem = () => {
    setOrderItems((items) => [
      ...items,
      { productId: "", quantity: 1, unitCost: 0, expirationDate: new Date() },
    ]);
    setSelectedProducts((prev) => [...prev, null]);
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
    setOrderItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // IMPORTANT FIX: ProductSelect expects 'onSelect', not 'onProductChange'
    const handleProductSelect = (index: number, product: any | null) => {
      const updatedSelectedProducts = [...selectedProducts];
      // Cast the incoming product to IProduct | null to satisfy the selectedProducts state type
      updatedSelectedProducts[index] = product as IProduct | null;
      setSelectedProducts(updatedSelectedProducts);
  
      updateOrderItem(index, "productId", product ? (product as IProduct)._id : "");
    };

  const handleSupplierChange = (supplier: ISupplier | null) => {
    setSelectedSupplier(supplier);
    if (supplier) setError(null);
  };

  const handleBillUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (
        !file.type.match("image.*") &&
        !file.type.match("application/pdf")
      ) {
        toast.error("Please select an image or PDF file");
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

    if (!selectedSupplier) {
      setError("Please select a supplier");
      return;
    }
    if (orderItems.length === 0) {
      setError("Please add at least one order item");
      return;
    }
    if (orderItems.some((item) => !item.productId)) {
      setError("Please select products for all order items");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const dataToSend = new FormData();
      dataToSend.append("supplierId", selectedSupplier._id);
      dataToSend.append("notes", notes);

      if (expectedDate) {
        dataToSend.append(
          "expectedDate",
          new Date(expectedDate).toISOString()
        );
      }

      if (billFile) {
        dataToSend.append("image", billFile);
      }

      orderItems.forEach((item, index) => {
        dataToSend.append(`items[${index}][productId]`, item.productId);
        dataToSend.append(`items[${index}][quantity]`, item.quantity.toString());
        dataToSend.append(`items[${index}][unitCost]`, item.unitCost.toString());
        dataToSend.append(
          `items[${index}][expirationDate]`,
          new Date(item.expirationDate).toISOString()
        );
      });

      const { success, message, order } = await createOrder(dataToSend);
      if (success) {
        addNewOrder(order);
        toast.success("Order created successfully");
        resetForm();
        setOpen(false);
      } else {
        setError(message || "Failed to create order. Please try again.");
      }
    } catch (err) {
      console.error("Error creating order:", err);
      setError("An unexpected error occurred. Please try again.");
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
    setFilteredProducts([]);
    setNotes("");
    setExpectedDate("");
    setBillFile(null);
    setBillPreview(null);
    setError(null);
  };

  const handleDialogChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) resetForm();
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
                onSupplierChange={handleSupplierChange}
                placeholder="Select a supplier"
                className="border-2 border-input focus:ring-2 focus:ring-primary/30 rounded-lg"
              />
              {selectedSupplier && (
                <div className="text-sm text-muted-foreground mt-2">
                  Contact: {selectedSupplier.phone1} • {selectedSupplier.email}
                </div>
              )}
              {selectedSupplier && filteredProducts.length === 0 && (
                <div className="bg-yellow-50 text-yellow-700 px-4 py-3 rounded-lg flex items-center gap-2 border border-yellow-200 mt-2">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">
                    No products available for this supplier's categories. Please
                    select another supplier or add products to matching
                    categories.
                  </span>
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
                  disabled={
                    !selectedSupplier ||
                    isLoadingProducts ||
                    filteredProducts.length === 0
                  }
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
                  {orderItems.map((item, index) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row items-start sm:items-end gap-4 p-4 border rounded-xl bg-card"
                    >
                      <div className="flex-1 space-y-2">
                        <Label className="text-sm font-medium">Product *</Label>
                        <ProductSelect
                          products={filteredProducts}
                          selectedProduct={selectedProducts[index] || null}
                          onSelect={(product) =>
                            handleProductSelect(index, product)
                          }
                          placeholder={
                            selectedSupplier
                              ? filteredProducts.length > 0
                                ? "Select product"
                                : "No products available"
                              : "Select supplier first"
                          }
                          className="border-2 border-input focus:ring-2 focus:ring-primary/30 rounded-lg"
                          disabled={
                            !selectedSupplier || filteredProducts.length === 0
                          }
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

                      {/* OPTIONAL: Re-enable Unit Price so totalAmount is meaningful */}
                      {/* <div className="w-full sm:w-28 space-y-2">
                        <Label className="text-sm font-medium">Unit Price *</Label>
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
                      </div> */}

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
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bill Upload (currently commented out in original) */}
          {/* You can re-enable if needed; now uses billPreview object URL directly */}

          {/* Expected Date */}
          <div className="space-y-2">
            <Label htmlFor="expectedDate" className="text-sm font-medium">
              Expected Delivery Date (Optional)
            </Label>
            <Input
              id="expectedDate"
              type="date"
              value={expectedDate}
              onChange={(e) => setExpectedDate(e.target.value)}
              className="border-2 border-input focus:ring-2 focus:ring-primary/30 rounded-lg"
            />
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
                filteredProducts.length === 0 ||
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