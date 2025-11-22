// app/dashboard/purchases/page.tsx
"use client";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PurchasesHeader } from "@/components/purchases/purchases-header";
import { PurchaseListsTable } from "@/components/purchases/purchase-lists-table";
import { PurchaseStats } from "@/components/purchases/purchase-stats";
import { useEffect, useState, useMemo } from "react";
import { getOrders } from "@/lib/apis/purchase-list";
import toast from "react-hot-toast";
import { useSearchParams } from "next/navigation";

export interface IOrder {
  _id: string;
  bon: string;
  orderNumber: string;
  supplierId: {
    name: string;
    email: string;
    _id: string;
    image: string;
    address: string;
    phone1: string;
    phone2?: string;
    phone3?: string;
    city?: string;
    contactPerson: string;
  };
  staffId: {
    fullname: string;
    email: string;
    _id: string;
    avatar: string;
  } | null;
  status: "not assigned" | "assigned" | "confirmed" | "paid" | "canceled";
  totalAmount: number;
  items: {
    productId: {
      name: string;
      _id: string;
      imageUrl: string;
      barcode: string;
    };
    quantity: number;
    expirationDate: Date;
    unitCost: number;
    remainingQte: number;
    isExpired: boolean;
    expiredQuantity: number;
  }[];
  notes: string;
  createdAt: Date;
  updatedAt: Date;
  assignedDate: Date;
  confirmedDate: Date;
  paidDate: Date;
  expectedDate?: Date;
  canceledDate?: Date;
}

export default function PurchasesPage() {
  const searchParams = useSearchParams();
  const [allPurchaseOrders, setAllPurchaseOrders] = useState<IOrder[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [supplierIds, setSupplierIds] = useState<string[]>([]);
  const [sort, setSort] = useState({ sortBy: "createdAt", order: "desc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null }>({
    from: null,
    to: null,
  });

  // Apply filters from URL parameters on initial load (used by Shortcuts)
  useEffect(() => {
    const statusParam = searchParams.get("status");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    if (statusParam) {
      setStatus(statusParam);
    }

    if (dateFrom && dateTo) {
      setDateRange({
        from: new Date(dateFrom),
        to: new Date(dateTo),
      });
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchOrders = async () => {
      const params: any = {
        orderNumber: search,
        page: currentPage,
        limit: 1000, // Fetch all orders for client-side filtering
        sortBy: sort.sortBy,
        order: sort.order,
      };

      // Don't send status or dates to backend - we'll filter on frontend
      if (supplierIds.length > 0) {
        params.supplierIds = supplierIds.join(",");
      }

      const { orders, success, message } = await getOrders(params);

      if (success) {
        setAllPurchaseOrders(orders);
      } else {
        toast.error(message || "Failed to fetch orders");
      }
    };
    fetchOrders();
  }, [search, supplierIds, sort, refreshTrigger, currentPage]);

  // Client-side filtering
  const filteredOrders = useMemo(() => {
    let filtered = [...allPurchaseOrders];

    // Filter by date range
    if (dateRange.from || dateRange.to) {
      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.createdAt);
        if (dateRange.from && orderDate < dateRange.from) return false;
        if (dateRange.to && orderDate > dateRange.to) return false;
        return true;
      });
    }

    // Filter by status (handle comma-separated)
    if (status !== "all") {
      const statusArray = status.split(",").map((s) => s.trim());
      filtered = filtered.filter((order) => statusArray.includes(order.status));
    }

    return filtered;
  }, [allPurchaseOrders, dateRange, status]);

  // Stats computed from the filtered orders (reacts to filters and shortcuts)
  const filteredStats = useMemo(() => {
    const pendingOrders = filteredOrders.filter((o) =>
      ["not assigned", "assigned"].includes(o.status)
    ).length;
    const confirmedOrders = filteredOrders.filter((o) => o.status === "confirmed").length;
    const paidOrders = filteredOrders.filter((o) => o.status === "paid").length;
    const totalValue = filteredOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    return { pendingOrders, confirmedOrders, paidOrders, totalValue };
  }, [filteredOrders]);

  // Pagination
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * limit;
    const endIndex = startIndex + limit;
    const total = Math.ceil(filteredOrders.length / limit);
    setTotalPages(total || 1);
    return filteredOrders.slice(startIndex, endIndex);
  }, [filteredOrders, currentPage, limit]);

  const addingNewOrder = (newOrder: IOrder) => {
    setAllPurchaseOrders((prevOrders) => [newOrder, ...prevOrders]);
  };

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PurchasesHeader
          onSearchChange={setSearch}
          onStatusChange={setStatus}
          onSupplierChange={setSupplierIds}
          onSortChange={setSort}
          onDateRangeChange={setDateRange}
          addNewOrder={addingNewOrder}
          onRefresh={handleRefresh}
          initialStatus={status}
          initialDateRange={dateRange}
        />
        <PurchaseStats
          pendingOrders={filteredStats.pendingOrders}
          confirmedOrders={filteredStats.confirmedOrders}
          paidOrders={filteredStats.paidOrders}
          totalValue={filteredStats.totalValue}
        />
        <PurchaseListsTable
          setPurchaseOrders={setAllPurchaseOrders}
          purchaseOrders={paginatedOrders}
          totalPages={totalPages}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          limit={limit}
          setLimit={setLimit}
        />
      </div>
    </DashboardLayout>
  );
}