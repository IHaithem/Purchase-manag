import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getOrdersStats } from "@/lib/apis/purchase-list";
import { Clock, CheckCircle, DollarSign, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export function PurchaseStats() {
  const [stats, setStats] = useState({
    notAssignedOrders: 0,
    assignedOrders: 0,
    pendingReviewOrders: 0,
    verifiedOrders: 0,
    paidOrders: 0,
    totalValue: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const response = await getOrdersStats();
      if (response.success) {
        const {
          notAssignedOrders = 0,
          assignedOrders = 0,
          pendingReviewOrders = 0,
          verifiedOrders = 0,
          paidOrders = 0,
          totalValue = 0,
        } = response;
        setStats({
          notAssignedOrders,
          assignedOrders,
          pendingReviewOrders,
          verifiedOrders,
          paidOrders,
          totalValue,
        });
      } else {
        toast.error(response.message || "Failed to fetch order stats");
      }
    };
    fetchStats();
  }, []);

  const pendingTotal = stats.notAssignedOrders + stats.assignedOrders;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending (Not Assigned + Assigned)</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{pendingTotal}</div>
          <p className="text-xs text-muted-foreground">Awaiting bill submission</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
          <Eye className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{stats.pendingReviewOrders}</div>
          <p className="text-xs text-muted-foreground">Bill uploaded, waiting verification</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Verified Orders</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.verifiedOrders}</div>
          <p className="text-xs text-muted-foreground">Inventory updated</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Paid Value (This Month)</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalValue.toFixed(2)} DA</div>
          <p className="text-xs text-muted-foreground">Paid orders this month</p>
        </CardContent>
      </Card>
    </div>
  );
}