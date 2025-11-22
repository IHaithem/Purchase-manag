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
  XCircle,
} from "lucide-react";
import { PurchaseOrderDialog } from "@/components/purchases/purchase-order-dialog";
import { ReceiptPreviewDialog } from "./receipt-preview-dialog";
import { AssignStaffDialog } from "./assign-staff-dialog";
import { Pagination } from "@/components/ui/pagination";
import { IOrder } from "@/app/dashboard/purchases/page";
import { resolveImage } from "@/lib/resolveImage";
import { useAuth } from "@/hooks/useAuth";
import { SubmitReviewDialog } from "./submit-review-dialog";
import { VerifyOrderDialog } from "./verify-order-dialog";
import { MarkPaidDialog } from "./mark-paid-dialog";
import { updateOrder } from "@/lib/apis/purchase-list";
import toast from "react-hot-toast";

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

  // Step dialogs
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false);
  const [isMarkPaidDialogOpen, setIsMarkPaidDialogOpen] = useState(false);
  const [isCancelLoading, setIsCancelLoading] = useState(false);

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

  const handleExportOrder = (orderId: string) => {
    console.log("Exporting order:", orderId);
  };

  const handleCancelOrder = async (order: IOrder) => {
    if (!["not assigned", "assigned", "pending_review"].includes(order.status)) {
      toast.error("You can only cancel before verification.");
      return;
    }
    setIsCancelLoading(true);
    try {
      const { success, order: updated, message } = await updateOrder(order._id, {
        status: "canceled",
        canceledDate: new Date().toISOString(),
      });
      if (success && updated) {
        toast.success("Order canceled");
        handleOrderUpdated(updated);
      } else {
        toast.error(message || "Failed to cancel order");
      }
    } catch (e) {
      toast.error("Error canceling order");
    } finally {
      setIsCancelLoading(false);
    }
  };

  const getStatusAction = (order: IOrder) => {
    switch (order.status) {
      case "not assigned":
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleAssignStaff(order)}
              className="gap-2"
            >
              <UserPlus className="h-3 w-3" />
              Assign
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={isCancelLoading}
              className="gap-2 border-red-600 text-red-600 hover:bg-red-50"
              onClick={() => handleCancelOrder(order)}
            >
              <XCircle className="h-3 w-3" />
              {isCancelLoading ? "Canceling..." : "Cancel"}
            </Button>
          </div>
        );
      case "assigned":
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              className="gap-2 bg-orange-600 text-white hover:bg-orange-700"
              onClick={() => {
                setSelectedOrder(order);
                setIsSubmitDialogOpen(true);
              }}
            >
              <CheckCircle className="h-3 w-3" />
              Submit Bill
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={isCancelLoading}
              className="gap-2 border-red-600 text-red-600 hover:bg-red-50"
              onClick={() => handleCancelOrder(order)}
            >
              <XCircle className="h-3 w-3" />
              {isCancelLoading ? "Canceling..." : "Cancel"}
            </Button>
          </div>
        );
      case "pending_review":
        return user?.role === "admin" ? (
          <div className="flex gap-2">
            <Button
              size="sm"
              className="gap-2 bg-orange-600 text-white hover:bg-orange-700"
              onClick={() => {
                setSelectedOrder(order);
                setIsVerifyDialogOpen(true);
              }}
            >
              <CheckCircle className="h-3 w-3" />
              Verify
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={isCancelLoading}
              className="gap-2 border-red-600 text-red-600 hover:bg-red-50"
              onClick={() => handleCancelOrder(order)}
            >
              <XCircle className="h-3 w-3" />
              {isCancelLoading ? "Canceling..." : "Cancel"}
            </Button>
          </div>
        ) : (
          <Badge variant="outline">Waiting Verification</Badge>
        );
      case "verified":
        return (
          <Button
            size="sm"
            className="gap-2 bg-orange-600 text-white hover:bg-orange-700"
            onClick={() => {
              setSelectedOrder(order);
              setIsMarkPaidDialogOpen(true);
            }}
          >
            <DollarSign className="h-3 w-3" />
            Mark Paid
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
                  <TableHead>Action</TableHead>
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

      {/* Dialogs */}
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
      <SubmitReviewDialog
        order={selectedOrder}
        open={isSubmitDialogOpen}
        onOpenChange={setIsSubmitDialogOpen}
        onOrderUpdated={handleOrderUpdated}
      />
      <VerifyOrderDialog
        order={selectedOrder}
        open={isVerifyDialogOpen}
        onOpenChange={setIsVerifyDialogOpen}
        onOrderUpdated={handleOrderUpdated}
      />
      <MarkPaidDialog
        order={selectedOrder}
        open={isMarkPaidDialogOpen}
        onOpenChange={setIsMarkPaidDialogOpen}
        onOrderUpdated={handleOrderUpdated}
      />
    </>
  );
}