// app/dashboard/products/add/page.tsx
"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Save, X, Upload, Package } from "lucide-react";
import toast from "react-hot-toast";
import { ICategory } from "../../categories/page";
import { createProduct } from "@/lib/apis/products";
import { CategorySelect } from "@/components/ui/category-select";

export default function AddProductPage() {
  const router = useRouter();
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ICategory | null>(
    null
  );

  const [formData, setFormData] = useState({
    name: "",
    barcode: "",
    unit: "",
    currentStock: 0,
    minQty: 0,
    maxQty: 0,
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!image) {
      toast.error("Product image is required");
      return;
    }

    if (!selectedCategory) {
      toast.error("Please select a category");
      return;
    }

    if (!formData.unit) {
      toast.error("Please select a unit");
      return;
    }

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, String(value));
    });
    data.append("categoryId", selectedCategory._id);
    data.append("image", image);

    const { success, message } = await createProduct(data);

    if (success) {
      toast.success("Product Created Successfully");
      router.push("/dashboard/products");
    } else {
      toast.error(message);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
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

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="gap-2 rounded-full"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-heading font-bold text-gray-900">
                Add New Product
              </h1>
              <p className="text-gray-600 mt-1">
                Create a new product in your inventory system
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/products")}
              className="gap-2 rounded-full px-4"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="gap-2 rounded-full px-6 bg-primary hover:bg-primary/90"
            >
              <Save className="h-4 w-4" />
              Save Product
            </Button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card className="border-0 shadow-lg rounded-xl">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="font-heading text-xl">
                    Basic Information
                  </CardTitle>
                  <CardDescription>
                    Essential product details and identification
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Product Name *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter product name"
                    required
                    className="py-5 border-2 border-input focus-visible:ring-2 focus-visible:ring-primary/30 rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="barcode" className="text-sm font-medium">
                    Barcode *
                  </Label>
                  <Input
                    id="barcode"
                    value={formData.barcode}
                    onChange={(e) =>
                      handleInputChange("barcode", e.target.value)
                    }
                    placeholder="Enter barcode"
                    required
                    className="py-5 border-2 border-input focus-visible:ring-2 focus-visible:ring-primary/30 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm font-medium">
                    Category *
                  </Label>
                  <CategorySelect
                    selectedCategory={selectedCategory}
                    onCategoryChange={setSelectedCategory}
                    placeholder="Select a category"
                    className="border-2 border-input focus:ring-2 focus:ring-primary/30 rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit" className="text-sm font-medium">
                    Unit *
                  </Label>
                  <Select
                    value={formData.unit}
                    onValueChange={(value) => handleInputChange("unit", value)}
                  >
                    <SelectTrigger className="py-5 border-2 border-input focus:ring-2 focus:ring-primary/30 rounded-lg">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="liter">Liter</SelectItem>
                      <SelectItem value="kilogram">Kilogram</SelectItem>
                      <SelectItem value="box">Box</SelectItem>
                      <SelectItem value="piece">Piece</SelectItem>
                      <SelectItem value="meter">Meter</SelectItem>
                      <SelectItem value="pack">Pack</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Enter product description"
                  rows={3}
                  className="resize-y border-2 border-input focus-visible:ring-2 focus-visible:ring-primary/30 rounded-lg"
                />
              </div>

              {/* Modern Image Upload */}
              <div className="space-y-2">
                <Label htmlFor="image" className="text-sm font-medium">
                  Product Image *
                </Label>
                <div className="flex items-center gap-4">
                  {imagePreview ? (
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-input shadow-sm">
                      <img
                        src={imagePreview}
                        alt="Product preview"
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
            </CardContent>
          </Card>

          {/* Inventory Management */}
          <Card className="border-0 shadow-lg rounded-xl">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="font-heading text-xl">
                    Inventory Management
                  </CardTitle>
                  <CardDescription>
                    Stock levels and inventory tracking
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="currentStock" className="text-sm font-medium">
                    Initial Stock *
                  </Label>
                  <Input
                    id="currentStock"
                    type="number"
                    value={formData.currentStock}
                    onChange={(e) =>
                      handleInputChange(
                        "currentStock",
                        Number.parseInt(e.target.value) || 0
                      )
                    }
                    placeholder="0"
                    min="0"
                    required
                    className="py-5 border-2 border-input focus-visible:ring-2 focus-visible:ring-primary/30 rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minQty" className="text-sm font-medium">
                    Minimum Quantity *
                  </Label>
                  <Input
                    id="minQty"
                    type="number"
                    value={formData.minQty}
                    onChange={(e) =>
                      handleInputChange(
                        "minQty",
                        Number.parseInt(e.target.value) || 0
                      )
                    }
                    placeholder="0"
                    min="0"
                    required
                    className="py-5 border-2 border-input focus-visible:ring-2 focus-visible:ring-primary/30 rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxQty" className="text-sm font-medium">
                    Maximum Quantity
                  </Label>
                  <Input
                    id="maxQty"
                    type="number"
                    value={formData.maxQty}
                    onChange={(e) =>
                      handleInputChange(
                        "maxQty",
                        Number.parseInt(e.target.value) || 0
                      )
                    }
                    placeholder="0"
                    min="0"
                    className="py-5 border-2 border-input focus-visible:ring-2 focus-visible:ring-primary/30 rounded-lg"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </DashboardLayout>
  );
}
