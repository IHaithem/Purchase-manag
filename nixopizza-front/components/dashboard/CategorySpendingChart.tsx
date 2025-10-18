"use client";

import React, { useState } from "react";
import { ResponsivePie } from "@nivo/pie";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, DollarSign, ShoppingCart, TrendingUp } from "lucide-react";

const CategorySpendingChart = () => {
  // Your actual data
  const sampleData = {
    success: true,
    period: "week",
    dateRange: {
      startDate: "2025-09-20T14:11:22.344Z",
      endDate: "2025-09-27T14:11:22.344Z",
    },
    data: [
      {
        categoryName: "Cheese & Dairy",
        totalSpent: 125000, // mozzarella, parmesan, cream
        orderCount: 10,
        categoryId: "cat1",
      },
      {
        categoryName: "Meats & Proteins",
        totalSpent: 98000, // pepperoni, chicken, ham
        orderCount: 7,
        categoryId: "cat2",
      },
      {
        categoryName: "Vegetables",
        totalSpent: 72000, // onions, bell peppers, mushrooms
        orderCount: 9,
        categoryId: "cat3",
      },
      {
        categoryName: "Flour & Baking",
        totalSpent: 54000, // flour, yeast, olive oil
        orderCount: 6,
        categoryId: "cat4",
      },
      {
        categoryName: "Sauces & Spices",
        totalSpent: 43000, // tomato sauce, oregano, chili flakes
        orderCount: 5,
        categoryId: "cat5",
      },
      {
        categoryName: "Packaging & Boxes",
        totalSpent: 29000, // pizza boxes, napkins, cups
        orderCount: 4,
        categoryId: "cat6",
      },
      {
        categoryName: "Cleaning Supplies",
        totalSpent: 18000, // detergents, sanitizers, gloves
        orderCount: 3,
        categoryId: "cat7",
      },
      {
        categoryName: "Beverages",
        totalSpent: 36000, // soft drinks, bottled water
        orderCount: 5,
        categoryId: "cat8",
      },
    ],
  };

  const [useSampleData, setUseSampleData] = useState(false);
  const [chartMetric, setChartMetric] = useState("totalSpent");

  const currentData = sampleData;

  // Transform data for Nivo pie chart
  const pieData = currentData.data.map((item, index) => ({
    id: item.categoryName.trim(),
    label: item.categoryName.trim(),
    value: chartMetric === "totalSpent" ? item.totalSpent : item.orderCount,
    categoryId: item.categoryId,
    totalSpent: item.totalSpent,
    orderCount: item.orderCount,
  }));

  const formatCurrency = (value: any) => {
    return new Intl.NumberFormat("fr-DZ", {
      style: "currency",
      currency: "DZA",
    }).format(value / 100); // Assuming values are in cents
  };

  const totalSpent = currentData.data.reduce(
    (sum, item) => sum + item.totalSpent,
    0
  );
  const totalOrders = currentData.data.reduce(
    (sum, item) => sum + item.orderCount,
    0
  );
  const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

  // Custom colors including your orange
  const customColors = [
    "#e46211",
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#06b6d4",
  ];

  const formatDate = (dateString: any) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full mx-auto space-y-8">
        {/* Chart and Details Row */}
        <div className="grid gap-5 lg:grid-cols-2">
          {/* Pie Chart Card */}
          <Card className="flex-1">
            <CardHeader>
              <CardTitle className="text-xl">
                Category{" "}
                {chartMetric === "totalSpent" ? "Spending" : "Order Count"}{" "}
                Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ height: "500px" }}>
                <ResponsivePie
                  data={pieData}
                  margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
                  innerRadius={0.5}
                  padAngle={0.7}
                  cornerRadius={3}
                  activeOuterRadiusOffset={8}
                  colors={customColors}
                  borderWidth={1}
                  borderColor={{
                    from: "color",
                    modifiers: [["darker", 0.2]],
                  }}
                  arcLinkLabelsSkipAngle={10}
                  arcLinkLabelsTextColor="hsl(var(--foreground))"
                  arcLinkLabelsThickness={2}
                  arcLinkLabelsColor={{ from: "color" }}
                  arcLabelsSkipAngle={10}
                  arcLabelsTextColor={{
                    from: "color",
                    modifiers: [["darker", 2]],
                  }}
                  tooltip={({ datum }) => (
                    <Card className="p-3 shadow-lg">
                      <div className="font-semibold">{datum.label}</div>
                      <div className="text-sm text-muted-foreground">
                        {chartMetric === "totalSpent"
                          ? `Spent: ${formatCurrency(datum.data.totalSpent)}`
                          : `Orders: ${datum.data.orderCount}`}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {chartMetric === "totalSpent"
                          ? `Orders: ${datum.data.orderCount}`
                          : `Spent: ${formatCurrency(datum.data.totalSpent)}`}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Share:{" "}
                        {(
                          (datum.value /
                            pieData.reduce((sum, d) => sum + d.value, 0)) *
                          100
                        ).toFixed(1)}
                        %
                      </div>
                    </Card>
                  )}
                  legends={[
                    {
                      anchor: "bottom",
                      direction: "row",
                      justify: false,
                      translateX: 0,
                      translateY: 56,
                      itemsSpacing: 0,
                      itemWidth: 100,
                      itemHeight: 18,
                      itemTextColor: "hsl(var(--foreground))",
                      itemDirection: "left-to-right",
                      itemOpacity: 1,
                      symbolSize: 18,
                      symbolShape: "circle",
                      effects: [
                        {
                          on: "hover",
                          style: {
                            itemTextColor: "hsl(var(--foreground))",
                          },
                        },
                      ],
                    },
                  ]}
                />
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="flex flex-col gap-5 min-w-[280px]">
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
                  This {currentData.period}
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
                  <PieChart className="h-3 w-3" />
                  Across {currentData.data.length} categories
                </div>
              </CardContent>
            </Card>

            <Card className="flex-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg Order Value
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(averageOrderValue)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Per order average
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Summary Table Card */}
        <Card>
          <CardHeader>
            <CardTitle>Detailed Category Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Category
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Total Spent
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Orders
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      Avg per Order
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      % of Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.data
                    .sort((a, b) => b.totalSpent - a.totalSpent)
                    .map((item, index) => {
                      const percentage = (
                        (item.totalSpent / totalSpent) *
                        100
                      ).toFixed(1);
                      const avgPerOrder =
                        item.orderCount > 0
                          ? item.totalSpent / item.orderCount
                          : 0;
                      return (
                        <tr
                          key={item.categoryId}
                          className="border-b hover:bg-muted/50"
                        >
                          <td className="px-4 py-3 text-sm font-medium">
                            <div className="flex items-center space-x-3">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{
                                  backgroundColor:
                                    customColors[index % customColors.length],
                                }}
                              ></div>
                              {item.categoryName.trim()}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {formatCurrency(item.totalSpent)}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {item.orderCount}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {formatCurrency(avgPerOrder)}
                          </td>
                          <td className="px-4 py-3 text-sm">{percentage}%</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CategorySpendingChart;
