"use client";

import type React from "react";
import { useState, useRef } from "react";
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
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Upload, ImageIcon, X, Camera } from "lucide-react";
import { createCategory } from "@/lib/apis/categories";
import toast from "react-hot-toast";

// Placeholder for the Switch component
export const Switch = ({
  checked,
  onCheckedChange,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) => (
  <button
    role="switch"
    aria-checked={checked}
    onClick={() => onCheckedChange(!checked)}
    className={`w-11 h-6 p-1 rounded-full transition-all duration-200 ${
      checked ? "bg-primary" : "bg-gray-300"
    }`}
  >
    <span
      className={`block w-4 h-4 bg-white rounded-full shadow-lg transition-transform duration-200 ${
        checked ? "translate-x-5" : "translate-x-0"
      }`}
    ></span>
  </button>
);

type Budget = {
  period: "daily" | "weekly" | "monthly";
  amount: number;
  spent: number;
};

const defaultBudget: Budget = { period: "monthly", amount: 0, spent: 0 };

export function AddCategoryDialog({ setCategories }: { setCategories: any }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "product",
    budget: defaultBudget as Budget | null,
    image: null as File | null,
    imagePreview: null as string | null,
  });

  const [isBudgetAllocated, setIsBudgetAllocated] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("description", formData.description);
    if (formData.image) {
      formDataToSend.append("image", formData.image);
    }

    const { success, message, category } = await createCategory(formDataToSend);
    if (success) {
      toast.success("Category Created Successffully");
      setCategories((prv: any) => [...prv, category]);
      setOpen(false);
      setFormData({
        name: "",
        description: "",
        type: "product",
        budget: defaultBudget,
        image: null,
        imagePreview: null,
      });
      setIsBudgetAllocated(true);
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

  const handleBudgetChange = (field: keyof Budget, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      budget: prev.budget ? { ...prev.budget, [field]: value } : null,
    }));
  };

  const handleBudgetToggle = (checked: boolean) => {
    setIsBudgetAllocated(checked);
    if (checked && !formData.budget) {
      setFormData((prev) => ({ ...prev, budget: defaultBudget }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        setFormData((prev) => ({
          ...prev,
          image: file,
        }));

        const reader = new FileReader();
        reader.onload = (e) => {
          setFormData((prev) => ({
            ...prev,
            imagePreview: e.target?.result as string,
          }));
        };
        reader.readAsDataURL(file);
      } else {
        alert("Please select a valid image file.");
      }
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      image: null,
      imagePreview: null,
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all duration-200 shadow-lg hover:shadow-xl">
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[650px] rounded-2xl">
        <DialogHeader className="text-center">
          <DialogTitle className="font-heading text-2xl bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Create New Category
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Organize your items with a custom category and optional budget
            tracking
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-stretch gap-5 ">
            {/* Image Upload Section */}
            <Card
              className={`flex-1 max-h-44 ${
                !formData.imagePreview && "border-2 border-dashed"
              }   p-0 hover:border-primary/50 transition-colors duration-200`}
            >
              <CardContent className="p-0 h-full">
                <div className="text-center h-full">
                  {formData.imagePreview ? (
                    <div className="relative w-full h-full">
                      <img
                        src={formData.imagePreview}
                        alt="Category preview"
                        className="w-full h-full rounded-xl object-cover shadow-lg mx-auto"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute cursor-pointer -top-2 -right-2 h-7 w-7 rounded-full"
                        onClick={handleRemoveImage}
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div
                        className="w-20 h-20 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 flex items-center justify-center mx-auto cursor-pointer transition-all duration-200 hover:scale-105 hover:from-primary/10 hover:to-primary/5"
                        onClick={triggerFileInput}
                      >
                        <div className="text-center">
                          <Camera className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <span className="text-xs text-muted-foreground">
                            Upload Image
                          </span>
                        </div>
                      </div>

                      <div>
                        <div className="mt-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={triggerFileInput}
                            className="gap-2 text-sm cursor-pointer"
                          >
                            <Upload className="h-3 w-3" />
                            <span className="text-sm">
                              {formData.imagePreview
                                ? "Change Image"
                                : "Choose Image"}
                            </span>
                          </Button>
                        </div>

                        <p className="text-xs text-muted-foreground mt-2">
                          PNG, JPG, WEBP up to 5MB
                        </p>
                      </div>
                    </>
                  )}

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Category Information */}
            <div className="flex-1">
              <div className="space-y-4 mb-8">
                <div className="space-y-2">
                  <Label htmlFor="name" className="font-semibold">
                    Category Name *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter category name"
                    className="rounded-lg transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="font-semibold">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Describe this category..."
                  rows={5}
                  className="rounded-lg resize-none transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>

          {/* Budget Allocation Section */}
          <Card className="bg-gradient-to-br from-muted/30 to-muted/10 border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <Label className="text-base font-semibold">
                    Budget Allocation
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Set spending limits for this category
                  </p>
                </div>
                <Switch
                  checked={isBudgetAllocated}
                  onCheckedChange={handleBudgetToggle}
                />
              </div>

              {isBudgetAllocated && (
                <div className="space-y-4 animate-in fade-in-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Budget Period</Label>
                      <Select
                        value={formData.budget?.period || defaultBudget.period}
                        onValueChange={(value) =>
                          handleBudgetChange("period", value)
                        }
                      >
                        <SelectTrigger className="rounded-lg transition-all duration-200 focus:ring-2 focus:ring-primary/20">
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
                      <Label>Target Amount</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                          $
                        </span>
                        <Input
                          type="number"
                          value={
                            formData.budget?.amount === 0
                              ? ""
                              : formData.budget?.amount || ""
                          }
                          onChange={(e) =>
                            handleBudgetChange("amount", Number(e.target.value))
                          }
                          placeholder="0.00"
                          className="pl-8 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <DialogFooter className="gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="rounded-lg border-2 transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-lg bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Category
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
