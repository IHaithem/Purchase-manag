// components/purchases/verify-order-dialog.tsx
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
import { IOrder } from "@/app/dashboard/purchases/page";
import { verifyOrder } from "@/lib/apis/purchase-list";
import { useAuth } from "@/hooks/useAuth";
import { resolveImage } from "@/lib/resolveImage";
import { ShieldCheck, Package, Receipt, DollarSign, User, Building2 } from "lucide-react";

interface VerifyOrderDialogProps {
  order: IOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOrderUpdated: (updatedOrder: IOrder) => void;
}

export function VerifyOrderDialog({
  order,
  open,
  onOpenChange,
  onOrderUpdated,
}: VerifyOrderDialogProps) {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  if (!order) return null;

  const handleVerify = async () => {
    if (user?.role !== "admin") {
      return;
    }
    if (order.status !== "pending_review") {
      return;
    }
    setLoading(true);
    try {
      const { success, order: updated, message } = await verifyOrder(order._id);
      if (success && updated) {
        onOrderUpdated(updated);
        onOpenChange(false);
      } else {
        console.error(message || "Failed to verify");
      }
    } finally {
      setLoading(false);
    }
  };

  const canVerify = user?.role === "admin" && order.status === "pending_review" && !!order.bon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[820px]">
        <DialogHeader>
          <DialogTitle className="font-heading flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Verify Order
          </DialogTitle>
          <DialogDescription>
            Review order details and receipt before verification
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="border rounded-lg p-3">
              <div className="text-xs text-muted-foreground">Order</div>
              <div className="font-mono text-sm">{order.orderNumber}</div>
            </div>
            <div className="border rounded-lg p-3 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-xs text-muted-foreground">Supplier</div>
                <div className="text-sm">{order.supplierId?.name}</div>
              </div>
            </div>
            <div className="border rounded-lg p-3 flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-xs text-muted-foreground">Assigned To</div>
                <div className="text-sm">
                  {order.staffId?.fullname || "Not assigned"}
                </div>
              </div>
            </div>
            <div className="border rounded-lg p-3 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-xs text-muted-foreground">Total</div>
                <div className="text-sm">
                  {order.totalAmount.toFixed(2)} DA
                </div>
              </div>
            </div>
          </div>

          {/* Items brief */}
          <div className="border rounded-lg p-3">
            <div className="text-xs text-muted-foreground mb-2">Items</div>
            <div className="max-h-48 overflow-auto space-y-2 pr-1">
              {order.items.map((it, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span>{it.productId?.name}</span>
                  </div>
                  <div>
                    {it.quantity} × {it.unitCost} DA ={" "}
                    {(it.quantity * it.unitCost).toFixed(2)} DA
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Receipt */}
          <div className="border rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Receipt className="h-4 w-4" />
                Receipt
              </div>
              {order.bon && (
                <Button
                  variant="outline"
                  onClick={() => window.open(resolveImage(order.bon!), "_blank")}
                >
                  View
                </Button>
              )}
            </div>
            {!order.bon ? (
              <div className="text-sm text-muted-foreground mt-2">
                No receipt uploaded yet.
              </div>
            ) : order.bon.toLowerCase().endsWith(".pdf") ? (
              <div className="mt-3 text-sm">
                PDF uploaded – click View to open.
              </div>
            ) : (
              <img
                className="mt-3 max-h-64 rounded border object-contain"
                src={resolveImage(order.bon)}
                alt="Receipt"
              />
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleVerify}
            disabled={!canVerify || loading}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            {loading ? "Verifying..." : "Verify Order"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}