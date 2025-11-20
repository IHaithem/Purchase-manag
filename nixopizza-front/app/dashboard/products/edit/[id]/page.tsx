"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { CategorySelect } from "@/components/ui/category-select";
import {
  ArrowLeft,
  Save,
  X,
  Upload,
  Package,
} from "lucide-react";
import toast from "react-hot-toast";
import { getProduct, updateProduct } from "@/lib/apis/products";
import { getCategories } from "@/lib/apis/categories";
import { resolveImage } from "@/lib/resolveImage";

interface ICategory {
  _id: string;
  name: string;
  image: string;
  description?: string;
}

interface IProduct {
  _id: string;
  name: string;
  barcode?: string;
  unit: string;
  categoryId: ICategory;
  imageUrl?: string;
  description?: string;
  currentStock: number;
  minQty: number;
  recommendedQty: number;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string;

  const [categories, setCategories] = useState<ICategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ICategory | null>(null);

  const [formData, setFormData] = useState<Omit<IProduct, "categoryId"> & { categoryId?: ICategory }>({
    _id: "",
    name: "",
    barcode: "",
    unit: "",
    imageUrl: "",
    description: "",
    currentStock: 0,
    minQty: 0,
    recommendedQty: 0,
  });

  // image state
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Load categories first
  useEffect(() => {
    const fetchCategories = async () => {
      const { categories: data, success, message } = await getCategories();
      if (success) {
        setCategories(data || []);
      } else {
        toast.error(message);
      }
    };
    fetchCategories();
  }, []);

  // Fetch product
  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;
      const { product, success, message } = await getProduct(productId);
      if (!success) {
        toast.error(message);
        return;
      }
      setFormData({
        _id: product._id,
        name: product.name,
        barcode: product.barcode,
        unit: product.unit,
        imageUrl: product.imageUrl,
        description: product.description,
        currentStock: product.currentStock,
        minQty: product.minQty,
        recommendedQty: product.recommendedQty,
        categoryId: product.categoryId,
      });
      setPreviewImage(resolveImage(product.imageUrl));
      // If categories already loaded, set selectedCategory now
      setSelectedCategory(product.categoryId || null);
    };
    fetchProduct();
  }, [productId]);

  // When categories load after product, ensure selectedCategory is set
  useEffect(() => {
    if (formData.categoryId && categories.length > 0) {
      const match = categories.find((c) => c._id === formData.categoryId?._id);
      if (match) {
        setSelectedCategory(match);
      }
    }
  }, [categories, formData.categoryId]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (file: File | null) => {
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPreviewImage(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreviewImage(resolveImage(formData.imageUrl));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setPreviewImage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCategory) {
      toast.error("Please select a category");
      return;
    }

    const form = new FormData();
    form.append("name", formData.name);
    if (formData.barcode) form.append("barcode", formData.barcode);
    if (formData.unit) form.append("unit", formData.unit);
    form.append("categoryId", selectedCategory._id);
    if (formData.description) form.append("description", formData.description);
    form.append("currentStock", String(formData.currentStock));
    form.append("minQty", String(formData.minQty));
    form.append("recommendedQty", String(formData.recommendedQty));
    if (imageFile) {
      form.append("image", imageFile);
    }

    const { success, message } = await updateProduct(productId, form);
    if (success) {
      toast.success("Product updated successfully");
      router.push("/dashboard/products");
    } else {
      toast.error(message);
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
                Update product details, category, and image.
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

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
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
                      Barcode
                    </Label>
                    <Input
                      id="barcode"
                      value={formData.barcode || ""}
                      onChange={(e) =>
                        handleInputChange("barcode", e.target.value)
                      }
                      placeholder="Enter barcode"
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
                      categories={categories}
                      selectedCategory={selectedCategory}
                      onSelect={(c) => setSelectedCategory(c)}
                      placeholder="Select a category"
                      className="border-2 border-input focus:ring-2 focus:ring-primary/30 rounded-lg"
                      isLoading={false}
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
                        <SelectItem value="bottle">Bottle</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">
                    Description (Optional)
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description || ""}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    placeholder="Enter product description"
                    rows={3}
                    className="resize-y border-2 border-input focus-visible:ring-2 focus-visible:ring-primary/30 rounded-lg"
                  />
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                  <Label htmlFor="image" className="text-sm font-medium">
                    Product Image
                  </Label>
                  <div className="flex items-center gap-4">
                    {previewImage ? (
                      <div className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-input shadow-sm">
                        <img
                          src={previewImage}
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
              </CardContent>
            </Card>

          {/* Inventory */}
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
                    Adjust stock thresholds and current levels
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="currentStock" className="text-sm font-medium">
                    Current Stock *
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
                    min={0}
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
                      handleInputChange("minQty", Number.parseInt(e.target.value) || 0)
                    }
                    min={0}
                    className="py-5 border-2 border-input focus-visible:ring-2 focus-visible:ring-primary/30 rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="recommendedQty"
                    className="text-sm font-medium"
                  >
                    Recommended Quantity
                  </Label>
                  <Input
                    id="recommendedQty"
                    type="number"
                    value={formData.recommendedQty}
                    onChange={(e) =>
                      handleInputChange(
                        "recommendedQty",
                        Number.parseInt(e.target.value) || 0
                      )
                    }
                    min={0}
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