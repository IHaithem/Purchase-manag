"use client";

import React, { useState, useRef } from "react";
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
import { Plus, Upload, X } from "lucide-react";
import { createProduct } from "@/lib/apis/products";
import toast from "react-hot-toast";

export function AddProductDialog({ onAdded }: { onAdded?: (p: any) => void }) {
  const [open, setOpen] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    barcode: "",
    unit: "",
    categoryId: "",
    currentStock: 0,
    minQty: 0,
    recommendedQty: 0,
    description: "",
  });

  const handleInputChange = (field: string, value: string | number) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
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
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const resetForm = () => {
    setFormData({
      name: "",
      barcode: "",
      unit: "",
      categoryId: "",
      currentStock: 0,
      minQty: 0,
      recommendedQty: 0,
      description: "",
    });
    setImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const fd = new FormData();
    fd.append("name", formData.name);
    fd.append("unit", formData.unit);
    fd.append("categoryId", formData.categoryId);
    fd.append("currentStock", formData.currentStock.toString());
    fd.append("minQty", formData.minQty.toString());
    fd.append("recommendedQty", formData.recommendedQty.toString());
    if (formData.barcode) fd.append("barcode", formData.barcode);
    if (formData.description) fd.append("description", formData.description);
    if (image) fd.append("image", image);

    const { success, product, message } = await createProduct(fd);
    if (success) {
      toast.success("Product created");
      onAdded?.(product);
      setOpen(false);
      resetForm();
    } else {
      toast.error(message);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">Add New Product</DialogTitle>
          <DialogDescription>
            Enter product details. Image is optional.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image */}
          <div className="space-y-2">
            <Label>Product Image (Optional)</Label>
            <div className="flex items-center gap-4">
              {imagePreview ? (
                <div className="relative w-24 h-24 rounded-xl overflow-hidden border">
                  <img
                    src={imagePreview}
                    alt="Preview"
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
                  htmlFor="product-image-upload"
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md cursor-pointer hover:opacity-90"
                >
                  <Upload className="h-4 w-4" />
                  {imagePreview ? "Change Image" : "Upload Image"}
                </Label>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG up to 5MB
                </p>
                <Input
                  id="product-image-upload"
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Basic info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Barcode (Optional)</Label>
              <Input
                value={formData.barcode}
                onChange={(e) => handleInputChange("barcode", e.target.value)}
              />
            </div>
          </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Unit *</Label>
                <Select
                  value={formData.unit}
                  onValueChange={(v) => handleInputChange("unit", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="piece">Piece</SelectItem>
                    <SelectItem value="box">Box</SelectItem>
                    <SelectItem value="pack">Pack</SelectItem>
                    <SelectItem value="bottle">Bottle</SelectItem>
                    <SelectItem value="kilogram">Kilogram</SelectItem>
                    <SelectItem value="liter">Liter</SelectItem>
                    <SelectItem value="meter">Meter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Category *</Label>
                <Input
                  value={formData.categoryId}
                  onChange={(e) =>
                    handleInputChange("categoryId", e.target.value)
                  }
                  placeholder="Category ID"
                  required
                />
              </div>
            </div>

          {/* Stock */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Initial Stock *</Label>
              <Input
                type="number"
                value={formData.currentStock}
                min={0}
                onChange={(e) =>
                  handleInputChange(
                    "currentStock",
                    parseInt(e.target.value) || 0
                  )
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Minimum Qty *</Label>
              <Input
                type="number"
                value={formData.minQty}
                min={0}
                onChange={(e) =>
                  handleInputChange("minQty", parseInt(e.target.value) || 0)
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Recommended Qty (Optional)</Label>
              <Input
                type="number"
                value={formData.recommendedQty}
                min={0}
                onChange={(e) =>
                  handleInputChange(
                    "recommendedQty",
                    parseInt(e.target.value) || 0
                  )
                }
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Description (Optional)</Label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                handleInputChange("description", e.target.value)
              }
              rows={3}
              placeholder="Describe the product"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Add Product</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}