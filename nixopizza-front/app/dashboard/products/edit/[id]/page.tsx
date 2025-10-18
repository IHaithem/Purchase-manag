// app/dashboard/products/[id]/edit/page.tsx
"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
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
import { ArrowLeft, Save, X, Upload } from "lucide-react";
import { getProduct, updateProduct } from "@/lib/apis/products";
import toast from "react-hot-toast";
import { IProduct } from "../../page";
import { ICategory } from "@/app/dashboard/categories/page";
import { CategorySelect } from "@/components/ui/category-select";

export default function EditProductPage() {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ICategory | null>(
    null
  );
  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string;

  const [formData, setFormData] = useState<IProduct & { image?: File | null }>({
    _id: "",
    name: "",
    imageUrl: "",
    categoryId: {
      _id: "",
      name: "",
      image: "",
    },
    currentStock: 0,
    minQty: 0,
    maxQty: 0,
    barcode: "",
    unit: "",
    image: null,
  });

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Fetch product details by id
  useEffect(() => {
    const fetchProduct = async () => {
      const { product, success, message } = await getProduct(productId);
      if (success) {
        setFormData({ ...product, image: null });
        setPreviewImage(process.env.NEXT_PUBLIC_BASE_URL + product.imageUrl);

        // Find and set the selected category
        const category = categories.find(
          (cat) => cat._id === product.categoryId._id
        );
        if (category) {
          setSelectedCategory(category);
        }
      } else {
        toast.error(message);
      }
    };

    if (productId) fetchProduct();
  }, [productId, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCategory) {
      toast.error("Please select a category");
      return;
    }

    const form = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (key === "categoryId") {
          form.append("categoryId", selectedCategory._id);
        } else if (key === "image" && value instanceof File) {
          form.append("image", value);
        } else if (key !== "image") {
          form.append(key, value as any);
        }
      }
    });

    const { success, message } = await updateProduct(productId, form);
    if (success) {
      toast.success("Product updated successfully");
      router.push("/dashboard/products");
    } else {
      toast.error(message);
    }
  };

  const handleInputChange = (
    field: string,
    value: string | number | File | null
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageChange = (file: File | null) => {
    setImageFile(file);
    handleInputChange("image", file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPreviewImage(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreviewImage(formData.imageUrl || null);
    }
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
                Edit Product
              </h1>
              <p className="text-gray-600 mt-1">
                Update the details of your product
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
              Save Changes
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
                  <Upload className="h-5 w-5 text-primary" />
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
                  <Label htmlFor="image" className="text-sm font-medium">
                    Product Image
                  </Label>
                  <div className="flex items-center gap-4">
                    {previewImage ? (
                      <div className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-input shadow-sm">
                        <img
                          src={previewImage}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleImageChange(null)}
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
                        {previewImage ? "Change Image" : "Upload Image"}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG up to 5MB
                      </p>
                      <Input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleImageChange(e.target.files?.[0] || null)
                        }
                        className="hidden"
                      />
                    </div>
                  </div>
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
                  <Label htmlFor="barcode" className="text-sm font-medium">
                    Barcode
                  </Label>
                  <Input
                    id="barcode"
                    value={formData.barcode}
                    onChange={(e) =>
                      handleInputChange("barcode", e.target.value)
                    }
                    placeholder="Enter barcode"
                    className="py-5 border-2 border-input focus-visible:ring-2 focus-visible:ring-primary/30 rounded-lg"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card className="border-0 shadow-lg rounded-xl">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Upload className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="font-heading text-xl">
                    Pricing
                  </CardTitle>
                  <CardDescription>Unit details</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
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
            </CardContent>
          </Card>

          {/* Inventory Management */}
          <Card className="border-0 shadow-lg rounded-xl">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Upload className="h-5 w-5 text-primary" />
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
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div className="space-y-2">
                <Label htmlFor="stock" className="text-sm font-medium">
                  Current Stock *
                </Label>
                <Input
                  id="stock"
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
            </CardContent>
          </Card>
        </form>
      </div>
    </DashboardLayout>
  );
}
