// components/purchases/confirm-order-dialog.tsx
"use client";

import { useState } from "react";
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
import { Upload, X, Loader2, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import { IOrder } from "@/app/dashboard/purchases/page";
import { confirmOrder } from "@/lib/apis/purchase-list";


interface ConfirmOrderDialogProps {
  order: IOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOrderUpdated: (updatedOrder: IOrder) => void;
}

export function ConfirmOrderDialog({
  order,
  open,
  onOpenChange,
  onOrderUpdated,
}: ConfirmOrderDialogProps) {
  const [totalAmount, setTotalAmount] = useState<string>("");
  const [billFile, setBillFile] = useState<File | null>(null);
  const [billPreview, setBillPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Reset form when dialog opens
  useState(() => {
    if (open && order) {
      setTotalAmount(order.totalAmount?.toString() || "");
      setBillFile(null);
      setBillPreview(null);
    }
  });

  const handleBillUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.match("image.*") && !file.type.match("application/pdf")) {
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

const handleConfirm = async () => {
  if (!billFile) {
    toast.error("Please upload a bill");
    return;
  }

  if (!totalAmount || parseFloat(totalAmount) <= 0) {
    toast.error("Please enter a valid total amount");
    return;
  }

  if (!order) return;

  setIsLoading(true);
  try {
    const formData = new FormData();
    formData.append("image", billFile);
    formData.append("totalAmount", totalAmount);

    const { success, order: updatedOrder, message } = await confirmOrder(
      order._id,
      formData
    );

    if (success && updatedOrder) {
  toast.success("Order confirmed successfully");
  onOrderUpdated(updatedOrder);
  onOpenChange(false);
  resetForm();

  // ✅ Refresh the page after confirmation
  setTimeout(() => {
    window.location.reload();
  }, 800);
} else {
  toast.error(message || "Failed to confirm order");
}
  } catch (error) {
    console.error("Error confirming order:", error);
    toast.error("Failed to confirm order");
  } finally {
    setIsLoading(false);
  }
};


  const resetForm = () => {
    setTotalAmount("");
    setBillFile(null);
    setBillPreview(null);
  };

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="font-heading flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Confirm Order
          </DialogTitle>
          <DialogDescription>
            Upload bill and set the final price for order {order.orderNumber}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
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
              className="border-2 border-input focus:ring-2 focus:ring-primary/30 rounded-lg py-5"
            />
          </div>

          {/* Bill Upload */}
          <div className="space-y-2">
            <Label htmlFor="bill" className="text-sm font-medium">
              Bill (Bon) *
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

          {/* Order Summary */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h4 className="font-semibold text-sm mb-2">Order Summary</h4>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Supplier:</span>
              <span className="font-medium">{order.supplierId?.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Items:</span>
              <span className="font-medium">{order.items.length} items</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Assigned to:</span>
              <span className="font-medium">
                {order.staffId?.fullname || "Not assigned"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Current Total:</span>
              <span className="font-medium">
                {order.totalAmount.toFixed(2)} DA
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              resetForm();
            }}
            disabled={isLoading}
            className="rounded-full px-6"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading || !billFile || !totalAmount}
            className="rounded-full px-6"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Confirming...
              </>
            ) : (
              "Confirm Order"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}