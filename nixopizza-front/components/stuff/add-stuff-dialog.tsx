"use client";
import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";
import { createStuff } from "@/lib/apis/stuff";

interface AddStuffDialogProps {
  addNewStuff: (s: any) => void;
}

export function AddStuffDialog({ addNewStuff }: AddStuffDialogProps) {
  const [open, setOpen] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
    phone1: "",
    phone2: "",
    phone3: "",
    address: "",
    status: "Active",
    notes: "",
    avatar: "" as string | File,
  });

  const handleInputChange = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
      setFormData((prev) => ({ ...prev, avatar: file }));
    }
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  const resetForm = () => {
    setFormData({
      fullname: "",
      email: "",
      password: "",
      phone1: "",
      phone2: "",
      phone3: "",
      address: "",
      status: "Active",
      notes: "",
      avatar: "",
    });
    setAvatarPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCreateStuff = async () => {
    const payload = new FormData();
    payload.append("fullname", formData.fullname);
    payload.append("email", formData.email);
    payload.append("password", formData.password);
    if (formData.phone1) payload.append("phone1", formData.phone1);
    if (formData.phone2) payload.append("phone2", formData.phone2);
    if (formData.phone3) payload.append("phone3", formData.phone3);
    if (formData.address) payload.append("address", formData.address);
    payload.append("status", formData.status);
    if (formData.notes) payload.append("notes", formData.notes);
    if (formData.avatar instanceof File) {
      payload.append("image", formData.avatar); // backend expects "image"
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
                  className="w-24 h-24 rounded-full object-cover shadow"
                />
              ) : (
                <span className="text-xs text-muted-foreground">
                  Click to upload
                </span>
              )}
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input
                value={formData.fullname}
                onChange={(e) => handleInputChange("fullname", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Password *</Label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                required
              />
            </div>
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
            <div className="space-y-2">
              <Label>Status</Label>
              <Input
                value={formData.status}
                onChange={(e) => handleInputChange("status", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Optional notes"
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleCreateStuff}>
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}