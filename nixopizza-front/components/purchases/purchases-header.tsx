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
import { Search, Filter, ArrowUpDown, Calendar as CalendarIcon, X } from "lucide-react";
import { useEffect, useState } from "react";
import { GeneratePurchaseListDialog } from "./generate-purchase-list-dialog";
import { ManualOrderDialog } from "./manual-order-dialog";
import { MultiSupplierSelect } from "@/components/ui/multi-supplier-select";
import { ISupplier } from "@/app/dashboard/suppliers/page";
import { IOrder } from "@/app/dashboard/purchases/page";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export function PurchasesHeader({
  onSearchChange,
  onStatusChange,
  onSupplierChange,
  onSortChange,
  onDateRangeChange,
  addNewOrder,
  onRefresh,
  initialStatus = "all",
  initialDateRange = { from: null, to: null },
}: {
  onSearchChange: (search: string) => void;
  onStatusChange: (status: string) => void;
  onSupplierChange: (supplierIds: string[]) => void;
  onSortChange: (sort: { sortBy: string; order: string }) => void;
  onDateRangeChange: (range: { from: Date | null; to: Date | null }) => void;
  addNewOrder: (newOrder: IOrder) => void;
  onRefresh?: () => void;
  initialStatus?: string;
  initialDateRange?: { from: Date | null; to: Date | null };
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [selectedSuppliers, setSelectedSuppliers] = useState<ISupplier[]>([]);
  const [sortBy, setSortBy] = useState("createdAt");
  const [order, setOrder] = useState("desc");
  const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null }>(initialDateRange);

  // Sync with initial values when they change (from URL params)
  useEffect(() => {
    setStatusFilter(initialStatus);
  }, [initialStatus]);

  useEffect(() => {
    setDateRange(initialDateRange);
  }, [initialDateRange]);

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
  const handleSortChange = (value: string) => {
    setSortBy(value);
    onSortChange({ sortBy: value, order });
  };

  // Handle date range change
  const handleDateRangeChange = (range: { from: Date | null; to: Date | null }) => {
    setDateRange(range);
    onDateRangeChange(range);
  };

  // Clear date range
  const clearDateRange = () => {
    const emptyRange = { from: null, to: null };
    setDateRange(emptyRange);
    onDateRangeChange(emptyRange);
  };

  const handleNewOrder = (newOrder: IOrder) => {
    addNewOrder(newOrder);
    // Trigger refresh if callback provided
    if (onRefresh) {
      onRefresh();
    }
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
          <ManualOrderDialog addNewOrder={handleNewOrder} />
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
          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[180px] border-2 border-input focus:ring-2 focus:ring-primary/30">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="not assigned">Not Assigned</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="canceled">Canceled</SelectItem>
            </SelectContent>
          </Select>

          {/* Supplier Filter */}
          <MultiSupplierSelect
            selectedSuppliers={selectedSuppliers}
            onSuppliersChange={handleSupplierChange}
            placeholder="Select suppliers..."
            className="min-w-[200px] max-w-[400px] border-2 border-input focus:ring-2 focus:ring-primary/30"
          />

          {/* Date Range Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[280px] justify-start text-left font-normal border-2 border-input",
                  !dateRange.from && !dateRange.to && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from && dateRange.to ? (
                  <>
                    {format(dateRange.from, "PP")} - {format(dateRange.to, "PP")}
                  </>
                ) : (
                  <span>Pick a date range</span>
                )}
                {(dateRange.from || dateRange.to) && (
                  <X
                    className="ml-auto h-4 w-4"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearDateRange();
                    }}
                  />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="p-3 space-y-3">
                <div>
                  <p className="text-sm font-medium mb-2">From Date</p>
                  <Calendar
                    mode="single"
                    selected={dateRange.from || undefined}
                    onSelect={(date) =>
                      handleDateRangeChange({ ...dateRange, from: date || null })
                    }
                    initialFocus
                  />
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">To Date</p>
                  <Calendar
                    mode="single"
                    selected={dateRange.to || undefined}
                    onSelect={(date) =>
                      handleDateRangeChange({ ...dateRange, to: date || null })
                    }
                    disabled={(date) =>
                      dateRange.from ? date < dateRange.from : false
                    }
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Sort Filter */}
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

          {/* Sort Order Button */}
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