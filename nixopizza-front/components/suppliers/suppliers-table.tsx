// components/suppliers/suppliers-table.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import * as React from "react";
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
  Building2,
  Phone,
  Mail,
  MapPin,
  Eye,
  Package,
} from "lucide-react";
import { SupplierEditDialog } from "./supplier-edit-dialog";
import { SupplierOrdersDialog } from "./supplier-orders-dialog";
import { deleteSupplier, get_all_suppliers } from "@/lib/apis/suppliers";
import toast from "react-hot-toast";
import { ISupplier } from "@/app/dashboard/suppliers/page";
import { Pagination } from "@/components/ui/pagination";

export function SuppliersTable({
  suppliers,
  setSuppliers,
  totalPages,
  currentPage,
  setCurrentPage,
  limit,
  setLimit,
}: {
  suppliers: ISupplier[];
  setSuppliers: React.Dispatch<React.SetStateAction<ISupplier[]>>;
  totalPages: number;
  currentPage: number;
  setCurrentPage: any;
  limit: number;
  setLimit: any;
}) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<
    (typeof suppliers)[0] | null
  >(null);
  const [selectedSupplierOrder, setSelectedSupplierOrder] = useState<any>(null);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);

  const handleEdit = (supplier: any) => {
    setIsEditDialogOpen(true);
    setSelectedSupplier(supplier);
  };

  const handleDelete = async (supplierId: string) => {
    const { success, message } = await deleteSupplier(supplierId);

    if (success) {
      toast.success("Supplier Deleted Successfully");
      setSuppliers(suppliers.filter((sup) => sup._id !== supplierId));
    } else {
      toast.error(message);
    }
  };

  const handleUpdateSupplier = (updatedSupplier: any) => {
    console.log("updatedSupplier : ", updatedSupplier);
    setSuppliers((prevSuppliers: any[]) =>
      prevSuppliers.map((sup) =>
        sup._id === updatedSupplier._id ? updatedSupplier : sup
      )
    );
  };

  const handleViewSupplier = (supplier: any) => {
    setSelectedSupplierOrder(supplier);
    setIsOrderDialogOpen(true);
  };

  if (suppliers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Supplier Directory</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 p-3 bg-muted rounded-full">
            <Package className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-1">No suppliers found</h3>
          <p className="text-muted-foreground mb-4">
            You don't have any suppliers yet. Start by adding your first
            supplier.
          </p>
          <Button>
            <Building2 className="h-4 w-4 mr-2" />
            Add Supplier
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Supplier Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Contact Person</TableHead>
                  <TableHead>email</TableHead>
                  <TableHead>phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers.map((supplier) => (
                  <TableRow key={supplier._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted rounded-lg">
                          <img
                            src={
                              process.env.NEXT_PUBLIC_BASE_URL + supplier.image
                            }
                            alt={supplier.name}
                            className="w-12 h-12 rounded-full"
                          />
                        </div>
                        <div>
                          <div className="font-medium">{supplier.name}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {supplier.address}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{supplier.contactPerson}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="h-3 w-3" />
                          {supplier.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="h-3 w-3" />
                        {supplier.phone}
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={supplier.isActive ? "default" : "destructive"}
                      >
                        {supplier.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleViewSupplier(supplier)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEdit(supplier)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              Showing {suppliers.length} of {totalPages * limit} suppliers
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
      <SupplierOrdersDialog
        supplier={selectedSupplierOrder}
        orders={selectedSupplierOrder}
        open={isOrderDialogOpen}
        onOpenChange={setIsOrderDialogOpen}
      />
      <SupplierEditDialog
        supplier={selectedSupplier}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        handleUpdateSupplier={handleUpdateSupplier}
      />
    </>
  );
}
