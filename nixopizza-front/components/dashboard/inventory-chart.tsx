"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ApexChart } from "@/components/ui/apex-chart"
import type { ApexOptions } from "apexcharts"

const data = [
  { month: "Jan", inStock: 1200, lowStock: 45, outOfStock: 12 },
  { month: "Feb", inStock: 1180, lowStock: 52, outOfStock: 8 },
  { month: "Mar", inStock: 1220, lowStock: 38, outOfStock: 15 },
  { month: "Apr", inStock: 1190, lowStock: 48, outOfStock: 10 },
  { month: "May", inStock: 1250, lowStock: 35, outOfStock: 6 },
  { month: "Jun", inStock: 1234, lowStock: 42, outOfStock: 8 },
]

export function InventoryChart() {
  const series = [
    {
      name: "In Stock",
      data: data.map((item) => item.inStock),
      color: "hsl(var(--chart-1))",
    },
    {
      name: "Low Stock",
      data: data.map((item) => item.lowStock),
      color: "hsl(var(--chart-2))",
    },
    {
      name: "Out of Stock",
      data: data.map((item) => item.outOfStock),
      color: "hsl(var(--destructive))",
    },
  ]

  const options: ApexOptions = {
    chart: {
      type: "line",
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 3,
    },
    legend: {
      position: "top",
      horizontalAlign: "left",
    },
    xaxis: {
      categories: data.map((item) => item.month),
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          colors: "hsl(var(--muted-foreground))",
        },
      },
    },
    grid: {
      show: true,
      strokeDashArray: 3,
      padding: {
        left: 0,
        right: 0,
        top: 0,
      },
    },
    markers: {
      size: 4,
      strokeWidth: 2,
      hover: {
        size: 6,
      },
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (val: number) => val.toLocaleString() + " items",
      },
    },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading">Inventory Trends</CardTitle>
        <CardDescription>Stock levels over the past 6 months</CardDescription>
      </CardHeader>
      <CardContent>
        <ApexChart options={options} series={series} type="line" height={300} className="w-full" />
      </CardContent>
    </Card>
  )
}
