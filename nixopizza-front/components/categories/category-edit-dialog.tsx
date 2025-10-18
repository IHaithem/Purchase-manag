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
import { Switch } from "../ui/switch";
import { updateCategory } from "@/lib/apis/categories";
import toast from "react-hot-toast";
import { Upload, X } from "lucide-react";

interface Category {
  id: string;
  name: string;
  description: string;
  type: "product" | "service" | "expense";
  status: "Active" | "Inactive";
  productsCount: number;
  lastUpdated: string;
  image?: string;
}

interface CategoryEditDialogProps {
  category: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setCategory: any;
}

export function CategoryEditDialog({
  category,
  open,
  onOpenChange,
  setCategory,
}: CategoryEditDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "product",
    status: "Active",
    notes: "",
  });

  const [isBudgetAllocated, setIsBudgetAllocated] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description,
        type: category.type,
        status: category.status,
        notes: "",
      });
      setPhoto(null);
      setPhotoPreview(null);
    }
  }, [category]);

  const handleBudgetToggle = (checked: boolean) => {
    setIsBudgetAllocated(checked);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("description", formData.description);
    if (photo) {
      formDataToSend.append("image", photo);
    }

    const {
      success,
      message,
      category: updatedCategory,
    } = await updateCategory(category._id, formDataToSend);

    if (success) {
      toast.success("Category updated successfully");
      setCategory(updatedCategory);
      onOpenChange(false);
      setPhoto(null);
      setPhotoPreview(null);
    } else {
      toast.error(message);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.match("image.*")) {
        toast.error("Please select an image file");
        return;
      }

      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const removePhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl">
            {category ? "Edit Category" : "Add New Category"}
          </DialogTitle>
          <DialogDescription>
            {category
              ? "Update category name, description, type, and image."
              : "Add a new product or expense category."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload Section */}
          <div className="space-y-2">
            <Label>Category Image</Label>
            <div className="flex items-center gap-4">
              {photoPreview || category?.image ? (
                <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={
                      photoPreview ||
                      process.env.NEXT_PUBLIC_BASE_URL + category.image
                    }
                    alt="Category preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 hover:opacity-80"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg">
                  <Upload className="h-8 w-8 text-gray-400" />
                </div>
              )}

              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="image-upload"
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md cursor-pointer hover:opacity-90 transition-opacity"
                >
                  <Upload className="h-4 w-4" />
                  {photoPreview || category?.image
                    ? "Change Image"
                    : "Upload Image"}
                </Label>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG up to 5MB
                </p>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Category Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter category name"
              required
              className="py-5"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Enter category description"
              rows={3}
              className="resize-y"
              required
            />
          </div>

          {/* Budget toggle */}
          {/* <div className="flex items-center justify-between pt-2">
            <div className="space-y-1">
              <Label
                htmlFor="budget-toggle"
                className="text-base font-semibold"
              >
                Allocate a Budget
              </Label>
              <p className="text-sm text-muted-foreground">
                Set spending limits for this category
              </p>
            </div>
            <Switch
              id="budget-toggle"
              checked={isBudgetAllocated}
              onCheckedChange={handleBudgetToggle}
            />
          </div> */}

          {/* Budget fields */}
          {/* {isBudgetAllocated && (
            <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-border">
              <h3 className="font-medium text-lg">Budget Details</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="period">Period</Label>
                  <Select>
                    <SelectTrigger id="period" className="py-5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Target Amount (DZA)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    className="py-5"
                  />
                </div>
              </div>
            </div>
          )} */}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {category ? "Update Category" : "Add Category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
