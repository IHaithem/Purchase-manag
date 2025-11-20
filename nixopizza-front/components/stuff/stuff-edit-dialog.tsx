"use client";
import { useState, useEffect } from "react";
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
import { User, Upload } from "lucide-react";
import { updateStuff } from "@/lib/apis/stuff";
import toast from "react-hot-toast";
import { IUser } from "@/store/user.store";
import { resolveImage } from "@/lib/resolveImage";

interface StuffEditDialogProps {
  stuff: IUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: (updated: IUser) => void;
}

export function StuffEditDialog({
  stuff,
  open,
  onOpenChange,
  onUpdated,
}: StuffEditDialogProps) {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    phone1: "",
    phone2: "",
    phone3: "",
    address: "",
    isActive: true,
    notes: "",
    password: "", // optional new password
    avatar: null as File | null,
  });

  useEffect(() => {
    if (open && stuff) {
      setFormData({
        fullname: stuff.fullname || "",
        email: stuff.email || "",
        phone1: stuff.phone1 || "",
        phone2: stuff.phone2 || "",
        phone3: stuff.phone3 || "",
        address: stuff.address || "",
        isActive: stuff.isActive,
        notes: "",
        password: "",
        avatar: null,
      });
      setAvatarPreview(stuff.avatar || null);
    }
  }, [open, stuff]);

  const handleInputChange = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image exceeds 5MB");
      return;
    }
    setFormData((prev) => ({ ...prev, avatar: file }));
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const currentAvatarDisplay = avatarPreview
    ? avatarPreview.startsWith("http") ||
      avatarPreview.startsWith("data:") ||
      avatarPreview.startsWith("blob:")
      ? avatarPreview
      : resolveImage(avatarPreview)
    : null;

  const handleUpdate = async () => {
    if (!stuff?._id) return;

    const payload = new FormData();
    if (formData.fullname) payload.append("fullname", formData.fullname);
    if (formData.email) payload.append("email", formData.email);
    if (formData.phone1) payload.append("phone1", formData.phone1);
    if (formData.phone2) payload.append("phone2", formData.phone2);
    if (formData.phone3) payload.append("phone3", formData.phone3);
    if (formData.address) payload.append("address", formData.address);
    payload.append("status", formData.isActive ? "Active" : "Inactive");
    if (formData.notes) payload.append("notes", formData.notes);
    if (formData.password.trim().length > 0)
      payload.append("password", formData.password.trim());
    if (formData.avatar) payload.append("image", formData.avatar);

    const data = await updateStuff(stuff._id, payload);
    if (data.success && data.stuff) {
      toast.success("Staff updated successfully!");
      onUpdated(data.stuff);
      setAvatarPreview(data.stuff.avatar || avatarPreview);
      onOpenChange(false);
    } else {
      toast.error(data.message || "Failed to update staff");
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
            <label
              htmlFor="edit-staff-avatar"
              className="flex flex-col items-center justify-center gap-3 p-6 border-2 border-dashed border-muted-foreground/25 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
            >
              {currentAvatarDisplay ? (
                <img
                  src={currentAvatarDisplay}
                  alt="Avatar preview"
                  className="w-20 h-20 rounded-full object-cover border-2 border-background shadow-sm"
                />
              ) : (
                <>
                  <div className="p-3 bg-primary/10 rounded-full">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-xs text-muted-foreground">Click to upload</p>
                </>
              )}
            </label>
            <Input
              id="edit-staff-avatar"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Full Name */}
          <div className="space-y-2">
            <Label>Full Name *</Label>
            <Input
              value={formData.fullname}
              onChange={(e) => handleInputChange("fullname", e.target.value)}
              required
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label>Email *</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              required
            />
          </div>

          {/* Phone Numbers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Phone 1</Label>
              <Input
                value={formData.phone1}
                onChange={(e) => handleInputChange("phone1", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Phone 2</Label>
              <Input
                value={formData.phone2}
                onChange={(e) => handleInputChange("phone2", e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Phone 3</Label>
              <Input
                value={formData.phone3}
                onChange={(e) => handleInputChange("phone3", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
              />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>Status</Label>
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
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Optional Password Change */}
          <div className="space-y-2">
            <Label>New Password (leave blank to keep current)</Label>
            <Input
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes (Optional)</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Additional information..."
              className="min-h-[80px]"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
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