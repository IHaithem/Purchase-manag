"use client";

import { useEffect, useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PurchaseListsTable } from "@/components/purchases/purchase-lists-table";
import { PurchaseStats } from "@/components/purchases/purchase-stats";
import { getOrders } from "@/lib/apis/purchase-list";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";

export default function StaffOrdersPage() {
  const { user } = useAuth();
  const [allOrders, setAllOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?._id) return;

      const params = {
        page: currentPage,
        limit: 1000,
        sortBy: "createdAt",
        order: "desc",
        staffId: user._id, // ✅ filter by logged-in staff
      };

      const { orders, success, message } = await getOrders(params);

      if (success) {
        setAllOrders(orders);
      } else {
        toast.error(message || "Failed to fetch orders");
      }
    };

    fetchOrders();
  }, [user, currentPage, refreshTrigger]);

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * limit;
    const endIndex = startIndex + limit;
    const total = Math.ceil(allOrders.length / limit);
    setTotalPages(total || 1);
    return allOrders.slice(startIndex, endIndex);
  }, [allOrders, currentPage, limit]);

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Your Assigned Orders</h1>
        <PurchaseListsTable
          setPurchaseOrders={setAllOrders}
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
