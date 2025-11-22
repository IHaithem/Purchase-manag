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
  Upload,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { Label } from "@radix-ui/react-label";
import { Input } from "../ui/input";
import { IOrder } from "@/app/dashboard/purchases/page";
import {
  submitForReview,
  verifyOrder,
  markOrderPaid,
} from "@/lib/apis/purchase-list";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import { resolveImage } from "@/lib/resolveImage";

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
  if (!order) return null;
  const { user } = useAuth();

  // Local bill file if uploading under assigned state
  const [billFile, setBillFile] = useState<File | null>(null);
  const [billPreview, setBillPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [markingPaid, setMarkingPaid] = useState(false);
  const [totalAmountOverride, setTotalAmountOverride] = useState<string>("");

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

  const applyOrderUpdateLocal = (updatedOrder: IOrder) => {
    setPurchaseOrders((prev) =>
      prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o))
    );
  };

  // Submit for review (assigned -> pending_review)
  const handleSubmitForReview = async () => {
    if (order.status !== "assigned") {
      toast.error("Order must be assigned first");
      return;
    }
    if (!billFile) {
      toast.error("Upload bill before submitting for review");
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("image", billFile);
      if (totalAmountOverride) {
        fd.append("totalAmount", totalAmountOverride);
      }
      const { success, order: updated, message } = await submitForReview(
        order._id,
        fd
      );
      if (success && updated) {
        toast.success("Submitted for review");
        applyOrderUpdateLocal(updated);
        onOpenChange(false);
      } else {
        toast.error(message || "Failed to submit for review");
      }
    } catch (e) {
      toast.error("Error submitting for review");
    } finally {
      setSubmitting(false);
    }
  };

  // Verify (pending_review -> verified) admin only
  const handleVerifyOrder = async () => {
    if (order.status !== "pending_review") {
      toast.error("Order must be pending review to verify");
      return;
    }
    setVerifying(true);
    try {
      const { success, order: updated, message } = await verifyOrder(order._id);
      if (success && updated) {
        toast.success("Order verified");
        applyOrderUpdateLocal(updated);
        onOpenChange(false);
      } else {
        toast.error(message || "Failed to verify order");
      }
    } catch (e) {
      toast.error("Error verifying order");
    } finally {
      setVerifying(false);
    }
  };

  // Mark paid (verified -> paid)
  const handleMarkPaid = async () => {
    if (order.status !== "verified") {
      toast.error("Order must be verified before marking paid");
      return;
    }
    setMarkingPaid(true);
    try {
      const { success, order: updated, message } = await markOrderPaid(
        order._id
      );
      if (success && updated) {
        toast.success("Order marked paid");
        applyOrderUpdateLocal(updated);
        onOpenChange(false);
      } else {
        toast.error(message || "Failed to mark paid");
      }
    } catch (e) {
      toast.error("Error marking paid");
    } finally {
      setMarkingPaid(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
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
          {/* Summary */}
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

          {/* Supplier */}
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

          {/* Items */}
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

          {/* Bill / Upload / Amount Override */}
          <Card>
            <CardHeader>
              <CardTitle className="font-heading flex items-center gap-2">
                <Upload className="h-5 w-5" />
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
                    onClick={() => window.open(resolveImage(order.bon), "_blank")}
                  >
                    <Download className="h-4 w-4" />
                    View Bill
                  </Button>
                </div>
              ) : order.status === "assigned" ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    {billPreview ? (
                      <div className="relative">
                        {billFile?.type === "application/pdf" ? (
                          <div className="p-2 bg-muted rounded-lg">
                            <span className="text-red-500 font-medium">PDF</span>
                          </div>
                        ) : (
                          <img
                            src={billPreview}
                            alt="Bill preview"
                            className="w-16 h-16 object-cover rounded"
                          />
                        )}
                        <button
                          type="button"
                          onClick={removeBill}
                          className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:opacity-80"
                        >
                          <span className="h-3 w-3">✕</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg">
                        <Upload className="h-8 w-8 text-gray-400" />
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

                  <div className="space-y-2 pt-2">
                    <Label htmlFor="override-amount" className="text-xs">
                      Override Total Amount (optional)
                    </Label>
                    <Input
                      id="override-amount"
                      type="number"
                      min={0}
                      step="0.01"
                      value={totalAmountOverride}
                      onChange={(e) => setTotalAmountOverride(e.target.value)}
                      placeholder={order.totalAmount.toFixed(2)}
                    />
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No bill available for this state.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 justify-end">
            {order.status === "assigned" && (
              <Button
                className="gap-2 bg-blue-600 text-white hover:bg-blue-700"
                disabled={!billFile || submitting}
                onClick={handleSubmitForReview}
              >
                {submitting ? (
                  <>
                    <CheckCircle className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Submit for Review
                  </>
                )}
              </Button>
            )}

            {order.status === "pending_review" && user?.role === "admin" && (
              <Button
                className="gap-2 bg-green-600 text-white hover:bg-green-700"
                disabled={verifying}
                onClick={handleVerifyOrder}
              >
                {verifying ? (
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
                className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
                disabled={markingPaid}
                onClick={handleMarkPaid}
              >
                {markingPaid ? (
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}