// components/purchases/purchases-header.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, ArrowUpDown } from "lucide-react";
import { useState } from "react";
import { GeneratePurchaseListDialog } from "./generate-purchase-list-dialog";
import { ManualOrderDialog } from "./manual-order-dialog";
import { MultiSupplierSelect } from "@/components/ui/multi-supplier-select";
import { ISupplier } from "@/app/dashboard/suppliers/page";
import { IOrder } from "@/app/dashboard/purchases/page";

export function PurchasesHeader({
  onSearchChange,
  onStatusChange,
  onSupplierChange,
  onSortChange,
  addNewOrder,
}: {
  onSearchChange: (search: string) => void;
  onStatusChange: (status: string) => void;
  onSupplierChange: (supplierIds: string[]) => void;
  onSortChange: (sort: { sortBy: string; order: string }) => void;
  addNewOrder: (newOrder: IOrder) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedSuppliers, setSelectedSuppliers] = useState<ISupplier[]>([]);
  const [sortBy, setSortBy] = useState("createdAt");
  const [order, setOrder] = useState("desc");

  // Handle search change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearchChange(value);
  };

  // Handle status change
  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    onStatusChange(value);
  };

  // Handle supplier change
  const handleSupplierChange = (suppliers: ISupplier[]) => {
    setSelectedSuppliers(suppliers);
    onSupplierChange(suppliers.map((supplier) => supplier._id));
  };

  // Handle sort change
  const handleSortChange = (field: string) => {
    setSortBy(field);
    // Toggle order if same field is selected
    const newOrder = sortBy === field && order === "asc" ? "desc" : "asc";
    setOrder(newOrder);
    onSortChange({ sortBy: field, order: newOrder });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">
            Purchase Management
          </h1>
          <p className="text-muted-foreground">
            Manage purchase orders and supplier communications
          </p>
        </div>
        <div className="flex gap-2">
          <ManualOrderDialog addNewOrder={addNewOrder} />
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search purchase orders..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 border-2 border-input focus-visible:ring-2 focus-visible:ring-primary/30"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[180px] border-2 border-input focus:ring-2 focus:ring-primary/30">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
            </SelectContent>
          </Select>
          <MultiSupplierSelect
            selectedSuppliers={selectedSuppliers}
            onSuppliersChange={handleSupplierChange}
            placeholder="Select suppliers..."
            className="min-w-[200px] max-w-[400px] border-2 border-input focus:ring-2 focus:ring-primary/30"
          />
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[180px] border-2 border-input focus:ring-2 focus:ring-primary/30">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">Date Added</SelectItem>
              <SelectItem value="orderNumber">Order Number</SelectItem>
              <SelectItem value="totalAmount">Total Amount</SelectItem>
              <SelectItem value="supplierId.name">Supplier</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            className="border-2 border-input"
            onClick={() => {
              const newOrder = order === "asc" ? "desc" : "asc";
              setOrder(newOrder);
              onSortChange({ sortBy, order: newOrder });
            }}
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
