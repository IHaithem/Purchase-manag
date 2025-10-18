// components/purchases/purchase-lists-table.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

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
import { MoreHorizontal, Eye, Download, Receipt, Package, UserPlus, CheckCircle, DollarSign } from "lucide-react";
import { PurchaseOrderDialog } from "@/components/purchases/purchase-order-dialog";
import { ReceiptPreviewDialog } from "./receipt-preview-dialog";
import { AssignStaffDialog } from "./assign-staff-dialog";
import { ConfirmOrderDialog } from "./confirm-order-dialog";
import { Pagination } from "@/components/ui/pagination";
import { IOrder } from "@/app/dashboard/purchases/page";

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
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);


  const getStatusColor = (status: string) => {
    switch (status) {
      case "not assigned":
        return "secondary";
      case "assigned":
        return "default";
      case "confirmed":
        return "outline";
      case "paid":
        return "default";
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

  const handleConfirmOrder = (order: IOrder) => {
    setSelectedOrder(order);
    setIsConfirmDialogOpen(true);
  };

  const handleOrderUpdated = (updatedOrder: IOrder) => {
    setPurchaseOrders((prevOrders: IOrder[]) =>
      prevOrders.map((order) =>
        order._id === updatedOrder._id ? updatedOrder : order
      )
    );
  };

  const handleExportOrder = (orderId: string) => {
    console.log("Exporting order:", orderId);
    // Implement PDF export
  };

  // Get action button based on order status
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
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleConfirmOrder(order)}
            className="gap-2"
          >
            <CheckCircle className="h-3 w-3" />
            Confirm
          </Button>
        );
      case "confirmed":
        return (
          <Badge variant="outline" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            Ready for Payment
          </Badge>
        );
      case "paid":
        return (
          <Badge variant="default" className="gap-1">
            <DollarSign className="h-3 w-3" />
            Paid
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
                            src={process.env.NEXT_PUBLIC_BASE_URL + order?.bon}
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
                          <img
                            src={
                              process.env.NEXT_PUBLIC_BASE_URL +
                              order.supplierId?.image
                            }
                            alt={order.supplierId?.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          {order.supplierId?.name}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {order.staffId ? (
                        <div className="flex items-center gap-2">
                          <img
                            src={
                              process.env.NEXT_PUBLIC_BASE_URL +
                              order.staffId?.avatar
                            }
                            alt={order.staffId?.fullname}
                            className="w-8 h-8 rounded-full object-cover"
                          />
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
      <ConfirmOrderDialog
        order={selectedOrder}
        open={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
        onOrderUpdated={handleOrderUpdated}
      />
    </>
  );
}
