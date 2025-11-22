// Updated: remove inline editing for quantities/unit cost from main dialog.
// Instead open SubmitReviewDialog (which now handles editing) when clicking "Submit Bill (Review)".

"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Calendar,
  DollarSign,
  Package,
  Download,
  Mail,
  Phone,
  CheckCircle,
  Receipt,
  XCircle,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { IOrder } from "@/app/dashboard/purchases/page";
import { verifyOrder, markOrderPaid, updateOrder } from "@/lib/apis/purchase-list";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import { resolveImage } from "@/lib/resolveImage";
import { SubmitReviewDialog } from "./submit-review-dialog";

interface PurchaseOrderDialogProps {
  order: IOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setPurchaseOrders: (updater: (prev: IOrder[]) => IOrder[]) => void;
}

export function PurchaseOrderDialog({
  order,
  open,
  onOpenChange,
  setPurchaseOrders,
}: PurchaseOrderDialogProps) {
  const { user } = useAuth();
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [paidLoading, setPaidLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);

  if (!order) return null;

  const applyUpdate = (updated: IOrder) => {
    setPurchaseOrders((prev) =>
      prev.map((o) => (o._id === updated._id ? updated : o))
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "not assigned":
        return "secondary";
      case "assigned":
        return "default";
      case "pending_review":
        return "outline";
      case "verified":
        return "default";
      case "paid":
        return "default";
      case "canceled":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const handleVerify = async () => {
    if (order.status !== "pending_review") {
      toast.error("Order must be pending_review");
      return;
    }
    setVerifyLoading(true);
    try {
      const { success, order: updated, message } = await verifyOrder(order._id);
      if (success && updated) {
        toast.success("Order verified");
        applyUpdate(updated);
        onOpenChange(false);
      } else {
        toast.error(message || "Failed to verify");
      }
    } catch {
      toast.error("Error verifying");
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleMarkPaid = async () => {
    if (order.status !== "verified") {
      toast.error("Order must be verified");
      return;
    }
    setPaidLoading(true);
    try {
      const { success, order: updated, message } = await markOrderPaid(order._id);
      if (success && updated) {
        toast.success("Order marked paid");
        applyUpdate(updated);
        onOpenChange(false);
      } else {
        toast.error(message || "Failed to mark paid");
      }
    } catch {
      toast.error("Error marking paid");
    } finally {
      setPaidLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!["not assigned", "assigned", "pending_review"].includes(order.status)) {
      toast.error("Cannot cancel after verification.");
      return;
    }
    setCancelLoading(true);
    try {
      const { success, order: updated, message } = await updateOrder(order._id, {
        status: "canceled",
        canceledDate: new Date().toISOString(),
      });
      if (success && updated) {
        toast.success("Order canceled");
        applyUpdate(updated);
        onOpenChange(false);
      } else {
        toast.error(message || "Failed to cancel");
      }
    } catch {
      toast.error("Error canceling order");
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => onOpenChange(v)}>
        <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading flex items-center gap-2">
              <Package className="h-5 w-5" />
              Purchase Order Details
            </DialogTitle>
            <DialogDescription>
              Order {order.orderNumber} - {order.supplierId?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">Order ID</div>
                  <div className="font-mono font-medium">
                    {order.orderNumber}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">Status</div>
                  <Badge variant={getStatusColor(order.status) as any}>
                    {order.status}
                  </Badge>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">Total Value</div>
                  <div className="font-medium flex items-center gap-1">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    {order.totalAmount.toFixed(2)} DA
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">Paid Date</div>
                  <div className="font-medium flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {order.paidDate
                      ? new Date(order.paidDate).toLocaleDateString("en-GB")
                      : "N/A"}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="font-heading flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Supplier Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {order.supplierId?.image && (
                        <img
                          src={resolveImage(order.supplierId.image)}
                          alt={order.supplierId?.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      )}
                      {order.supplierId?.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {order?.supplierId?.address}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-3 w-3" />
                      {order?.supplierId?.email}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-3 w-3" />
                      {order?.supplierId?.phone1 ||
                        order?.supplierId?.phone2 ||
                        order?.supplierId?.phone3}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Contact: {order.supplierId?.contactPerson || "N/A"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-heading">Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted rounded-lg">
                          <Package className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-medium">
                            {item.productId?.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            BARCODE: {item.productId?.barcode}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {item.quantity} × {item.unitCost} DA ={" "}
                          {(item.quantity * item.unitCost).toFixed(2)} DA
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center font-medium">
                    <span>Total Order Value:</span>
                    <span className="text-lg">
                      {order.totalAmount.toFixed(2)} DA
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-heading flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Bill (Bon)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {order.bon ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-muted rounded-lg">
                        {order.bon.toLowerCase().endsWith(".pdf") ? (
                          <span className="text-red-500 font-medium">PDF</span>
                        ) : (
                          <img
                            src={resolveImage(order.bon)}
                            alt="Bill preview"
                            className="w-16 h-16 object-cover rounded"
                          />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">Bill Uploaded</div>
                        <div className="text-sm text-muted-foreground">
                          Click to view or download
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() =>
                        window.open(resolveImage(order.bon!), "_blank")
                      }
                    >
                      <Download className="h-4 w-4" />
                      View Bill
                    </Button>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    No bill uploaded yet.
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex flex-wrap gap-2 justify-end">
              {["not assigned", "assigned", "pending_review"].includes(
                order.status
              ) && (
                <Button
                  variant="outline"
                  disabled={cancelLoading}
                  className="gap-2 border-red-600 text-red-600 hover:bg-red-50"
                  onClick={handleCancel}
                >
                  <XCircle className="h-4 w-4" />
                  {cancelLoading ? "Canceling..." : "Cancel"}
                </Button>
              )}

              {order.status === "assigned" && (
                <Button
                  className="gap-2 bg-orange-600 text-white hover:bg-orange-700"
                  onClick={() => setSubmitDialogOpen(true)}
                >
                  <CheckCircle className="h-4 w-4" />
                  Submit Bill (Review)
                </Button>
              )}

              {order.status === "pending_review" && user?.role === "admin" && (
                <Button
                  className="gap-2 bg-orange-600 text-white hover:bg-orange-700"
                  disabled={verifyLoading}
                  onClick={handleVerify}
                >
                  {verifyLoading ? (
                    <>
                      <ShieldCheck className="h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4" />
                      Verify Order
                    </>
                  )}
                </Button>
              )}

              {order.status === "verified" && user?.role === "admin" && (
                <Button
                  className="gap-2 bg-orange-600 text-white hover:bg-orange-700"
                  disabled={paidLoading}
                  onClick={handleMarkPaid}
                >
                  {paidLoading ? (
                    <>
                      <DollarSign className="h-4 w-4 animate-spin" />
                      Marking...
                    </>
                  ) : (
                    <>
                      <DollarSign className="h-4 w-4" />
                      Mark Paid
                    </>
                  )}
                </Button>
              )}

              {order.status === "paid" && (
                <Button variant="outline" disabled className="gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Order Paid
                </Button>
              )}

              {order.status === "canceled" && (
                <Button variant="outline" disabled className="gap-2">
                  <XCircle className="h-4 w-4" />
                  Order Canceled
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <SubmitReviewDialog
        order={order}
        open={submitDialogOpen}
        onOpenChange={setSubmitDialogOpen}
        onOrderUpdated={applyUpdate}
      />
    </>
  );
}