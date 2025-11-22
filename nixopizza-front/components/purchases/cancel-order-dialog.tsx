"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle } from "lucide-react";
import { IOrder } from "@/app/dashboard/purchases/page";
import { updateOrder } from "@/lib/apis/purchase-list";
import toast from "react-hot-toast";

interface CancelOrderDialogProps {
  order: IOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOrderUpdated: (updatedOrder: IOrder) => void;
}

export function CancelOrderDialog({
  order,
  open,
  onOpenChange,
  onOrderUpdated,
}: CancelOrderDialogProps) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setReason("");
      setLoading(false);
    }
  }, [open]);

  if (!order) return null;

  const canCancel =
    ["not assigned", "assigned", "pending_review"].includes(order.status);

  const handleCancel = async () => {
    if (!canCancel) {
      toast.error("You cannot cancel this order at its current stage.");
      return;
    }
    setLoading(true);
    try {
      const { success, order: updated, message } = await updateOrder(order._id, {
        status: "canceled",
        notes: reason ? `[CANCELED REASON] ${reason}` : order.notes,
        canceledDate: new Date().toISOString(),
      });
      if (success && updated) {
        toast.success("Order canceled");
        onOrderUpdated(updated);
        onOpenChange(false);
      } else {
        toast.error(message || "Failed to cancel order");
      }
    } catch (e) {
      toast.error("Error canceling order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Cancel Order
          </DialogTitle>
          <DialogDescription>
            You are about to cancel order {order.orderNumber}. This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="text-sm">
            Current Status: <span className="font-medium">{order.status}</span>
          </div>
          {!canCancel && (
            <div className="text-sm text-red-600">
              This order can no longer be canceled (already verified or paid).
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Cancellation Reason (optional)
            </label>
            <Textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide a brief reason (optional)"
              className="border-2 border-input focus:ring-2 focus:ring-primary/30 rounded-lg"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Close
          </Button>
          <Button
            className="bg-red-600 hover:bg-red-700 text-white"
            disabled={!canCancel || loading}
            onClick={handleCancel}
          >
            {loading ? "Canceling..." : "Cancel Order"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}