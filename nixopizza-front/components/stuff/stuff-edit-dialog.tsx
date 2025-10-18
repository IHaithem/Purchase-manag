"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
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
import { Upload, User } from "lucide-react";
import { updateStuff } from "@/lib/apis/stuff";
import toast from "react-hot-toast";
import { IUser } from "@/store/user.store";

interface StuffEditDialogProps {
  stuff: IUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StuffEditDialog({
  stuff,
  open,
  onOpenChange,
}: StuffEditDialogProps) {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ✅ Initialize with proper boolean value
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    phone: "",
    address: "",
    isActive: true, // ✅ boolean, not Boolean constructor
    notes: "",
    avatar: null as File | null,
  });

  // Reset form when dialog opens or stuff changes
  useEffect(() => {
    if (open && stuff) {
      setFormData({
        fullname: stuff.fullname || "",
        email: stuff.email || "",
        phone: stuff.phone || "",
        address: stuff.address || "",
        isActive: stuff.isActive, // ✅ boolean from backend
        notes: "",
        avatar: null,
      });
      setAvatarPreview(stuff.avatar || null);
    }
  }, [open, stuff]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setFormData((prev) => ({ ...prev, avatar: file }));
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleUpdate = async () => {
    if (!stuff?._id) return;

    try {
      const payload = new FormData();

      // Add text fields
      payload.append("fullname", formData.fullname);
      payload.append("email", formData.email);
      if (formData.phone) payload.append("phone", formData.phone);
      if (formData.address) payload.append("address", formData.address);

      // ✅ Convert boolean to string for backend compatibility
      payload.append("status", formData.isActive ? "Active" : "Inactive");

      if (formData.notes) payload.append("notes", formData.notes);

      // Add new avatar if selected
      if (formData.avatar instanceof File) {
        payload.append("image", formData.avatar);
      }

      const data = await updateStuff(stuff._id, payload);
      if (data.success) {
        toast.success("Staff updated successfully!");
        onOpenChange(false);
      } else {
        toast.error(data.message || "Failed to update staff");
      }
    } catch (error) {
      console.error("Update staff error:", error);
      toast.error("An unexpected error occurred");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">Edit Staff Member</DialogTitle>
          <DialogDescription>
            Update staff information and profile picture
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
                  src={
                    avatarPreview.startsWith("http")
                      ? avatarPreview
                      : `${process.env.NEXT_PUBLIC_BASE_URL}${avatarPreview}`
                  }
                  alt="Avatar preview"
                  className="w-20 h-20 rounded-full object-cover border-2 border-background shadow-sm"
                />
              ) : (
                <>
                  <div className="p-3 bg-primary/10 rounded-full">
                    <User className="h-6 w-6 text-primary" />
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

          {/* Email & Phone */}
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
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder=""
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              placeholder="123 Main St, City"
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.isActive ? "Active" : "Inactive"}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  isActive: value === "Active",
                }))
              }
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

          {/* Notes */}
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

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdate}
            disabled={!formData.fullname || !formData.email}
          >
            Update Staff
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
