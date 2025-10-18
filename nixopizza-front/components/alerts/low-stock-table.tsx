"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import {
  Package,
  AlertTriangle,
  ShoppingCart,
  TrendingDown,
} from "lucide-react";
import { IProduct } from "@/app/dashboard/products/page";
import Link from "next/link";

export function LowStockTable({
  lowStockItems,
}: {
  lowStockItems: IProduct[];
}) {
  const getPriorityBadge = (product: IProduct) => {
    if (product.currentStock === 0) {
      return <Badge variant="destructive">Critical</Badge>;
    } else if (product.currentStock < product.minQty / 2) {
      return (
        <Badge
          variant="secondary"
          className="bg-orange-500/20 text-orange-700 hover:bg-orange-500/30"
        >
          High
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="border-amber-500 text-amber-700">
          Medium
        </Badge>
      );
    }
  };

  const getStockPercentage = (current: number, max: number) => {
    return Math.max(0, Math.min(100, (current / (max || 1)) * 100));
  };

  const getPriorityText = (stock: number, min: number) => {
    if (stock <= 0) return "Critical";
    if (stock < min / 2) return "High";
    return "Medium";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading">
          Items Requiring Attention
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Stock Level</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lowStockItems.map((item) => {
                const stockPercentage = getStockPercentage(
                  item.currentStock,
                  item.maxQty
                );
                return (
                  <TableRow key={item._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted rounded-lg">
                          <img
                            src={
                              process.env.NEXT_PUBLIC_BASE_URL + item.imageUrl
                            }
                            alt={item.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {item.barcode}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {item.currentStock}
                          </span>
                          {item.currentStock > 0 ? (
                            <TrendingDown className="h-3 w-3 text-secondary" />
                          ) : (
                            <AlertTriangle className="h-3 w-3 text-destructive" />
                          )}
                        </div>
                        <Progress value={stockPercentage} className="h-2" />
                        <div className="text-xs text-muted-foreground">
                          Min: {item.minQty}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getPriorityBadge(item)}</TableCell>
                    <TableCell>
                      {/* Redirect to purchases page */}
                      <Button size="sm" asChild className="gap-2">
                        <Link href="/dashboard/purchases">
                          <ShoppingCart className="h-3 w-3" />
                          Create Order
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
