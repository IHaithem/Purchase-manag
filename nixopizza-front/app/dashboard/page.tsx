import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { InventoryChart } from "@/components/dashboard/inventory-chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { TopSuppliers } from "@/components/dashboard/top-suppliers";
import { LowStockWidget } from "@/components/dashboard/low-stock-widget";
import SpendingChartPage from "@/components/dashboard/SpendingChartPage";
import CategorySpendingChart from "@/components/dashboard/CategorySpendingChart";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome to your inventory management dashboard
          </p>
        </div>
        <SpendingChartPage />
        <CategorySpendingChart />

        {/* Stats Cards */}
        <DashboardStats />

        {/* Charts and Widgets */}
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <RecentActivity />
          </div>
          <div className="lg:col-span-2">
            <LowStockWidget />
          </div>
        </div>
        {/* Supplier Performance */}
        <TopSuppliers />
      </div>
    </DashboardLayout>
  );
}
