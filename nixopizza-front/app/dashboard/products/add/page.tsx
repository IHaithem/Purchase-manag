"use client";

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
import { createProduct } from "@/lib/apis/products";
import { CategorySelect } from "@/components/ui/category-select";
import { getCategories } from "@/lib/apis/categories";
import { useEffect, useState } from "react";

export interface ICategory {
  _id: string;
  name: string;
  description?: string;
  image: string;
}

export default function AddProductPage() {
  const router = useRouter();
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ICategory | null>(null);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [categorySearch, setCategorySearch] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    barcode: "",
    unit: "",
    currentStock: 0,
    minQty: 0,
    recommendedQty: 0,
    description: "",
  });

  useEffect(() => {
    const fetch = async () => {
      const { categories: data, success, message } = await getCategories(
        categorySearch ? { name: categorySearch } : undefined
      );
      if (success) {
        setCategories(data || []);
      } else {
        toast.error(message);
      }
    };
    fetch();
  }, [categorySearch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCategory) {
      toast.error("Please select a category");
      return;
    }
    if (!formData.unit) {
      toast.error("Please select a unit");
      return;
    }
    if (!formData.name.trim()) {
      toast.error("Product name is required");
      return;
    }

    const data = new FormData();
    data.append("name", formData.name.trim());
    if (formData.barcode) data.append("barcode", formData.barcode);
    data.append("unit", formData.unit);
    data.append("currentStock", String(formData.currentStock));
    data.append("minQty", String(formData.minQty));
    data.append("recommendedQty", String(formData.recommendedQty));
    if (formData.description) data.append("description", formData.description);
    data.append("categoryId", selectedCategory._id);
    // Image OPTIONAL
    if (image) data.append("image", image);

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
    (c) => !selectedCategory || c._id !== selectedCategory._id
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => router.push("/dashboard/products")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading flex items-center gap-2">
              <Package className="h-5 w-5" />
              Add Product
            </CardTitle>
            <CardDescription>
              Create a new product. Image is optional.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Image (optional) */}
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
                    onChange={(e) =>
                      handleInputChange("name", e.target.value)
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Barcode (Optional)</Label>
                  <Input
                    value={formData.barcode}
                    onChange={(e) =>
                      handleInputChange("barcode", e.target.value)
                    }
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
                  <CategorySelect
                    categories={availableCategories}
                    selectedCategory={selectedCategory}
                    onSelect={(c) => setSelectedCategory(c as ICategory | null)}
                    isLoading={false}
                    placeholder="Select category"
                    className="border rounded-md"
                  />
                </div>
              </div>

              {/* Stock */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Initial Stock *</Label>
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

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/dashboard/products")}
                >
                  Cancel
                </Button>
                <Button type="submit" className="gap-2">
                  <Save className="h-4 w-4" />
                  Save Product
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}