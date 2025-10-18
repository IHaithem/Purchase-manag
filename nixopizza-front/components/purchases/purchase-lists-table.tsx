// components/purchases/purchase-lists-table.tsx
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
import { MoreHorizontal, Eye, Download, Receipt, Package } from "lucide-react";
import { PurchaseOrderDialog } from "@/components/purchases/purchase-order-dialog";
import { ReceiptPreviewDialog } from "./receipt-preview-dialog";
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
  const [selectedOrder, setSelectedOrder] = useState<
    (typeof purchaseOrders)[0] | null
  >(null);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "secondary";
      case "confirmed":
        return "destructive";
      case "paid":
        return "outline";
    }
  };

  const handleViewOrder = (order: (typeof purchaseOrders)[0]) => {
    setSelectedOrder(order);
    setIsOrderDialogOpen(true);
  };

  const handleViewReceipt = (order: (typeof purchaseOrders)[0]) => {
    setSelectedOrder(order);
    setIsReceiptDialogOpen(true);
  };

  const handleExportOrder = (orderId: string) => {
    console.log("Exporting order:", orderId);
    // Simulate PDF export
  };

  const handleSendOrder = (orderId: string) => {
    console.log("Sending order:", orderId);
    // Simulate sending order to supplier
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
                  <TableHead>Items</TableHead>
                  <TableHead>Total Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Delivery Date</TableHead>
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
                    <TableCell>
                      {order.paidDate
                        ? new Date(order.paidDate).toLocaleDateString("en-GB")
                        : "Not Paid"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewReceipt(order)}
                        title="Preview Receipt"
                      >
                        <Receipt className="h-4 w-4" />
                      </Button>
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
    </>
  );
}
