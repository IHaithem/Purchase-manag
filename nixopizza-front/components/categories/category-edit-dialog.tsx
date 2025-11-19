import React, { useEffect, useState } from "react";
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

interface CategoryEditDialogProps {
  category: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setCategory: any;
}

const resolveCategoryImage = (image?: string) => {
  if (!image) return "";
  return image.startsWith("http") ? image : process.env.NEXT_PUBLIC_BASE_URL + image;
};

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
    if (!category) return;

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
          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Category Image</Label>
            <div className="flex items-center gap-4">
              {photoPreview || (category && category.image) ? (
                <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={
                      photoPreview
                        ? photoPreview
                        : resolveCategoryImage(category?.image)
                    }
                    alt="Category preview"
                    className="object-cover w-full h-full"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1"
                    onClick={removePhoto}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <div>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Name */}
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Category name"
                required
              />
            </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Description</Label>
            <Input
              value={formData.description}
              onChange={(e) =>
                handleInputChange("description", e.target.value)
              }
              placeholder="Description"
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}