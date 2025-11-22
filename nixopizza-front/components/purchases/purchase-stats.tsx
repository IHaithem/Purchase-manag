import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getOrdersStats } from "@/lib/apis/purchase-list";
import { Clock, CheckCircle, DollarSign, Eye } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import { IOrder } from "@/app/dashboard/purchases/page";

interface PurchaseStatsProps {
  filteredOrders: IOrder[];
  filtersActive: boolean;
}

interface ApiStats {
  notAssignedOrders: number;
  assignedOrders: number;
  pendingReviewOrders: number;
  verifiedOrders: number;
  paidOrders: number;
  totalValue: number; // monthly paid value from backend
}

export function PurchaseStats({ filteredOrders, filtersActive }: PurchaseStatsProps) {
  const [stats, setStats] = useState<ApiStats>({
    notAssignedOrders: 0,
    assignedOrders: 0,
    pendingReviewOrders: 0,
    verifiedOrders: 0,
    paidOrders: 0,
    totalValue: 0,
  });

  // Fetch global (unfiltered / monthly) stats once
  useEffect(() => {
    const fetchStats = async () => {
      const response = await getOrdersStats();
      if (response.success) {
        setStats({
          notAssignedOrders: response.notAssignedOrders || 0,
          assignedOrders: response.assignedOrders || 0,
          pendingReviewOrders: response.pendingReviewOrders || 0,
          verifiedOrders: response.verifiedOrders || 0,
          paidOrders: response.paidOrders || 0,
          totalValue: response.totalValue || 0,
        });
      } else {
        toast.error(response.message || "Failed to fetch order stats");
      }
    };
    fetchStats();
  }, []);

  // When filters are active, compute everything locally from filteredOrders
  const filteredComputed = useMemo(() => {
    if (!filtersActive) return null;
    const count = (s: IOrder["status"]) =>
      filteredOrders.filter(o => o.status === s).length;
    const filteredPaidValue = filteredOrders
      .filter(o => o.status === "paid")
      .reduce((sum, o) => sum + o.totalAmount, 0);
    const filteredTotalValue = filteredOrders.reduce(
      (sum, o) => sum + o.totalAmount,
      0
    );
    return {
      notAssigned: count("not assigned"),
      assigned: count("assigned"),
      pendingReview: count("pending_review"),
      verified: count("verified"),
      paid: count("paid"),
      filteredPaidValue,
      filteredTotalValue,
    };
  }, [filtersActive, filteredOrders]);

  // Pending = not assigned + assigned
  const pendingTotal = filtersActive
    ? (filteredComputed?.notAssigned || 0) + (filteredComputed?.assigned || 0)
    : stats.notAssignedOrders + stats.assignedOrders;

  const pendingReview = filtersActive
    ? filteredComputed?.pendingReview || 0
    : stats.pendingReviewOrders;

  const verified = filtersActive
    ? filteredComputed?.verified || 0
    : stats.verifiedOrders;

  // Last card shows total value of current selection (NOT just paid) when filtered.
  const displayTotalValue = filtersActive
    ? (filteredComputed?.filteredTotalValue || 0).toFixed(2)
    : stats.totalValue.toFixed(2);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Pending (Not Assigned + Assigned)
          </CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{pendingTotal}</div>
          <p className="text-xs text-muted-foreground">
            Awaiting bill submission
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
          <Eye className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{pendingReview}</div>
          <p className="text-xs text-muted-foreground">
            Bill uploaded, waiting verification
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Verified Orders</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{verified}</div>
          <p className="text-xs text-muted-foreground">Inventory updated</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {filtersActive
              ? "Filtered Total Value"
              : "Total Paid Value (This Month)"}
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{displayTotalValue} DA</div>
          <p className="text-xs text-muted-foreground">
            {filtersActive
              ? "Sum of all filtered orders"
              : "Paid orders this month"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}