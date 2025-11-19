"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { updateCategory } from "@/lib/apis/categories";
import { Upload } from "lucide-react";

interface CategoryEditDialogProps {
  category: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setCategory: any;
}

const resolveCategoryImage = (image?: string) =>
  !image ? "" : image.startsWith("http") ? image : process.env.NEXT_PUBLIC_BASE_URL + image;

export function CategoryEditDialog({
  category,
  open,
  onOpenChange,
  setCategory,
}: CategoryEditDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description,
      });
      setPhoto(null);
      setPhotoPreview(null);
    }
  }, [category]);

  const triggerFileInput = () => fileInputRef.current?.click();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) return;

    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("description", formData.description);
    if (photo) formDataToSend.append("image", photo);

    const { success, message, category: updatedCategory } = await updateCategory(
      category._id,
      formDataToSend
    );

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

  const handleInputChange = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
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
              ? "Update category name, description, and image."
              : "Add a new product or expense category."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload Section (old UI: button on the right with text underneath) */}
          <div className="space-y-2">
            <Label>Category Image</Label>
            <div className="flex items-start gap-6">
              {/* Left: preview box */}
              {photoPreview || (category && category.image) ? (
                <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={photoPreview ? photoPreview : resolveCategoryImage(category?.image)}
                    alt="Category preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg">
                  <Upload className="h-8 w-8 text-gray-400" />
                </div>
              )}

              {/* Right: upload/change button + helper text (old UI) */}
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="image-upload"
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md cursor-pointer hover:opacity-90 transition-opacity"
                >
                  <Upload className="h-4 w-4" />
                  {photoPreview || category?.image ? "Change Image" : "Upload Image"}
                </Label>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG up to 5MB
                </p>
                <input
                  id="image-upload"
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Category name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Input
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Description"
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}