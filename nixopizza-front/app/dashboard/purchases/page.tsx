// app/dashboard/purchases/page.tsx
"use client";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PurchasesHeader } from "@/components/purchases/purchases-header";
import { PurchaseListsTable } from "@/components/purchases/purchase-lists-table";
import { PurchaseStats } from "@/components/purchases/purchase-stats";
import { useEffect, useState } from "react";
import { getOrders } from "@/lib/apis/purchase-list";
import toast from "react-hot-toast";

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
    phone: string;
    contactPerson: string;
  };
  staffId: {
    fullname: string;
    email: string;
    _id: string;
    avatar: string;
  };
  status: "pending" | "confirmed" | "paid";
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
  paidDate: Date;
}

export default function PurchasesPage() {
  const [purchaseOrders, setPurchaseOrders] = useState<IOrder[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [supplierIds, setSupplierIds] = useState<string[]>([]);
  const [sort, setSort] = useState({ sortBy: "createdAt", order: "desc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    const fetchOrders = async () => {
      const params: any = {
        orderNumber: search,
        page: currentPage,
        limit,
        sortBy: sort.sortBy,
        order: sort.order,
      };

      if (status !== "all") {
        params.status = status;
      }
      if (supplierIds.length > 0) {
        params.supplierIds = supplierIds.join(",");
      }

      const { orders, success, message, pages } = await getOrders(params);

      if (success) {
        setPurchaseOrders(orders);
        setTotalPages(pages || 1);
      } else {
        toast.error(message || "Failed to fetch orders");
      }
    };
    fetchOrders();
  }, [search, status, supplierIds, sort, currentPage, limit]);

  const addingNewOrder = (newOrder: IOrder) => {
    setPurchaseOrders((prevOrders) => [newOrder, ...prevOrders]);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PurchasesHeader
          onSearchChange={setSearch}
          onStatusChange={setStatus}
          onSupplierChange={setSupplierIds}
          onSortChange={setSort}
          addNewOrder={addingNewOrder}
        />
        <PurchaseStats />
        <PurchaseListsTable
          setPurchaseOrders={setPurchaseOrders}
          purchaseOrders={purchaseOrders}
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
