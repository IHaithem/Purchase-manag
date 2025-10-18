// components/stuff/assign-task-dialog.tsx
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
  Box,
  X,
} from "lucide-react";
import { ProductSelect } from "@/components/ui/product-select";
import { getProducts } from "@/lib/apis/products";
import { IProduct } from "@/app/dashboard/products/page";
import { ISupplier } from "@/app/dashboard/suppliers/page";
import toast from "react-hot-toast";
import { IUser } from "@/store/user.store";
import { createTask } from "@/lib/apis/task";

// Types for real data
interface ITaskItem {
  productId: string;
  quantity: number;
}

interface AssignTaskDialogProps {
  stuff: IUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AssignTaskDialog({
  stuff,
  open,
  onOpenChange,
}: AssignTaskDialogProps) {
  const [taskName, setTaskName] = useState("");
  const [deadline, setDeadline] = useState("");
  const [taskItems, setTaskItems] = useState<ITaskItem[]>([
    { productId: "", quantity: 1 },
  ]);
  const [notes, setNotes] = useState("");
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

  const addTaskItem = () => {
    setTaskItems([...taskItems, { productId: "", quantity: 1 }]);
    setSelectedProducts([...selectedProducts, null]);
  };

  const removeTaskItem = (index: number) => {
    if (taskItems.length <= 1) return;
    setTaskItems(taskItems.filter((_, i) => i !== index));
    setSelectedProducts(selectedProducts.filter((_, i) => i !== index));
  };

  const updateTaskItem = (
    index: number,
    field: keyof ITaskItem,
    value: string | number
  ) => {
    const updated = [...taskItems];
    updated[index] = { ...updated[index], [field]: value };
    setTaskItems(updated);
  };

  const handleProductSelect = (index: number, product: IProduct | null) => {
    // Update selected products array
    const updatedSelectedProducts = [...selectedProducts];
    updatedSelectedProducts[index] = product;
    setSelectedProducts(updatedSelectedProducts);

    // Update task item with product ID
    if (product) {
      updateTaskItem(index, "productId", product._id);
    } else {
      updateTaskItem(index, "productId", "");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!stuff) {
      setError("No staff member selected");
      return;
    }

    if (!taskName.trim()) {
      setError("Task name is required");
      return;
    }

    if (!deadline) {
      setError("Deadline is required");
      return;
    }

    if (taskItems.length === 0) {
      setError("Please add at least one task item");
      return;
    }

    // Check if all items have products selected
    const hasEmptyProducts = taskItems.some((item) => !item.productId);
    if (hasEmptyProducts) {
      setError("Please select products for all task items");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Prepare items for API call
      const items = taskItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));

      const taskData = {
        staffId: stuff._id,
        items,
        deadline,
        notes,
      };

      const { success, message, task } = await createTask(taskData);

      if (success) {
        toast.success("Task assigned successfully");
        resetForm();
        onOpenChange(false);
      } else {
        setError(message || "Failed to assign task");
        console.error("Error creating task:", message);
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Error creating task:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTaskName("");
    setDeadline("");
    setTaskItems([{ productId: "", quantity: 1 }]);
    setSelectedProducts([null]);
    setNotes("");
    setError(null);
  };

  const handleDialogChange = (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (!isOpen) {
      resetForm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading flex items-center gap-2 text-xl">
            <Package className="h-5 w-5" />
            Assign Task
          </DialogTitle>
          <DialogDescription>
            Assign a new task to {stuff?.fullname || "staff member"}
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
          {/* Task Name */}
          <div className="space-y-2">
            <Label htmlFor="taskName" className="text-sm font-medium">
              Task Name *
            </Label>
            <Input
              id="taskName"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="Enter task name"
              required
              className="py-5 border-2 border-input focus-visible:ring-2 focus-visible:ring-primary/30 rounded-lg"
            />
          </div>

          {/* Deadline */}
          <div className="space-y-2">
            <Label htmlFor="deadline" className="text-sm font-medium">
              Deadline *
            </Label>
            <Input
              id="deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              required
              className="py-5 border-2 border-input focus-visible:ring-2 focus-visible:ring-primary/30 rounded-lg"
            />
          </div>

          {/* Task Items */}
          <Card className="border-0 shadow-sm rounded-xl">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="font-heading text-lg">
                  Task Items
                </CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addTaskItem}
                  disabled={isLoadingProducts}
                  className="gap-2 rounded-full border-2 border-input px-4"
                >
                  <Plus className="h-4 w-4" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {taskItems.length > 0 && (
                <div className="space-y-4">
                  {taskItems.map((item, index) => {
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
                        <div className="w-full sm:w-32 space-y-2">
                          <Label className="text-sm font-medium">
                            Quantity *
                          </Label>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              updateTaskItem(
                                index,
                                "quantity",
                                parseInt(e.target.value) || 1
                              )
                            }
                            className="border-2 border-input focus:ring-2 focus:ring-primary/30 rounded-lg py-5"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeTaskItem(index)}
                          disabled={taskItems.length <= 1}
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

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">
              Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              placeholder="Add any special instructions or notes for this task..."
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
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="rounded-full px-6"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                !stuff ||
                !taskName.trim() ||
                !deadline ||
                taskItems.length === 0 ||
                isSubmitting ||
                isLoadingProducts ||
                taskItems.some((item) => !item.productId)
              }
              className="rounded-full px-6 bg-primary hover:bg-primary/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Assigning...
                </>
              ) : (
                "Assign Task"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
