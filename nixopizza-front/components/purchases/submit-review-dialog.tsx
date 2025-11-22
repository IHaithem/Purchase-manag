"use client";
import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { IOrder } from "@/app/dashboard/purchases/page";
import { submitForReview } from "@/lib/apis/purchase-list";

interface SubmitReviewDialogProps {
  order: IOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOrderUpdated: (updated: IOrder) => void;
}

export function SubmitReviewDialog({
  order,
  open,
  onOpenChange,
  onOrderUpdated,
}: SubmitReviewDialogProps) {
  const [totalAmount, setTotalAmount] = useState("");
  const [billFile, setBillFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!order) return null;

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.match("image.*") && !f.type.match("application/pdf")) {
      toast.error("Select image or PDF");
      return;
    }
    setBillFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const reset = () => {
    setTotalAmount("");
    setBillFile(null);
    setPreview(null);
  };

  const handleSubmit = async () => {
    if (order.status !== "assigned") {
      toast.error("Order must be assigned first");
      return;
    }
    if (!billFile) {
      toast.error("Bill file required");
      return;
    }
    if (!totalAmount || parseFloat(totalAmount) <= 0) {
      toast.error("Enter valid total amount");
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("image", billFile);
      fd.append("totalAmount", totalAmount);
      const { success, order: updated, message } = await submitForReview(
        order._id,
        fd
      );
      if (success && updated) {
        toast.success("Submitted for review");
        onOrderUpdated(updated);
        onOpenChange(false);
        reset();
      } else {
        toast.error(message || "Failed to submit");
      }
    } catch {
      toast.error("Error submitting");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Submit Bill for Review</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Total Amount (DA)</Label>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              placeholder="Enter final billed total"
            />
          </div>
          <div>
            <Label>Bill File (Image/PDF)</Label>
            {preview ? (
              <div className="relative border rounded p-3">
                {billFile?.type.includes("pdf") ? (
                  <p className="text-sm">{billFile.name}</p>
                ) : (
                  <img
                    src={preview}
                    alt="Bill preview"
                    className="max-h-48 object-contain mx-auto"
                  />
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setBillFile(null);
                    setPreview(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded border-2 border-dashed p-6 gap-3">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                  Upload supplier bill (PNG/JPG/PDF)
                </p>
                <Input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFile}
                />
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              reset();
            }}
            disabled={loading}
          >
            Cancel
          </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || !billFile || !totalAmount}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" /> Submitting...
                </>
              ) : (
                "Submit"
              )}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}