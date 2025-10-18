"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import type { ApexOptions } from "apexcharts"

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false })

interface ApexChartProps {
  options: ApexOptions
  series: any[]
  type:
    | "line"
    | "area"
    | "bar"
    | "column"
    | "pie"
    | "donut"
    | "radialBar"
    | "scatter"
    | "bubble"
    | "heatmap"
    | "candlestick"
    | "boxPlot"
    | "radar"
    | "polarArea"
    | "rangeBar"
    | "rangeArea"
    | "treemap"
  height?: number | string
  width?: number | string
  className?: string
}

export function ApexChart({ options, series, type, height = 350, width = "100%", className }: ApexChartProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const chartOptions: ApexOptions = {
    ...options,
    theme: {
      mode: theme === "dark" ? "dark" : "light",
    },
    chart: {
      ...options.chart,
      background: "transparent",
      foreColor: theme === "dark" ? "#e2e8f0" : "#475569",
    },
    grid: {
      ...options.grid,
      borderColor: theme === "dark" ? "#334155" : "#e2e8f0",
    },
    xaxis: {
      ...options.xaxis,
      axisBorder: {
        color: theme === "dark" ? "#334155" : "#e2e8f0",
      },
      axisTicks: {
        color: theme === "dark" ? "#334155" : "#e2e8f0",
      },
    },
    yaxis: {
      ...options.yaxis,
      axisBorder: {
        color: theme === "dark" ? "#334155" : "#e2e8f0",
      },
    },
  }

  if (!mounted) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height }}>
        Loading chart...
      </div>
    )
  }

  return (
    <div className={className}>
      <Chart options={chartOptions} series={series} type={type} height={height} width={width} />
    </div>
  )
}
