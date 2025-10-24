"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useAuth } from "@/hooks/useAuth";
import { getOrders } from "@/lib/apis/purchase-list";
import { Card } from "@/components/ui/card";
import { Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface IOrder {
  _id: string;
  status: "not assigned" | "assigned" | "confirmed" | "paid";
  createdAt: string;
  supplierId: {
    name: string;
    image: string;
    _id: string;
  };
}

export default function StaffDashboardPage() {
  const { user } = useAuth();
  const [recentOrders, setRecentOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentOrders = async () => {
      if (!user?._id) return;

      try {
        const { orders } = await getOrders({ assignedTo: user._id, limit: 5 });
        setRecentOrders(orders);
      } catch (error) {
        console.error("Failed to fetch recent orders", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentOrders();
  }, [user]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Message */}
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">
            Staff Dashboard
          </h1>
          {user ? (
            <p className="text-muted-foreground">
              Welcome back, {user.fullname}. Here's a quick overview of your current orders and tasks.
            </p>
          ) : (
            <p className="text-muted-foreground">Welcome. Loading your profile...</p>
          )}
        </div>

        {/* Dashboard Widgets */}
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          {/* Recent Orders Widget */}
          <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold">Recent Assigned Orders</h2>
              <Package className="h-5 w-5 text-muted-foreground" />
            </div>

            {loading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : recentOrders.length === 0 ? (
              <div className="text-center py-6">
                <img src="/empty-box.svg" alt="No orders" className="mx-auto h-20" />
                <p className="text-sm text-muted-foreground mt-2">
                  No orders assigned to you yet.
                </p>
              </div>
            ) : (
              <ul className="space-y-4">
                {recentOrders.map((order) => (
                  <li key={order._id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Image
                        src={order.supplierId.image || "/placeholder.png"}
                        alt={order.supplierId.name}
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium">{order.supplierId.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Assigned on {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "text-xs px-2 py-1 rounded-full",
                        order.status === "assigned" && "bg-yellow-100 text-yellow-800",
                        order.status === "confirmed" && "bg-green-100 text-green-800",
                        order.status === "paid" && "bg-blue-100 text-blue-800",
                        order.status === "not assigned" && "bg-gray-100 text-gray-600"
                      )}
                    >
                      {order.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Quick Links Widget */}
          <Card className="p-4 hover:shadow-md transition-shadow">
            <h2 className="text-lg font-semibold mb-2">Quick Links</h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/dashboardstaff/orders" className="hover:underline">
                  View All Orders
                </Link>
              </li>
              <li>
                <Link href="/dashboardstaff/tasks" className="hover:underline">
                  Manage Tasks
                </Link>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
