"use client";

import React, { useState, useEffect, useRef } from "react";
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
import { updateProduct } from "@/lib/apis/products";
import toast from "react-hot-toast";
import { resolveImage } from "@/lib/resolveImage";

interface ProductBackend {
  _id: string;
  name: string;
  barcode?: string;
  unit: string;
  categoryId: any;
  currentStock: number;
  minQty: number;
  recommendedQty: number;
  description?: string;
  imageUrl?: string;
}

interface ProductEditDialogProps {
  product: ProductBackend | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated?: (p: ProductBackend) => void;
}

export function ProductEditDialog({
  product,
  open,
  onOpenChange,
  onUpdated,
}: ProductEditDialogProps) {
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
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        barcode: product.barcode || "",
        unit: product.unit || "",
        categoryId:
          typeof product.categoryId === "object"
            ? product.categoryId?._id || ""
            : product.categoryId || "",
        currentStock: product.currentStock,
        minQty: product.minQty,
        recommendedQty: product.recommendedQty,
        description: product.description || "",
      });
      setImage(null);
      setImagePreview(product.imageUrl ? resolveImage(product.imageUrl) : null);
    } else {
      resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product]);

  const handleInputChange = (field: string, value: string | number) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      if (!f.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
      setImage(f);
      setImagePreview(URL.createObjectURL(f));
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
    if (!product) return;
    setIsSubmitting(true);

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

    const { success, product: updated, message } = await updateProduct(
      product._id,
      fd
    );
    if (success && updated) {
      toast.success("Product updated");
      onUpdated?.(updated);
      onOpenChange(false);
    } else {
      toast.error(message);
    }

    setIsSubmitting(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) resetForm();
      }}
    >
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">
            {product ? "Edit Product" : "Add Product"}
          </DialogTitle>
          <DialogDescription>
            {product
              ? "Update product attributes. Image optional."
              : "Provide product details."}
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
                  htmlFor="edit-product-image-upload"
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md cursor-pointer hover:opacity-90"
                >
                  <Upload className="h-4 w-4" />
                  {imagePreview ? "Change Image" : "Upload Image"}
                </Label>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG up to 5MB
                </p>
                <Input
                  id="edit-product-image-upload"
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Basic fields */}
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
                  required
                />
              </div>
            </div>

          {/* Stock */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Current Stock *</Label>
              <Input
                type="number"
                min={0}
                value={formData.currentStock}
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
                min={0}
                value={formData.minQty}
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
                min={0}
                value={formData.recommendedQty}
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
              rows={3}
              value={formData.description}
              onChange={(e) =>
                handleInputChange("description", e.target.value)
              }
              placeholder="Describe the product"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}