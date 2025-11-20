// components/suppliers/supplier-edit-dialog.tsx
"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getCategories } from "@/lib/apis/categories";
import { ICategory } from "@/app/dashboard/categories/page";
import { CategorySelect } from "../ui/category-select";
import { updateSupplier } from "@/lib/apis/suppliers";
import toast from "react-hot-toast";
import { ISupplier } from "@/app/dashboard/suppliers/page";
import { resolveImage } from "@/lib/resolveImage";

interface SupplierEditDialogProps {
  supplier: ISupplier | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  handleUpdateSupplier: (supplier: ISupplier) => void;
}

export function SupplierEditDialog({
  supplier,
  open,
  onOpenChange,
  handleUpdateSupplier,
}: SupplierEditDialogProps) {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<ICategory[]>([]);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    contactPerson: "",
    email: "",
    phone1: "",
    phone2: "",
    phone3: "",
    address: "",
    city: "",
    isActive: true,
    notes: "",
    categoryIds: [] as string[],
  });

  useEffect(() => {
    const fetchCategories = async () => {
      const { success, categories, message } = await getCategories();
      if (success) {
        setCategories(categories);
      } else {
        console.log("Failed to Load Categories:", message);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (supplier) {
      setFormData({
        name: supplier.name,
        contactPerson: supplier.contactPerson,
        email: supplier.email,
        phone1: supplier.phone1,
        phone2: supplier.phone2 || "",
        phone3: supplier.phone3 || "",
        address: supplier.address,
        city: supplier.city || "",
        isActive: supplier.isActive,
        notes: supplier.notes || "",
        categoryIds: supplier.categoryIds,
      });

      const supplierCategories = categories.filter((cat) =>
        supplier.categoryIds.includes(cat._id)
      );
      setSelectedCategories(supplierCategories);

      if (supplier.image) {
        setImagePreview(resolveImage(supplier.image));
      }
    } else {
      setFormData({
        name: "",
        contactPerson: "",
        email: "",
        phone1: "",
        phone2: "",
        phone3: "",
        address: "",
        city: "",
        isActive: true,
        notes: "",
        categoryIds: [],
      });
      setSelectedCategories([]);
      setImage(null);
      setImagePreview(null);
    }
  }, [supplier, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!supplier) return;

    const supplierData = new FormData();
    supplierData.append("name", formData.name);
    supplierData.append("contactPerson", formData.contactPerson);
    supplierData.append("email", formData.email);
    supplierData.append("phone1", formData.phone1);
    if (formData.phone2) supplierData.append("phone2", formData.phone2);
    if (formData.phone3) supplierData.append("phone3", formData.phone3);
    supplierData.append("address", formData.address);
    if (formData.city) supplierData.append("city", formData.city);
    supplierData.append("isActive", formData.isActive.toString());
    supplierData.append("notes", formData.notes);

    formData.categoryIds.forEach((id) => {
      supplierData.append("categoryIds", id);
    });

    if (image) {
      supplierData.append("image", image);
    }

    const { success, message, supplier: updatedSupplier } = await updateSupplier(
      supplier._id,
      supplierData
    );
    if (success) {
      handleUpdateSupplier(updatedSupplier);
      toast.success("Supplier Updated Successfully");
      setImage(null);
      setImagePreview(resolveImage(updatedSupplier.image));
      onOpenChange(false);
    } else {
      toast.error(message);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleStatusChange = (value: string) => {
    handleInputChange("isActive", value === "Active");
  };

  const handleAddCategory = (category: ICategory | null) => {
    if (category && !formData.categoryIds.includes(category._id)) {
      setFormData((prev) => ({
        ...prev,
        categoryIds: [...prev.categoryIds, category._id],
      }));
      setSelectedCategories((prev) => [...prev, category]);
    }
  };

  const handleRemoveCategory = (index: number) => {
    const updatedCategoryIds = formData.categoryIds.filter((_, i) => i !== index);
    const updatedSelectedCategories = selectedCategories.filter((_, i) => i !== index);

    setFormData((prev) => ({
      ...prev,
      categoryIds: updatedCategoryIds,
    }));
    setSelectedCategories(updatedSelectedCategories);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.match("image.*")) {
        toast.error("Please select an image file");
        return;
      }
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const availableCategories = categories.filter(
    (cat) => !formData.categoryIds.includes(cat._id)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl">
            {supplier ? "Edit Supplier" : "Add Supplier"}
          </DialogTitle>
          <DialogDescription>
            {supplier
              ? "Update supplier information and contact details."
              : "Create a new supplier."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Company Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Contact Person</Label>
              <Input
                value={formData.contactPerson}
                onChange={(e) =>
                  handleInputChange("contactPerson", e.target.value)
                }
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Phone 1</Label>
              <Input
                value={formData.phone1}
                onChange={(e) => handleInputChange("phone1", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Phone 2 (Optional)</Label>
              <Input
                value={formData.phone2}
                onChange={(e) => handleInputChange("phone2", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Phone 3 (Optional)</Label>
              <Input
                value={formData.phone3}
                onChange={(e) => handleInputChange("phone3", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Address</Label>
              <Input
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>City (Optional)</Label>
              <Input
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
              />
            </div>
          </div>

          {/* Image */}
          <div className="space-y-2">
            <Label>Supplier Image</Label>
            <div className="flex items-center gap-4">
              {imagePreview ? (
                <div className="relative w-24 h-24 rounded-xl overflow-hidden border">
                  <img
                    src={imagePreview}
                    alt="Supplier preview"
                    className="object-cover w-full h-full"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center w-24 h-24 border-2 border-dashed rounded-xl bg-muted/20">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                </div>
              )}

              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="image-upload"
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md cursor-pointer hover:opacity-90"
                >
                  <Upload className="h-4 w-4" />
                  {imagePreview ? "Change Image" : "Upload Image"}
                </Label>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG up to 5MB
                </p>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <Label>Categories</Label>
            <CategorySelect
              categories={availableCategories}
              selectedCategory={null}
              onSelect={(category: any) => handleAddCategory(category as ICategory | null)}
              placeholder="Select categories"
              className="border rounded-lg"
              isLoading={false}
            />
            {selectedCategories.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedCategories.map((category, index) => (
                  <Badge key={category._id} variant="outline" className="flex items-center gap-1">
                    {category.name}
                    <button
                      type="button"
                      onClick={() => handleRemoveCategory(index)}
                      className="hover:bg-muted rounded-sm p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={formData.isActive ? "Active" : "Inactive"}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes (Optional)</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              rows={3}
              placeholder="Additional notes..."
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {supplier ? "Update Supplier" : "Add Supplier"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}