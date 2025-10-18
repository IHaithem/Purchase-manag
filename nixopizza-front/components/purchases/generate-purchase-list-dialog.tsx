"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap, Package, AlertTriangle } from "lucide-react"

// Mock low stock items grouped by supplier
const supplierGroups = [
  {
    supplier: "Cable Solutions",
    items: [
      { id: "1", name: "USB-C Cable 2m", currentStock: 3, minStock: 15, suggestedOrder: 25, price: 12.99 },
      { id: "2", name: "Lightning Cable", currentStock: 5, minStock: 20, suggestedOrder: 30, price: 15.99 },
    ],
  },
  {
    supplier: "Mobile Accessories",
    items: [
      { id: "3", name: "Phone Case Clear", currentStock: 8, minStock: 20, suggestedOrder: 40, price: 19.99 },
      { id: "4", name: "Screen Protector", currentStock: 12, minStock: 25, suggestedOrder: 50, price: 9.99 },
      { id: "5", name: "Phone Charger", currentStock: 0, minStock: 20, suggestedOrder: 35, price: 24.99 },
    ],
  },
  {
    supplier: "Tech Peripherals",
    items: [{ id: "6", name: "Wireless Mouse", currentStock: 0, minStock: 10, suggestedOrder: 20, price: 34.99 }],
  },
]

export function GeneratePurchaseListDialog() {
  const [open, setOpen] = useState(false)
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  const handleItemToggle = (itemId: string) => {
    setSelectedItems((prev) => (prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]))
  }

  const handleSupplierToggle = (supplier: string) => {
    const supplierItems = supplierGroups.find((group) => group.supplier === supplier)?.items || []
    const supplierItemIds = supplierItems.map((item) => item.id)
    const allSelected = supplierItemIds.every((id) => selectedItems.includes(id))

    if (allSelected) {
      setSelectedItems((prev) => prev.filter((id) => !supplierItemIds.includes(id)))
    } else {
      setSelectedItems((prev) => [...new Set([...prev, ...supplierItemIds])])
    }
  }

  const handleSelectAll = () => {
    const allItemIds = supplierGroups.flatMap((group) => group.items.map((item) => item.id))
    if (selectedItems.length === allItemIds.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(allItemIds)
    }
  }

  const handleGenerate = () => {
    console.log("Generating purchase lists for items:", selectedItems)
    setOpen(false)
    setSelectedItems([])
  }

  const getTotalValue = () => {
    return supplierGroups
      .flatMap((group) => group.items)
      .filter((item) => selectedItems.includes(item.id))
      .reduce((total, item) => total + item.suggestedOrder * item.price, 0)
  }

  const getSelectedCount = () => selectedItems.length
  const getTotalItems = () => supplierGroups.flatMap((group) => group.items).length

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Zap className="h-4 w-4" />
          Generate Purchase Lists
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Generate Purchase Lists
          </DialogTitle>
          <DialogDescription>
            Select items below minimum stock to automatically generate purchase orders grouped by supplier.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Summary */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={handleSelectAll}>
                {selectedItems.length === getTotalItems() ? "Deselect All" : "Select All"}
              </Button>
              <span className="text-sm text-muted-foreground">
                {getSelectedCount()} of {getTotalItems()} items selected
              </span>
            </div>
            <div className="text-sm font-medium">Total: ${getTotalValue().toFixed(2)}</div>
          </div>

          {/* Supplier Groups */}
          <div className="space-y-4">
            {supplierGroups.map((group) => {
              const supplierItemIds = group.items.map((item) => item.id)
              const supplierSelected = supplierItemIds.filter((id) => selectedItems.includes(id)).length
              const supplierTotal = group.items
                .filter((item) => selectedItems.includes(item.id))
                .reduce((total, item) => total + item.suggestedOrder * item.price, 0)

              return (
                <Card key={group.supplier}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-heading flex items-center gap-2">
                        <Checkbox
                          checked={supplierSelected === supplierItemIds.length && supplierSelected > 0}
                          onCheckedChange={() => handleSupplierToggle(group.supplier)}
                        />
                        {group.supplier}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {supplierSelected}/{group.items.length} items
                        </Badge>
                        {supplierTotal > 0 && <span className="text-sm font-medium">${supplierTotal.toFixed(2)}</span>}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {group.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={selectedItems.includes(item.id)}
                              onCheckedChange={() => handleItemToggle(item.id)}
                            />
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div className="font-medium">{item.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  Stock: {item.currentStock} / Min: {item.minStock}
                                </div>
                              </div>
                            </div>
                            {item.currentStock === 0 && <AlertTriangle className="h-4 w-4 text-destructive" />}
                          </div>
                          <div className="text-right">
                            <div className="font-medium">Order: {item.suggestedOrder}</div>
                            <div className="text-sm text-muted-foreground">
                              ${(item.suggestedOrder * item.price).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleGenerate} disabled={selectedItems.length === 0}>
            Generate {selectedItems.length > 0 ? `${selectedItems.length} ` : ""}Purchase Lists
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
