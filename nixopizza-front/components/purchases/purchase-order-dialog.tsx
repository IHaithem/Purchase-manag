// components/purchase/purchase-order-dialog.tsx
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
  Send,
  Mail,
  Phone,
  CheckCircle,
  Upload,
} from "lucide-react";
import { useState } from "react";
import { Label } from "@radix-ui/react-label";
import { Input } from "../ui/input";
import { IOrder } from "@/app/dashboard/purchases/page";
import { updateOrder } from "@/lib/apis/purchase-list";
import toast from "react-hot-toast";

interface PurchaseOrderDialogProps {
  order: IOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setPurchaseOrders: any;
}

export function PurchaseOrderDialog({
  order,
  open,
  onOpenChange,
  setPurchaseOrders,
}: PurchaseOrderDialogProps) {
  if (!order) return null;
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [billFile, setBillFile] = useState<File | null>(null);
  const [billPreview, setBillPreview] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Draft":
        return "secondary";
      case "Sent":
        return "default";
      case "Confirmed":
        return "default";
      case "Paid":
        return "default";
      default:
        return "secondary";
    }
  };

  const handleBillUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.match("image.*") && !file.type.match("application/pdf")) {
        alert("Please select an image or PDF file");
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

  const hasBill = !!order.bon;

  const handleConfirmOrder = async () => {
    const formData = new FormData();
    formData.append("status", "confirmed");
    if (billFile) {
      formData.append("image", billFile);
    }
    const {
      success,
      order: updatedOrder,
      message,
    } = await updateOrder(order?._id, formData);
    if (success) {
      toast.success("Order confirmed successfully");
      // Update the order in the parent component's state
      if (setPurchaseOrders && updatedOrder) {
        setPurchaseOrders((prevOrders: IOrder[]) =>
          prevOrders.map((ord) =>
            ord._id === updatedOrder._id ? updatedOrder : ord
          )
        );
      }
      onOpenChange(false);
    } else {
      toast.error(message || "Failed to confirm order");
    }
  };

  const handleConfirmPaid = async () => {
    console.log("Confirming order as paid");
    const {
      success,
      order: updatedOrder,
      message,
    } = await updateOrder(order?._id, { status: "paid" });
    if (success) {
      toast.success("Order paid successfully");

      if (setPurchaseOrders && updatedOrder) {
        setPurchaseOrders((prevOrders: IOrder[]) =>
          prevOrders.map((ord) =>
            ord._id === updatedOrder._id ? updatedOrder : ord
          )
        );
      }
      onOpenChange(false);
    } else {
      toast.error(message || "Failed to pay order");
    }
    console.log("end Confirming order as paid");
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
        {currentStep === 0 ? (
          <div className="space-y-6">
            {/* Order Summary */}
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
                  <div className="text-sm text-muted-foreground">
                    Total Value
                  </div>
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
                      ? new Date(order?.paidDate).toLocaleDateString("en-GB")
                      : "N/A"}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Supplier Information */}
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
                    <div className="font-medium flex items-center gap-1">
                      <img
                        src={
                          process.env.NEXT_PUBLIC_BASE_URL +
                          order.supplierId?.image
                        }
                        alt={order.supplierId?.name}
                        className="w-12 h-12 rounded-full"
                      />
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
                      {order?.supplierId?.phone}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Contact: {order.supplierId?.contactPerson || "N/A"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle className="font-heading">Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div
                      key={index}
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
                          {item.quantity} × {item.unitCost} DA =
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

            {/* Bill Section */}
            <Card>
              <CardHeader>
                <CardTitle className="font-heading flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Bill (Bon)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {hasBill ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-muted rounded-lg">
                        {order.bon?.endsWith(".pdf") ? (
                          <span className="text-red-500 font-medium">PDF</span>
                        ) : (
                          <img
                            src={process.env.NEXT_PUBLIC_BASE_URL + order.bon}
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
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="gap-2"
                        onClick={() => {
                          window.open(
                            process.env.NEXT_PUBLIC_BASE_URL + order.bon,
                            "_blank"
                          );
                        }}
                      >
                        <Download className="h-4 w-4" />
                        View Bill
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      {billPreview ? (
                        <div className="relative">
                          {billFile?.type === "application/pdf" ? (
                            <div className="p-2 bg-muted rounded-lg">
                              <span className="text-red-500 font-medium">
                                PDF
                              </span>
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
                            <span className="sr-only">Remove</span>
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
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-2 justify-end">
              {order.status === "pending" && (
                <>
                  {!hasBill ? (
                    billFile ? (
                      <Button
                        className="gap-2 bg-green-600 text-white hover:bg-green-700"
                        onClick={handleConfirmOrder}
                      >
                        <CheckCircle className="h-4 w-4" />
                        Confirm Order
                      </Button>
                    ) : (
                      <Button variant="outline" disabled>
                        <CheckCircle className="h-4 w-4" />
                        Upload Bill First
                      </Button>
                    )
                  ) : (
                    <Button
                      className="gap-2 bg-green-600 text-white hover:bg-green-700"
                      onClick={handleConfirmOrder}
                    >
                      <CheckCircle className="h-4 w-4" />
                      Confirm Order
                    </Button>
                  )}
                </>
              )}

              {order.status === "confirmed" && (
                <Button
                  className="gap-2 bg-green-600 text-white hover:bg-green-700"
                  onClick={handleConfirmPaid}
                >
                  <CheckCircle className="h-4 w-4" />
                  Confirm Paid
                </Button>
              )}

              {order.status === "paid" && (
                <Button variant="outline" disabled>
                  <CheckCircle className="h-4 w-4" />
                  Order Paid
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div>
            {/* Actions */}
            <div className="space-y-2">
              <Label>Order bill</Label>
              <Input type="file" />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                onClick={() => {
                  setCurrentStep(0);
                }}
              >
                Cancel
              </Button>
              <Button
                className="gap-2 bg-green-600 text-white hover:bg-green-700"
                onClick={() => {
                  setCurrentStep(1);
                }}
              >
                <CheckCircle className="h-4 w-4" />
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
