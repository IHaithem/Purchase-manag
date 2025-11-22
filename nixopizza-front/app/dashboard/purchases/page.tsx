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
  status: "not assigned" | "assigned" | "pending_review" | "verified" | "paid" | "canceled";
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
  assignedDate?: Date;
  pendingReviewDate?: Date;
  verifiedDate?: Date;
  paidDate?: Date;
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

  useEffect(() => {
    const statusParam = searchParams.get("status");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    if (statusParam) setStatus(statusParam);
    if (dateFrom && dateTo) {
      setDateRange({ from: new Date(dateFrom), to: new Date(dateTo) });
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchOrders = async () => {
      const params: any = {
        orderNumber: search,
        page: currentPage,
        limit: 1000,
        sortBy: sort.sortBy,
        order: sort.order,
      };
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

  const filteredOrders = useMemo(() => {
    let filtered = [...allPurchaseOrders];
    if (dateRange.from || dateRange.to) {
      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.createdAt);
        if (dateRange.from && orderDate < dateRange.from) return false;
        if (dateRange.to && orderDate > dateRange.to) return false;
        return true;
      });
    }
    if (status !== "all") {
      const statusArray = status.split(",").map((s) => s.trim());
      filtered = filtered.filter((o) => statusArray.includes(o.status));
    }
    return filtered;
  }, [allPurchaseOrders, dateRange, status]);

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * limit;
    const endIndex = startIndex + limit;
    const total = Math.ceil(filteredOrders.length / limit);
    setTotalPages(total || 1);
    return filteredOrders.slice(startIndex, endIndex);
  }, [filteredOrders, currentPage, limit]);

  const addingNewOrder = (newOrder: IOrder) => {
    setAllPurchaseOrders((prev) => [newOrder, ...prev]);
  };

  const handleRefresh = () => setRefreshTrigger((p) => p + 1);

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
        <PurchaseStats/>
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