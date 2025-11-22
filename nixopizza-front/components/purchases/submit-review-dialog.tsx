"use client";
import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Package, Receipt, DollarSign, Download } from "lucide-react";
import toast from "react-hot-toast";
import { IOrder } from "@/app/dashboard/purchases/page";
import { submitForReview } from "@/lib/apis/purchase-list";
import { resolveImage } from "@/lib/resolveImage";

interface EditableItem {
  itemId: string;
  name: string;
  barcode?: string;
  quantity: number;
  unitCost: number;
}

interface SubmitReviewDialogProps {
  order: IOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOrderUpdated: (updatedOrder: IOrder) => void;
}

export function SubmitReviewDialog({
  order,
  open,
  onOpenChange,
  onOrderUpdated,
}: SubmitReviewDialogProps) {
  const [billFile, setBillFile] = useState<File | null>(null);
  const [billPreview, setBillPreview] = useState<string | null>(null);

  // Editable items state (derived from order items)
  const [items, setItems] = useState<EditableItem[]>([]);
  const [overrideTotal, setOverrideTotal] = useState<string>("");

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && order) {
      // Initialize editable items
      setItems(
        order.items.map((it) => ({
          itemId: (it as any)._id || "", // ensure we capture ProductOrder _id
          name: it.productId?.name || "Product",
            barcode: it.productId?.barcode,
          quantity: it.quantity,
          unitCost: it.unitCost,
        }))
      );
      setOverrideTotal("");
      setBillFile(null);
      setBillPreview(null);
    }
  }, [open, order]);

  const computedTotal = useMemo(
    () =>
      items.reduce(
        (sum, it) => sum + (isFinite(it.unitCost) ? it.unitCost : 0) * it.quantity,
        0
      ),
    [items]
  );

  const handleBillUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.match("image.*") && !file.type.match("application/pdf")) {
      toast.error("Please select an image or PDF file");
      return;
    }
    setBillFile(file);
    setBillPreview(URL.createObjectURL(file));
  };

  const removeBill = () => {
    setBillFile(null);
    setBillPreview(null);
  };

  const updateItemField = (
    itemId: string,
    field: keyof EditableItem,
    value: number
  ) => {
    setItems((prev) =>
      prev.map((i) => (i.itemId === itemId ? { ...i, [field]: value } : i))
    );
  };

  const handleSubmit = async () => {
    if (!order) return;
    if (order.status !== "assigned") {
      toast.error("Order must be assigned first");
      return;
    }
    if (!billFile) {
      toast.error("Bill file required");
      return;
    }
    // Basic validation
    if (items.some((i) => i.quantity <= 0 || i.unitCost < 0)) {
      toast.error("Invalid item values (quantity >0, unitCost >=0)");
      return;
    }

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("image", billFile);
      // Provide updated items
      const itemsUpdates = items.map((i) => ({
        itemId: i.itemId,
        quantity: i.quantity,
        unitCost: i.unitCost,
      }));
      fd.append("itemsUpdates", JSON.stringify(itemsUpdates));

      // Optional override total
      if (overrideTotal.trim()) {
        fd.append("totalAmount", overrideTotal.trim());
      }

      const { success, order: updated, message } = await submitForReview(
        order._id,
        fd
      );
      if (success && updated) {
        toast.success("Submitted for review");
        onOrderUpdated(updated);
        onOpenChange(false);
      } else {
        toast.error(message || "Failed to submit");
      }
    } catch (e) {
      toast.error("Error submitting for review");
    } finally {
      setSaving(false);
    }
  };

  if (!order) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v && !saving) {
          // Reset when closing
          setBillFile(null);
          setBillPreview(null);
        }
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-[880px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Submit Bill & Adjust Items
          </DialogTitle>
          <DialogDescription>
            Provide the supplier bill and adjust final item quantities / unit
            prices before review. Order: {order.orderNumber}
          </DialogDescription>
        </DialogHeader>

        {/* Items Editor */}
        <div className="space-y-6 py-2">
          <div className="border rounded-lg p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-sm">Editable Items</h3>
              <span className="text-xs text-muted-foreground">
                You can modify quantity and unit price before verification.
              </span>
            </div>
            <div className="space-y-3">
              {items.map((it) => (
                <div
                  key={it.itemId}
                  className="grid grid-cols-1 md:grid-cols-5 gap-3 p-3 border rounded-lg"
                >
                  <div className="space-y-1">
                    <Label className="text-xs">Product</Label>
                    <div className="text-sm font-medium truncate">
                      {it.name}
                    </div>
                    {it.barcode && (
                      <div className="text-[10px] text-muted-foreground">
                        BARCODE: {it.barcode}
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Quantity</Label>
                    <Input
                      type="number"
                      min={1}
                      value={it.quantity}
                      onChange={(e) =>
                        updateItemField(
                          it.itemId,
                          "quantity",
                          Number(e.target.value) || 1
                        )
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Unit Price (DA)</Label>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      value={it.unitCost}
                      onChange={(e) =>
                        updateItemField(
                          it.itemId,
                          "unitCost",
                          parseFloat(e.target.value) || 0
                        )
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Line Total</Label>
                    <div className="text-sm font-medium">
                      {(it.quantity * it.unitCost).toFixed(2)} DA
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Original</Label>
                    <div className="text-xs text-muted-foreground">
                      Q:{order.items.find((o: any) => o._id === it.itemId)?.quantity} • U:
                      {order.items.find((o: any) => o._id === it.itemId)?.unitCost}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-3 border-t flex justify-between items-center">
              <div className="text-sm font-medium flex items-center gap-1">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                Computed Total:
              </div>
              <div className="text-lg font-semibold">
                {computedTotal.toFixed(2)} DA
              </div>
            </div>
          </div>

          {/* Override total (optional) */}
          <div className="space-y-2">
            <Label htmlFor="overrideTotal" className="text-sm font-medium">
              Override Total (Optional)
            </Label>
            <Input
              id="overrideTotal"
              type="number"
              min={0}
              step="0.01"
              value={overrideTotal}
              onChange={(e) => setOverrideTotal(e.target.value)}
              placeholder={`Computed: ${computedTotal.toFixed(2)} DA`}
            />
            <p className="text-xs text-muted-foreground">
              If the bill total differs due to rounding or external adjustments,
              enter it here. Otherwise leave blank.
            </p>
          </div>

          {/* Bill Upload */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Bill (Bon) *</Label>
            <div className="flex items-center gap-4">
              {billPreview ? (
                <div className="relative w-24 h-24 rounded-xl overflow-hidden border">
                  {billFile?.type === "application/pdf" ? (
                    <div className="w-full h-full flex items-center justify-center bg-red-50">
                      <span className="text-red-600 font-medium">PDF</span>
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
                    className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 hover:opacity-85"
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
                  htmlFor="bill-file"
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md cursor-pointer hover:opacity-90 transition-opacity text-sm"
                >
                  <Upload className="h-4 w-4" />
                  {billPreview ? "Change Bill" : "Upload Bill"}
                </Label>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG, PDF up to 5MB
                </p>
                <Input
                  id="bill-file"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleBillUpload}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Existing bill (if originally had one) */}
          {order.bon && (
            <div className="bg-muted/40 rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Receipt className="h-4 w-4" />
                Previous bill present
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(resolveImage(order.bon!), "_blank")}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                View
              </Button>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={
              saving ||
              !billFile ||
              items.length === 0 ||
              items.some((i) => i.quantity <= 0 || i.unitCost < 0)
            }
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            {saving ? "Submitting..." : "Submit for Review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}