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
import { Plus, Upload, User } from "lucide-react";
import { createStuff } from "@/lib/apis/stuff";
import toast from "react-hot-toast";
import { IUser } from "@/store/user.store";

export function AddStuffDialog({
  addNewStuff,
}: {
  addNewStuff: (newStuff: IUser) => void;
}) {
  const [open, setOpen] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    fullname: "",
    contactPerson: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    status: "Active",
    notes: "",
    avatar: "" as string | File, // Will hold File object during upload
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Store file for upload
      setFormData((prev) => ({
        ...prev,
        avatar: file,
      }));
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleCreateStuff = async () => {
    const payload = new FormData();

    // Add text fields
    payload.append("fullname", formData.fullname);
    payload.append("email", formData.email);
    payload.append("password", formData.password);
    if (formData.phone) payload.append("phone", formData.phone);
    if (formData.address) payload.append("address", formData.address);
    payload.append("status", formData.status);
    if (formData.notes) payload.append("notes", formData.notes);

    // Add avatar file (if exists)
    if (formData.avatar instanceof File) {
      payload.append("image", formData.avatar); // ← "image" matches backend
    }

    const data = await createStuff(payload);
    if (data.success) {
      addNewStuff(data.staff);
      toast.success("Staff member added successfully!");
      setOpen(false);
      resetForm();
    } else {
      toast.error(data.message);
    }
  };

  const resetForm = () => {
    setFormData({
      fullname: "",
      contactPerson: "",
      email: "",
      password: "",
      phone: "",
      address: "",
      status: "Active",
      notes: "",
      avatar: "",
    });
    setAvatarPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Staff
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">
            Add New Staff Member
          </DialogTitle>
          <DialogDescription>
            Fill in the details below to add a new team member.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Avatar Upload */}
          <div className="space-y-2">
            <Label>Profile Picture</Label>
            <div
              onClick={triggerFileInput}
              className="flex flex-col items-center justify-center gap-3 p-6 border-2 border-dashed border-muted-foreground/25 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
            >
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar preview"
                  className="w-20 h-20 rounded-full object-cover border-2 border-background shadow-sm"
                />
              ) : (
                <>
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Upload className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">Click to upload</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG up to 5MB
                    </p>
                  </div>
                </>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullname">Full Name *</Label>
            <Input
              id="fullname"
              value={formData.fullname}
              onChange={(e) => handleInputChange("fullname", e.target.value)}
              placeholder="Enter full name"
              required
            />
          </div>

          {/* Email & Password */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="email@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {/* Phone & Address */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="123 Main St, City"
              />
            </div>
          </div>

          {/* Status & Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Additional information..."
                className="min-h-[80px]"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateStuff}
            disabled={
              !formData.fullname || !formData.email || !formData.password
            }
          >
            Add Staff Member
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
