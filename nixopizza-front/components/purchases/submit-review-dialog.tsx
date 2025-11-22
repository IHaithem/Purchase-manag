// components/purchases/submit-review-dialog.tsx
"use client";

import { useState, useEffect } from "react";
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
  const [totalAmount, setTotalAmount] = useState<string>("");
  const [billFile, setBillFile] = useState<File | null>(null);
  const [billPreview, setBillPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Reset form when opening for a new order
  useEffect(() => {
    if (open && order) {
      setTotalAmount(order.totalAmount?.toString() || "");
      setBillFile(null);
      setBillPreview(null);
    }
  }, [open, order]);

  if (!order) return null;

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

  const handleSubmit = async () => {
    if (order.status !== "assigned") {
      toast.error("Order must be assigned first");
      return;
    }
    if (!billFile) {
      toast.error("Please upload a bill");
      return;
    }
    if (!totalAmount || parseFloat(totalAmount) <= 0) {
      toast.error("Please enter a valid total amount");
      return;
    }
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", billFile);
      formData.append("totalAmount", totalAmount);

      const { success, order: updatedOrder, message } = await submitForReview(
        order._id,
        formData
      );
      if (success && updatedOrder) {
        toast.success("Submitted for review");
        onOrderUpdated(updatedOrder);
        onOpenChange(false);
      } else {
        toast.error(message || "Failed to submit");
      }
    } catch (e) {
      toast.error("Error submitting for review");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle className="font-heading flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Submit Bill for Review
          </DialogTitle>
          <DialogDescription>
            Upload the bill and set the final price for order {order.orderNumber}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="border rounded-lg p-3">
              <div className="text-xs text-muted-foreground">Order</div>
              <div className="font-mono text-sm">{order.orderNumber}</div>
            </div>
            <div className="border rounded-lg p-3">
              <div className="text-xs text-muted-foreground">Supplier</div>
              <div className="text-sm">{order.supplierId?.name}</div>
            </div>
            <div className="border rounded-lg p-3">
              <div className="text-xs text-muted-foreground">Items</div>
              <div className="text-sm">{order.items.length}</div>
            </div>
          </div>

          {/* Total Amount */}
          <div className="space-y-2">
            <Label htmlFor="totalAmount" className="text-sm font-medium">
              Total Amount (DA) *
            </Label>
            <Input
              id="totalAmount"
              type="number"
              step="0.01"
              min="0"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              placeholder="Enter total amount"
              className="border-2 border-input rounded-lg py-5"
            />
          </div>

          {/* Bill Upload */}
          <div className="space-y-2">
            <Label htmlFor="bill" className="text-sm font-medium">
              Bill (Bon) *
            </Label>
            <div className="flex items-center gap-4">
              {billPreview ? (
                <div className="relative w-24 h-24 rounded-xl overflow-hidden border">
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
                    className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 hover:opacity-80"
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

          {/* Current Bill (if any) */}
          {order.bon && (
            <div className="bg-muted/40 rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Package className="h-4 w-4" />
                Existing bill available
              </div>
              <Button
                variant="outline"
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
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || !billFile || !totalAmount}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            {isLoading ? "Submitting..." : "Submit for Review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}