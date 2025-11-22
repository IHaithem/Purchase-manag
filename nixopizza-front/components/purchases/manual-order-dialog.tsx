"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Package, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { createOrder } from "@/lib/apis/purchase-list";
import { IOrder } from "@/app/dashboard/purchases/page";

interface ManualOrderDialogProps {
  addNewOrder: (order: IOrder) => void;
}

type OrderItemDraft = {
  productId: string;
  name: string;
  quantity: number;
  unitCost: number;
  expirationDate?: Date | null;
};

export function ManualOrderDialog({ addNewOrder }: ManualOrderDialogProps) {
  const [open, setOpen] = useState(false);
  const [supplierId, setSupplierId] = useState("");
  const [notes, setNotes] = useState("");
  const [expectedDate, setExpectedDate] = useState<Date | null>(null);
  const [items, setItems] = useState<OrderItemDraft[]>([]);
  const [loading, setLoading] = useState(false);

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { productId: "", name: "", quantity: 1, unitCost: 0 },
    ]);
  };

  const updateItem = (
    index: number,
    field: keyof OrderItemDraft,
    value: any
  ) => {
    setItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, [field]: value } : it))
    );
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const reset = () => {
    setSupplierId("");
    setNotes("");
    setExpectedDate(null);
    setItems([]);
    setLoading(false);
  };

  const canSubmit =
    supplierId &&
    items.length > 0 &&
    items.every(
      (it) =>
        it.productId.trim() &&
        it.quantity > 0 &&
        it.unitCost >= 0
    );

  const handleCreate = async () => {
    if (!canSubmit) {
      toast.error("Please fill supplier and all item fields.");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("supplierId", supplierId);
      formData.append("notes", notes);
      if (expectedDate) {
        formData.append("expectedDate", expectedDate.toISOString());
      }

      const payloadItems = items.map((it) => ({
        productId: it.productId,
        quantity: it.quantity,
        unitCost: it.unitCost,
        expirationDate: it.expirationDate
          ? it.expirationDate.toISOString()
          : undefined,
      }));
      formData.append("items", JSON.stringify(payloadItems));

      const { success, order, message } = await createOrder(formData);
      if (success && order) {
        toast.success("Order created");
        addNewOrder(order);
        setOpen(false);
        reset();
      } else {
        toast.error(message || "Failed to create order");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error creating order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        className="gap-2 bg-orange-600 text-white hover:bg-orange-700"
        onClick={() => setOpen(true)}
      >
        <Plus className="h-4 w-4" />
        Manual Order
      </Button>
      <Dialog
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) reset();
        }}
      >
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading flex items-center gap-2">
              <Package className="h-5 w-5" />
              Create Manual Purchase Order
            </DialogTitle>
            <DialogDescription>
              Add supplier and line items, then create an order in status
              "not assigned".
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Supplier ID *</Label>
              <Input
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                placeholder="Enter supplier ObjectId"
              />
            </div>

            <div className="space-y-2">
              <Label>Expected Date (optional)</Label>
              <Input
                type="date"
                value={
                  expectedDate
                    ? expectedDate.toISOString().split("T")[0]
                    : ""
                }
                onChange={(e) =>
                  setExpectedDate(
                    e.target.value ? new Date(e.target.value) : null
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>Items *</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="gap-2"
                  onClick={addItem}
                >
                  <Plus className="h-4 w-4" /> Add Item
                </Button>
              </div>
              {items.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No items added yet.
                </p>
              )}
              <div className="space-y-4">
                {items.map((it, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-1 md:grid-cols-5 gap-3 p-3 border rounded-lg relative"
                  >
                    <div className="space-y-1">
                      <Label className="text-xs">Product ID *</Label>
                      <Input
                        value={it.productId}
                        onChange={(e) =>
                          updateItem(idx, "productId", e.target.value)
                        }
                        placeholder="Mongo ObjectId"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Name (optional)</Label>
                      <Input
                        value={it.name}
                        onChange={(e) => updateItem(idx, "name", e.target.value)}
                        placeholder="Display name"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Quantity *</Label>
                      <Input
                        type="number"
                        min={1}
                        value={it.quantity}
                        onChange={(e) =>
                          updateItem(idx, "quantity", Number(e.target.value))
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Unit Cost *</Label>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        value={it.unitCost}
                        onChange={(e) =>
                          updateItem(idx, "unitCost", Number(e.target.value))
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Expiration (opt.)</Label>
                      <Input
                        type="date"
                        value={
                          it.expirationDate
                            ? it.expirationDate.toISOString().split("T")[0]
                            : ""
                        }
                        onChange={(e) =>
                          updateItem(
                            idx,
                            "expirationDate",
                            e.target.value ? new Date(e.target.value) : null
                          )
                        }
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:opacity-85"
                      aria-label="Remove item"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-orange-600 hover:bg-orange-700 text-white"
              disabled={!canSubmit || loading}
              onClick={handleCreate}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                "Create Order"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}