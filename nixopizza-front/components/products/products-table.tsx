// components/ui/products-table.tsx
"use client";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  AlertTriangle,
  Plus,
  Package,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { deleteProduct } from "@/lib/apis/products";
import toast from "react-hot-toast";
import { IProduct } from "@/app/dashboard/products/page";

// Add this import at the top
import { Pagination } from "@/components/ui/pagination";

export function ProductsTable({
  products,
  setProducts,
  totalPages,
  currentPage,
  setCurrentPage,
  limit,
  setLimit,
}: {
  products: IProduct[];
  setProducts: any;
  totalPages: number;
  currentPage: number;
  setCurrentPage: any;
  limit: number;
  setLimit: any;
}) {
  const router = useRouter();

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock === 0)
      return {
        label: "Out of Stock",
        variant: "outline" as const,
        color: "text-destructive border-destructive",
      };
    if (stock <= minStock)
      return {
        label: "Low Stock",
        variant: "outline" as const,
        color: "text-amber-600 border-amber-600",
      };
    return {
      label: "In Stock",
      variant: "outline" as const,
      color: "text-green-600 border-green-600",
    };
  };

  const handleEdit = (product: (typeof products)[0]) => {
    router.push(`/dashboard/products/edit/${product._id}`);
  };

  const handleDelete = async (productId: string) => {
    const { success, message } = await deleteProduct(productId);
    if (success) {
      toast.success("Product Deleted Successfully");
      setProducts(products.filter((pro) => pro._id !== productId));
    } else {
      toast.error(message);
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
                <TableHead className="rounded-tl-lg">Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="rounded-tr-lg text-right">
                  Actions
                </TableHead>
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
                            src={
                              process.env.NEXT_PUBLIC_BASE_URL +
                              product.imageUrl
                            }
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
                          src={
                            process.env.NEXT_PUBLIC_BASE_URL +
                            product.categoryId?.image
                          }
                          alt={product.categoryId?.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <span>{product.categoryId?.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {product.currentStock}
                        </span>
                        {product.currentStock <= product.minQty &&
                          product.currentStock > 0 && (
                            <AlertTriangle className="h-4 w-4 text-amber-600" />
                          )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">${100}</div>
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
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 p-0"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(product)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(product._id)}
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

        {/* Add Pagination component here */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            Showing {products.length} of {totalPages * limit} products
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            limit={limit}
            onLimitChange={setLimit}
          />
        </div>
      </CardContent>
    </Card>
  );
}
