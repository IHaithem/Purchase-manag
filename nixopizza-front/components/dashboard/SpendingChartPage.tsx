"use client";

import React, { useEffect, useState } from "react";
import { ResponsiveBar } from "@nivo/bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingCart, TrendingUp, BarChart3 } from "lucide-react";
import { getMonthAnalytics } from "@/lib/apis/analytics";
import toast from "react-hot-toast";

const SpendingChartPage = () => {
  const currentData = [
    {
      year: 2025,
      month: 3,
      monthName: "March",
      totalSpent: 1250,
      orderCount: 8,
      period: "2025-03",
    },
    {
      year: 2025,
      month: 4,
      monthName: "April",
      totalSpent: 890,
      orderCount: 5,
      period: "2025-04",
    },
    {
      year: 2025,
      month: 5,
      monthName: "May",
      totalSpent: 1680,
      orderCount: 12,
      period: "2025-05",
    },
    {
      year: 2025,
      month: 6,
      monthName: "June",
      totalSpent: 2150,
      orderCount: 15,
      period: "2025-06",
    },
    {
      year: 2025,
      month: 7,
      monthName: "July",
      totalSpent: 1420,
      orderCount: 9,
      period: "2025-07",
    },
    {
      year: 2025,
      month: 8,
      monthName: "August",
      totalSpent: 1890,
      orderCount: 11,
      period: "2025-08",
    },
    {
      year: 2025,
      month: 9,
      monthName: "September",
      totalSpent: 950,
      orderCount: 6,
      period: "2025-09",
    },
  ];
  const [chartType, setChartType] = useState("totalSpent");
  const [loading, setLoading] = useState(false);

  // Transform data for Nivo chart
  const chartData = currentData.map((item) => ({
    month: item.monthName,
    totalSpent: item.totalSpent,
    orderCount: item.orderCount,
    period: item.period,
  }));

  const formatCurrency = (value: any) => {
    return new Intl.NumberFormat("fr-DZ", {
      style: "currency",
      currency: "DZA",
    }).format(value);
  };

  const totalSpent = currentData.reduce(
    (sum, item) => sum + item.totalSpent,
    0
  );
  const totalOrders = currentData.reduce(
    (sum, item) => sum + item.orderCount,
    0
  );
  const averageMonthly =
    currentData.length > 0 ? totalSpent / currentData.length : 0;

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const { success, data, message } = await getMonthAnalytics();
        console.log("Fetched analytics data:", data);
        if (success) {
          toast.success("Analytics data fetched successfully");
          // setCurrentData(data || []);
        } else {
          toast.error(message || "Failed to fetch analytics");
        }
      } catch (error) {
        toast.error("Error fetching analytics data");
        console.error("Analytics fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    // fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-muted-foreground">
              Loading analytics...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background ">
      <div className="w-full mx-auto space-y-8">
        <div className="flex gap-5 items-stretch justify-between">
          {/* Stats Cards */}
          <div className="flex flex-col justify-between gap-5  min-w-[280px]">
            <Card className="flex-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Spent
                </CardTitle>
                DZA
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(totalSpent)}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3" />
                  Last {currentData.length} months
                </div>
              </CardContent>
            </Card>

            <Card className="flex-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Orders
                </CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalOrders}</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <BarChart3 className="h-3 w-3" />
                  Across all months
                </div>
              </CardContent>
            </Card>

            <Card className="flex-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Monthly Average
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(averageMonthly)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Per month spending
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Chart Card */}
          <div className="flex-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">
                  Monthly{" "}
                  {chartType === "totalSpent" ? "Spending" : "Order Count"}{" "}
                  Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div style={{ height: "400px" }}>
                  {currentData.length > 0 ? (
                    <ResponsiveBar
                      data={chartData}
                      keys={[chartType]}
                      indexBy="month"
                      margin={{ top: 20, right: 20, bottom: 30, left: 30 }}
                      padding={0.3}
                      valueScale={{ type: "linear" }}
                      indexScale={{ type: "band", round: true }}
                      colors={["#e46211"]}
                      borderColor={{
                        from: "color",
                        modifiers: [["darker", 1.6]],
                      }}
                      axisTop={null}
                      axisRight={null}
                      axisBottom={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: -45,
                        legend: "Month",
                        legendPosition: "middle",
                        legendOffset: 60,
                      }}
                      axisLeft={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend:
                          chartType === "totalSpent"
                            ? "Amount (DZA)"
                            : "Number of Orders",
                        legendPosition: "middle",
                        legendOffset: -60,
                        format:
                          chartType === "totalSpent"
                            ? (value) => `$${value}`
                            : undefined,
                      }}
                      labelSkipWidth={12}
                      labelSkipHeight={12}
                      labelTextColor={{
                        from: "color",
                        modifiers: [["darker", 1.6]],
                      }}
                      tooltip={({ id, value, indexValue, data }) => (
                        <Card className="p-3 shadow-lg">
                          <div className="font-semibold">{indexValue}</div>
                          <div className="text-sm text-muted-foreground">
                            {chartType === "totalSpent"
                              ? `Spent: ${formatCurrency(value)}`
                              : `Orders: ${value}`}
                          </div>
                          {chartType === "totalSpent" && (
                            <div className="text-sm text-muted-foreground">
                              Orders: {data.orderCount}
                            </div>
                          )}
                          {chartType === "orderCount" && (
                            <div className="text-sm text-muted-foreground">
                              Spent: {formatCurrency(data.totalSpent)}
                            </div>
                          )}
                        </Card>
                      )}
                      animate={true}
                      motionConfig={{
                        mass: 1,
                        tension: 90,
                        friction: 15,
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-muted-foreground">
                        No data available
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Data Table Card */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {currentData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                        Month
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                        Total Spent
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                        Order Count
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                        Average per Order
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentData.map((item) => (
                      <tr
                        key={item.period}
                        className="border-b hover:bg-muted/50"
                      >
                        <td className="px-4 py-3 text-sm font-medium">
                          {item.monthName} {item.year}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {formatCurrency(item.totalSpent)}
                        </td>
                        <td className="px-4 py-3 text-sm">{item.orderCount}</td>
                        <td className="px-4 py-3 text-sm">
                          {item.orderCount > 0
                            ? formatCurrency(item.totalSpent / item.orderCount)
                            : formatCurrency(0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SpendingChartPage;
