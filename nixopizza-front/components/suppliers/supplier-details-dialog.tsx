// components/suppliers/supplier-details-dialog.tsx
"use client";

import { resolveImage } from "@/lib/resolveImage";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  User,
  FileText,
  Tag,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { ISupplier } from "@/app/dashboard/suppliers/page";
import { ICategory } from "@/app/dashboard/categories/page";
import { useEffect, useState } from "react";
import { getCategories } from "@/lib/apis/categories";

interface SupplierOrdersDialogProps {
  supplier: ISupplier | null;
  orders: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SupplierDetailsDialog({
  supplier,
  orders,
  open,
  onOpenChange,
}: SupplierOrdersDialogProps) {
  const [categories, setCategories] = useState<ICategory[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { success, categories: fetchedCategories } = await getCategories();
      if (success) {
        setCategories(fetchedCategories);
      }
    };
    fetchCategories();
  }, []);

  if (!supplier) return null;

  // Get category names from IDs
  const supplierCategories = categories.filter((cat) =>
    supplier.categoryIds?.includes(cat._id)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            Supplier Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Supplier Image and Basic Info */}
          <Card>
            <CardContent className="pt-0">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="w-32 h-32 rounded-xl overflow-hidden border-2 border-input shadow-md flex-shrink-0">
                  <img
                      src={resolveImage(supplier.image)}
                      alt={supplier.name}
                      className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="text-2xl font-semibold">{supplier.name}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge
                        variant={supplier.isActive ? "default" : "destructive"}
                        className="text-sm"
                      >
                        {supplier.isActive ? (
                          <>
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardContent className="pt-0">
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User className="h-5 w-5" />
                Contact Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Contact Person</p>
                  <p className="font-medium flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    {supplier.contactPerson}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {supplier.email}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {supplier.phone1}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    {supplier.address}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Categories */}
          {supplierCategories && supplierCategories.length > 0 && (
            <Card>
              <CardContent className="pt-0">
                <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Categories
                </h4>
                <div className="flex flex-wrap gap-2">
                  {supplierCategories.map((category) => (
                    <Badge
                      key={category._id}
                      variant="secondary"
                      className="text-sm px-3 py-1"
                    >
                      {category.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {supplier.notes && (
            <Card>
              <CardContent className="pt-0">
                <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Notes
                </h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {supplier.notes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-full px-6"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}