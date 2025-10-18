// components/ui/add-supplier-dialog.tsx
"use client";

import * as React from "react";
import { useState } from "react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getCategories } from "@/lib/apis/categories";
import { create_supplier } from "@/lib/apis/suppliers";
import toast from "react-hot-toast";
import { CategorySelect } from "../ui/category-select";
import { ICategory } from "@/app/dashboard/categories/page";

export function AddSupplierDialog({
  onAdding,
}: {
  onAdding: (supplier: any) => void;
}) {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Fetch categories on component mount
  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { success, categories, message } = await getCategories();
        if (success) {
          setCategories(categories);
        } else {
          console.log("Failed to Load Categories:", message);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    categoryIds: [] as string[],
    isActive: true,
    notes: "",
  });

  const handleSubmit = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    setIsSubmitting(true);

    try {
      // Prepare data for API call
      const supplierData = new FormData();
      supplierData.append("name", formData.name);
      supplierData.append("contactPerson", formData.contactPerson);
      supplierData.append("email", formData.email);
      supplierData.append("phone", formData.phone);
      supplierData.append("address", formData.address);
      supplierData.append("isActive", formData.isActive.toString());
      supplierData.append("notes", formData.notes);

      // Add categories
      formData.categoryIds.forEach((id) => {
        supplierData.append("categoryIds", id);
      });

      // Add image if provided
      if (image) {
        supplierData.append("image", image);
      }

      const { supplier } = await create_supplier(supplierData);
      onAdding(supplier);
      toast.success("Supplier Created Successfully");

      // Reset form
      resetForm();
      setOpen(false);
    } catch (error) {
      console.error("Error creating supplier:", error);
      toast.error("Failed to Add Supplier");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddCategory = (category: ICategory | null) => {
    if (category && !formData.categoryIds.includes(category._id)) {
      setFormData((prev) => ({
        ...prev,
        categoryIds: [...prev.categoryIds, category._id],
      }));
    }
  };

  const handleRemoveCategory = (index: number) => {
    const updatedCategories = formData.categoryIds.filter(
      (_, i) => i !== index
    );
    setFormData((prev) => ({
      ...prev,
      categoryIds: updatedCategories,
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
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

  const resetForm = () => {
    setFormData({
      name: "",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
      categoryIds: [],
      isActive: true,
      notes: "",
    });
    setImage(null);
    setImagePreview(null);
  };

  const handleDialogChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      resetForm();
    }
  };

  // Filter out already selected categories
  const availableCategories = categories.filter(
    (cat) => !formData.categoryIds.includes(cat._id)
  );

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Supplier
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl">
            Add New Supplier
          </DialogTitle>
          <DialogDescription>
            Add a new supplier to your directory with contact information and
            categories.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="space-y-6"
        >
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Company Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter company name"
                required
                className="py-5 border-2 border-input focus-visible:ring-2 focus-visible:ring-primary/30 rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPerson" className="text-sm font-medium">
                Contact Person *
              </Label>
              <Input
                id="contactPerson"
                value={formData.contactPerson}
                onChange={(e) =>
                  handleInputChange("contactPerson", e.target.value)
                }
                placeholder="Enter contact person name"
                required
                className="py-5 border-2 border-input focus-visible:ring-2 focus-visible:ring-primary/30 rounded-lg"
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="Enter email address"
                required
                className="py-5 border-2 border-input focus-visible:ring-2 focus-visible:ring-primary/30 rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">
                Phone *
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="Enter phone number"
                required
                className="py-5 border-2 border-input focus-visible:ring-2 focus-visible:ring-primary/30 rounded-lg"
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address" className="text-sm font-medium">
              Address *
            </Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              placeholder="Enter full address"
              required
              className="py-5 border-2 border-input focus-visible:ring-2 focus-visible:ring-primary/30 rounded-lg"
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="image" className="text-sm font-medium">
              Supplier Image
            </Label>
            <div className="flex items-center gap-4">
              {imagePreview ? (
                <div className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-input shadow-sm">
                  <img
                    src={imagePreview}
                    alt="Supplier preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 hover:opacity-80 shadow-sm"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center w-24 h-24 border-2 border-dashed border-input rounded-xl bg-muted/20">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                </div>
              )}

              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="image-upload"
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md cursor-pointer hover:opacity-90 transition-opacity"
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
            <Label htmlFor="category" className="text-sm font-medium">
              Categories
            </Label>
            <CategorySelect
              categories={availableCategories}
              selectedCategory={null}
              onCategoryChange={handleAddCategory}
              placeholder="Select categories"
              className="border-2 border-input focus:ring-2 focus:ring-primary/30 rounded-lg"
            />

            {formData.categoryIds.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.categoryIds.map((categoryId, index) => {
                  const category = categories.find((c) => c._id === categoryId);
                  return (
                    <Badge
                      className="py-1 pl-2 pr-1 relative rounded-md"
                      variant="outline"
                      key={index}
                    >
                      {category?.name || categoryId}
                      <button
                        type="button"
                        className="ml-1 hover:bg-muted rounded-sm p-0.5"
                        onClick={() => handleRemoveCategory(index)}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm font-medium">
              Status
            </Label>
            <Select
              value={formData.isActive ? "Active" : "Inactive"}
              onValueChange={(value) =>
                handleInputChange("isActive", value === "Active")
              }
            >
              <SelectTrigger className="py-5 border-2 border-input focus:ring-2 focus:ring-primary/30 rounded-lg">
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
            <Label htmlFor="notes" className="text-sm font-medium">
              Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Enter any additional notes"
              rows={3}
              className="resize-y border-2 border-input focus-visible:ring-2 focus-visible:ring-primary/30 rounded-lg"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
              className="rounded-full px-4"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full px-6"
            >
              {isSubmitting ? "Adding..." : "Add Supplier"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
