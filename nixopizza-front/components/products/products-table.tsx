import React from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AlertTriangle, MoreHorizontal, Edit, Trash2, Package } from "lucide-react";
import { resolveImage } from "@/lib/resolveImage";
import toast from "react-hot-toast";

interface Product {
  _id: string;
  name: string;
  barcode?: string;
  unit: string;
  imageUrl?: string;
  currentStock: number;
  minQty: number;
  recommendedQty: number;
  categoryId?: { _id: string; name: string; image?: string };
}

type BadgeVariant = "default" | "destructive" | "outline" | "secondary";

export function ProductsTable({
  products,
  onEdit,
  onDelete,
}: {
  products: Product[];
  onEdit: (p: Product) => void;
  onDelete: (id: string) => Promise<void>;
}) {
  // Return an object with valid variant + color class + label
  const getStockStatus = (current: number, min: number): {
    variant: BadgeVariant;
    color: string;
    label: string;
  } => {
    if (current <= 0)
      return {
        variant: "destructive",
        color: "",
        label: "out",
      };
    if (current <= min)
      return {
        variant: "secondary",
        color: "bg-amber-500/20 text-amber-700",
        label: "low",
      };
    return {
      variant: "outline",
      color: "",
      label: "ok",
    };
  };

  const handleDelete = async (id: string) => {
    try {
      await onDelete(id);
    } catch (e: any) {
      toast.error(e.message || "Delete failed");
    }
  };

  if (products.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 p-3 bg-muted rounded-full">
            <Package className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-1">No products found</h3>
          <p className="text-muted-foreground mb-4">
            You don't have any products with this filtration.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardContent>
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => {
                const stockStatus = getStockStatus(
                  product.currentStock,
                  product.minQty
                );
                return (
                  <TableRow key={product._id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={resolveImage(product.imageUrl)}
                            alt={product.name}
                            className="w-14 h-14 rounded-lg object-cover"
                          />
                          {product.currentStock <= product.minQty && (
                            <div className="absolute -top-1 -right-1 bg-destructive rounded-full p-1">
                              <AlertTriangle className="h-3 w-3 text-destructive-foreground" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground">
                            BARCODE: {product.barcode || "N/A"}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <img
                          src={resolveImage(product.categoryId?.image)}
                          alt={product.categoryId?.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <span>{product.categoryId?.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{product.currentStock}</span>
                        {product.currentStock <= product.minQty &&
                          product.currentStock > 0 && (
                            <AlertTriangle className="h-4 w-4 text-amber-600" />
                          )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={stockStatus.variant}
                        className={`${stockStatus.color} capitalize`}
                      >
                        {stockStatus.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit(product)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(product._id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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