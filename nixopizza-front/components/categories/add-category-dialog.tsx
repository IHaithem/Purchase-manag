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
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Upload, X, Camera } from "lucide-react";
import { createCategory } from "@/lib/apis/categories";
import toast from "react-hot-toast";

export function AddCategoryDialog({ setCategories }: { setCategories: any }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: null as File | null,
    imagePreview: null as string | null,
  });
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
      toast.success("Category created successfully");
      setCategories((prv: any) => [...prv, category]);
      setOpen(false);
      setFormData({
        name: "",
        description: "",
        image: null,
        imagePreview: null,
      });
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
      setFormData((prev) => ({
        ...prev,
        image: file,
      }));
      const reader = new FileReader();
      reader.onload = (ev) =>
        setFormData((prev) => ({
          ...prev,
          imagePreview: ev.target?.result as string,
        }));
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      image: null,
      imagePreview: null,
    }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl">
            Create New Category
          </DialogTitle>
          <DialogDescription>
            Organize your items with a category (image optional).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-stretch gap-5 ">
            <Card
              className={`flex-1 max-h-44 ${
                !formData.imagePreview && "border-2 border-dashed"
              } p-0`}
            >
              <CardContent className="p-0 h-full">
                <div className="text-center h-full">
                  {formData.imagePreview ? (
                    <div className="relative w-full h-full">
                      <img
                        src={formData.imagePreview}
                        alt="Category preview"
                        className="w-full h-full rounded-xl object-cover"
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
                        className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto cursor-pointer"
                        onClick={triggerFileInput}
                      >
                        <Camera className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={triggerFileInput}
                          className="gap-2 text-sm cursor-pointer mt-4"
                        >
                          <Upload className="h-3 w-3" />
                          <span className="text-sm">
                            {formData.imagePreview
                              ? "Change Image"
                              : "Choose Image"}
                          </span>
                        </Button>
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
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              <Plus className="h-4 w-4 mr-2" />
              Create Category
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}