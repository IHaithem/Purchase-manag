"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Building2, Calendar, DollarSign, Package } from "lucide-react"

interface PurchaseOrder {
  id: string
  supplier: string
  items: number
  totalValue: number
  status: string
  createdDate: string
  expectedDelivery: string
  priority: string
}

interface SupplierOrdersDialogProps {
  supplier: string | null
  orders: PurchaseOrder[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SupplierOrdersDialog({
  supplier,
  orders,
  open,
  onOpenChange,
}: SupplierOrdersDialogProps) {
  if (!supplier) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Draft":
        return "secondary"
      case "Sent":
      case "Confirmed":
      case "Delivered":
        return "default"
      default:
        return "secondary"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Orders from {supplier.name}
          </DialogTitle>
          <DialogDescription>
            Showing {orders.length} orders placed with {supplier.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Order {order.id}
                </CardTitle>
                <Badge variant={getStatusColor(order.status) as any}>
                  {order.status}
                </Badge>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Created</span>
                  <div>{order.createdDate}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Items</span>
                  <div>{order.items}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Expected Delivery</span>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {order.expectedDelivery}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Value</span>
                  <div className="flex items-center gap-1 font-medium">
                    DZA
                    {order.totalValue.toFixed(2)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {orders.length === 0 && (
          <div className="text-center text-muted-foreground py-6">
            No orders found for this supplier.
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
