"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { AlertsHeader } from "@/components/alerts/alerts-header";
import { LowStockTable } from "@/components/alerts/low-stock-table";
import { AlertsOverview } from "@/components/alerts/alerts-overview";
import { IProduct } from "../products/page";
import { useEffect, useState } from "react";
import { getLowStockProducts } from "@/lib/apis/products";
import toast from "react-hot-toast";
type StatusFilter = "all" | "critical" | "high" | "medium";

export default function AlertsPage() {
  const [summary, setSummary] = useState({
    critical: 0,
    high: 0,
    medium: 0,
    total: 0,
  });
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<{
    name: string;
    status: StatusFilter;
  }>({
    name: "",
    status: "all",
  });

  const fetchData = async () => {
    setLoading(true);
    const apiParams: any = {};
    if (filters.name) apiParams.name = filters.name;
    if (filters.status !== "all") apiParams.status = filters.status;

    const result = await getLowStockProducts(apiParams);
    if (result.success) {
      // If filtering by status, adjust summary to show only relevant count
      if (filters.status === "all") {
        setSummary(result.summary);
      } else {
        setSummary({
          critical: filters.status === "critical" ? result.summary.critical : 0,
          high: filters.status === "high" ? result.summary.high : 0,
          medium: filters.status === "medium" ? result.summary.medium : 0,
          total: result.summary.total,
        });
      }
      setProducts(result.products);
    } else {
      toast.error(result.message);
      setProducts([]);
      setSummary({ critical: 0, high: 0, medium: 0, total: 0 });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  const handleFilterChange = (newFilters: {
    name?: string;
    status?: string;
  }) => {
    setFilters((prev) => ({
      name: newFilters.name ?? prev.name,
      status: (newFilters.status as any) ?? prev.status,
    }));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <AlertsHeader
          name={filters.name}
          status={filters.status}
          onFilterChange={handleFilterChange}
        />
        <AlertsOverview
          critical={summary.critical}
          high={summary.high}
          medium={summary.medium}
        />
        <LowStockTable lowStockItems={products} />
      </div>
    </DashboardLayout>
  );
}
