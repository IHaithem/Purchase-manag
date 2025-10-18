// components/purchases/assign-staff-dialog.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { getStuff } from "@/lib/apis/stuff";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { IOrder } from "@/app/dashboard/purchases/page";

interface Staff {
  _id: string;
  fullname: string;
  email: string;
  avatar: string;
}

interface AssignStaffDialogProps {
  order: IOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOrderUpdated: (updatedOrder: IOrder) => void;
}

export function AssignStaffDialog({
  order,
  open,
  onOpenChange,
  onOrderUpdated,
}: AssignStaffDialogProps) {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingStaff, setIsFetchingStaff] = useState(false);

  // Fetch staff members
  useEffect(() => {
const fetchStaff = async () => {
  try {
    setIsFetchingStaff(true);
    const params = { page: 1, limit: 1000 } as unknown as { name?: string };
    const { success, staffs, message } = await getStuff(params);

    if (success && staffs) {
      setStaffList(staffs);
    } else {
      toast.error(message || "Failed to load staff members");
    }
  } catch (error) {
    console.error("Failed to fetch staff:", error);
    toast.error("Failed to load staff members");
  } finally {
    setIsFetchingStaff(false);
  }
};



    if (open) {
      fetchStaff();
    }
  }, [open]);

  const handleAssign = async () => {
    if (!selectedStaffId) {
      toast.error("Please select a staff member");
      return;
    }

    if (!order) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/orders/${order._id}/assign`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ staffId: selectedStaffId }),
        }
      );

      const data = await response.json();

      if (response.ok && data.order) {
        toast.success("Order assigned successfully");
        onOrderUpdated(data.order);
        onOpenChange(false);
        setSelectedStaffId("");
      } else {
        toast.error(data.message || "Failed to assign order");
      }
    } catch (error) {
      console.error("Error assigning order:", error);
      toast.error("Failed to assign order");
    } finally {
      setIsLoading(false);
    }
  };

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-heading flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Assign Order to Staff
          </DialogTitle>
          <DialogDescription>
            Select a staff member to assign order {order.orderNumber}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="staff" className="text-sm font-medium">
              Staff Member *
            </Label>
            {isFetchingStaff ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
                <SelectTrigger className="border-2 border-input focus:ring-2 focus:ring-primary/30 rounded-lg">
                  <SelectValue placeholder="Select staff member" />
                </SelectTrigger>
                <SelectContent>
                  {staffList.map((staff) => (
                    <SelectItem key={staff._id} value={staff._id}>
                      <div className="flex items-center gap-2">
                        <img
                          src={process.env.NEXT_PUBLIC_BASE_URL + staff.avatar}
                          alt={staff.fullname}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <div>
                          <div className="font-medium">{staff.fullname}</div>
                          <div className="text-xs text-muted-foreground">
                            {staff.email}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Order Details */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Supplier:</span>
              <span className="font-medium">{order.supplierId?.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Items:</span>
              <span className="font-medium">{order.items.length} items</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Amount:</span>
              <span className="font-medium">
                {order.totalAmount.toFixed(2)} DA
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="rounded-full px-6"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleAssign}
            disabled={isLoading || !selectedStaffId || isFetchingStaff}
            className="rounded-full px-6"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Assigning...
              </>
            ) : (
              "Assign Order"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}