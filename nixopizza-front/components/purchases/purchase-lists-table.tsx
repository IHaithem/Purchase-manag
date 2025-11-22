"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Eye,
  Download,
  Receipt,
  Package,
  UserPlus,
  CheckCircle,
  DollarSign,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { PurchaseOrderDialog } from "@/components/purchases/purchase-order-dialog";
import { ReceiptPreviewDialog } from "./receipt-preview-dialog";
import { AssignStaffDialog } from "./assign-staff-dialog";
import { IOrder } from "@/app/dashboard/purchases/page";
import { resolveImage } from "@/lib/resolveImage";
import {
  submitForReview,
  verifyOrder,
  markOrderPaid,
  assignOrder,
} from "@/lib/apis/purchase-list";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import { Pagination } from "@/components/ui/pagination";
import { Input } from "../ui/input";
import { Label } from "@radix-ui/react-label";

export function PurchaseListsTable({
  purchaseOrders,
  setPurchaseOrders,
  totalPages,
  currentPage,
  setCurrentPage,
  limit,
  setLimit,
}: {
  purchaseOrders: IOrder[];
  setPurchaseOrders: any;
  totalPages: number;
  currentPage: number;
  setCurrentPage: any;
  limit: number;
  setLimit: any;
}) {
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [billFile, setBillFile] = useState<File | null>(null);
  const [billPreview, setBillPreview] = useState<string | null>(null);
  const [uploadingReview, setUploadingReview] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [markingPaid, setMarkingPaid] = useState(false);
  const [overrideAmount, setOverrideAmount] = useState("");
  const { user } = useAuth();

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

  const handleViewOrder = (order: IOrder) => {
    setSelectedOrder(order);
    setIsOrderDialogOpen(true);
  };

  const handleViewReceipt = (order: IOrder) => {
    setSelectedOrder(order);
    setIsReceiptDialogOpen(true);
  };

  const handleAssignStaff = (order: IOrder) => {
    setSelectedOrder(order);
    setIsAssignDialogOpen(true);
  };

  const handleOrderUpdated = (updatedOrder: IOrder) => {
    setPurchaseOrders((prevOrders: IOrder[]) =>
      prevOrders.map((ord) => (ord._id === updatedOrder._id ? updatedOrder : ord))
    );
  };

  const handleBillUpload = (e: React.ChangeEvent<HTMLInputElement>, order: IOrder) => {
    if (order.status !== "assigned") {
      toast.error("You can only upload a bill for an assigned order");
      return;
    }
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.match("image.*") && !file.type.match("application/pdf")) {
      toast.error("Select image or PDF");
      return;
    }
    setSelectedOrder(order);
    setBillFile(file);
    setBillPreview(URL.createObjectURL(file));
  };

  // Submit for review inline (without opening the big dialog)
  const handleSubmitReview = async (order: IOrder) => {
    if (order.status !== "assigned") {
      toast.error("Order must be assigned");
      return;
    }
    if (!billFile || selectedOrder?._id !== order._id) {
      toast.error("Upload bill first (below the order row)");
      return;
    }
    setUploadingReview(true);
    try {
      const fd = new FormData();
      fd.append("image", billFile);
      if (overrideAmount) fd.append("totalAmount", overrideAmount);
      const { success, order: updated, message } = await submitForReview(
        order._id,
        fd
      );
      if (success && updated) {
        toast.success("Submitted for review");
        handleOrderUpdated(updated);
        setBillFile(null);
        setBillPreview(null);
        setOverrideAmount("");
      } else {
        toast.error(message || "Failed to submit for review");
      }
    } catch (e) {
      toast.error("Error submitting for review");
    } finally {
      setUploadingReview(false);
    }
  };

  const handleVerify = async (order: IOrder) => {
    if (order.status !== "pending_review") {
      toast.error("Order must be pending_review");
      return;
    }
    if (user?.role !== "admin") {
      toast.error("Only admin can verify");
      return;
    }
    setVerifying(true);
    try {
      const { success, order: updated, message } = await verifyOrder(order._id);
      if (success && updated) {
        toast.success("Verified");
        handleOrderUpdated(updated);
      } else {
        toast.error(message || "Failed to verify");
      }
    } catch {
      toast.error("Error verifying");
    } finally {
      setVerifying(false);
    }
  };

  const handleMarkPaid = async (order: IOrder) => {
    if (order.status !== "verified") {
      toast.error("Order must be verified first");
      return;
    }
    setMarkingPaid(true);
    try {
      const { success, order: updated, message } = await markOrderPaid(order._id);
      if (success && updated) {
        toast.success("Marked paid");
        handleOrderUpdated(updated);
      } else {
        toast.error(message || "Failed to mark paid");
      }
    } catch {
      toast.error("Error marking paid");
    } finally {
      setMarkingPaid(false);
    }
  };

  const handleExportOrder = (orderId: string) => {
    console.log("Exporting order:", orderId);
    // TODO: implement PDF export
  };

  const getStatusAction = (order: IOrder) => {
    switch (order.status) {
      case "not assigned":
        return (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleAssignStaff(order)}
            className="gap-2"
          >
            <UserPlus className="h-3 w-3" />
            Assign
          </Button>
        );
      case "assigned":
        return (
          <div className="flex flex-col gap-1">
            <div className="flex gap-2">
              <Input
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => handleBillUpload(e, order)}
              />
            </div>
            {billPreview && selectedOrder?._id === order._id && (
              <div className="flex items-center gap-2">
                {billFile?.type === "application/pdf" ? (
                  <span className="text-xs font-medium px-2 py-1 bg-red-50 rounded">
                    PDF Ready
                  </span>
                ) : (
                  <img
                    src={billPreview}
                    alt="Preview"
                    className="w-10 h-10 rounded object-cover border"
                  />
                )}
                <Button
                  size="sm"
                  variant="outline"
                  disabled={uploadingReview}
                  onClick={() => handleSubmitReview(order)}
                  className="gap-2"
                >
                  {uploadingReview ? (
                    <>
                      <CheckCircle className="h-3 w-3 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-3 w-3" />
                      Submit Bill
                    </>
                  )}
                </Button>
              </div>
            )}
            {selectedOrder?._id === order._id && billPreview && (
              <div className="flex flex-col gap-1">
                <Label className="text-xs">Override Total (optional)</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={overrideAmount}
                  onChange={(e) => setOverrideAmount(e.target.value)}
                  placeholder={order.totalAmount.toFixed(2)}
                />
              </div>
            )}
          </div>
        );
      case "pending_review":
        return user?.role === "admin" ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleVerify(order)}
            disabled={verifying}
            className="gap-2"
          >
            {verifying ? (
              <>
                <ShieldCheck className="h-3 w-3 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <ShieldCheck className="h-3 w-3" />
                Verify
              </>
            )}
          </Button>
        ) : (
          <Badge variant="outline">Waiting Verification</Badge>
        );
      case "verified":
        return (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleMarkPaid(order)}
            disabled={markingPaid}
            className="gap-2"
          >
            {markingPaid ? (
              <>
                <DollarSign className="h-3 w-3 animate-spin" />
                Marking...
              </>
            ) : (
              <>
                <DollarSign className="h-3 w-3" />
                Mark Paid
              </>
            )}
          </Button>
        );
      case "paid":
        return (
          <Badge variant="outline" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            Paid
          </Badge>
        );
      case "canceled":
        return (
          <Badge variant="destructive" className="gap-1">
            Canceled
          </Badge>
        );
      default:
        return null;
    }
  };

  if (purchaseOrders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Purchase Orders</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 p-3 bg-muted rounded-full">
            <Package className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-1">
            No purchase orders found
          </h3>
          <p className="text-muted-foreground mb-4">
            You don't have any purchase orders with this filtration.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Purchase Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Staff</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchaseOrders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {order?.bon ? (
                          <img
                            src={resolveImage(order.bon)}
                            alt={order?.orderNumber}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="p-2 bg-muted rounded-lg">
                            <Receipt className="h-4 w-4" />
                          </div>
                        )}
                        <span className="font-mono font-medium">
                          {order.orderNumber}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="font-medium flex items-center gap-2">
                          {order.supplierId?.image && (
                            <img
                              src={resolveImage(order.supplierId.image)}
                              alt={order.supplierId?.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          )}
                          {order.supplierId?.name}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {order.staffId ? (
                        <div className="flex items-center gap-2">
                          {order.staffId?.avatar && (
                            <img
                              src={resolveImage(order.staffId.avatar)}
                              alt={order.staffId?.fullname}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          )}
                          <span className="text-sm">
                            {order.staffId?.fullname}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          Not assigned
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{order.items.length}</span>
                      <span className="text-muted-foreground text-sm ml-1">
                        items
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {order.totalAmount.toFixed(2)} DA
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(order.status) as any}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusAction(order)}</TableCell>
                    <TableCell>
                      {order.bon && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewReceipt(order)}
                          title="Preview Receipt"
                        >
                          <Receipt className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleViewOrder(order)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleExportOrder(order._id)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Export PDF
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              Showing {purchaseOrders.length} of {totalPages * limit} orders
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              limit={limit}
              onLimitChange={setLimit}
            />
          </div>
        </CardContent>
      </Card>

      <PurchaseOrderDialog
        order={selectedOrder}
        open={isOrderDialogOpen}
        onOpenChange={setIsOrderDialogOpen}
        setPurchaseOrders={setPurchaseOrders}
      />
      <ReceiptPreviewDialog
        order={selectedOrder}
        open={isReceiptDialogOpen}
        onOpenChange={setIsReceiptDialogOpen}
      />
      <AssignStaffDialog
        order={selectedOrder}
        open={isAssignDialogOpen}
        onOpenChange={setIsAssignDialogOpen}
        onOrderUpdated={handleOrderUpdated}
      />
    </>
  );
}