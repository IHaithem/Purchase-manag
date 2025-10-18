// components/stuff/stuff-table.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  User,
  CheckCircle,
  XCircle,
  ClipboardList,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Fragment, useEffect, useState } from "react";
import { StuffEditDialog } from "./stuff-edit-dialog";
import { AssignTaskDialog } from "./assign-task-dialog";
import { deleteStuff, getStuff } from "@/lib/apis/stuff";
import toast from "react-hot-toast";
import { IUser } from "@/store/user.store";
import { Pagination } from "@/components/ui/pagination";

export function StuffTable({
  stuffs,
  setStuffs,
  totalPages,
  currentPage,
  setCurrentPage,
  limit,
  setLimit,
}: {
  stuffs: IUser[];
  setStuffs: any;
  totalPages: number;
  currentPage: number;
  setCurrentPage: any;
  limit: number;
  setLimit: any;
}) {
  const router = useRouter();
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectStuff, setSelectStuff] = useState<IUser | null>(null);
  const [openAssignTaskDialog, setOpenAssignTaskDialog] = useState(false);

  const handleAssignTask = (user: IUser) => {
    setSelectStuff(user);
    setOpenAssignTaskDialog(true);
  };
  // Logic to get the account status for the badge
  const getAccountStatus = (isActive: boolean) => {
    if (isActive) {
      return {
        label: "Active",
        variant: "default" as const,
        icon: <CheckCircle className="h-4 w-4" />,
      };
    }
    return {
      label: "Inactive",
      variant: "destructive" as const,
      icon: <XCircle className="h-4 w-4" />,
    };
  };

  const handleEdit = (user: IUser) => {
    setSelectStuff(user);
    setOpenEditDialog(true);
  };

  const handleDelete = async (user: IUser) => {
    const data = await deleteStuff(user._id);
    if (data.success) {
      toast.success("Stuff deleted successfully");
      setStuffs(stuffs.filter((stuff) => stuff._id !== user._id));
      setOpenEditDialog(false);
    } else {
      toast.error(data.message || "Failed to delete stuff");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading">Stuff Directory</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Full Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stuffs.map((user) => {
                const accountStatus = getAccountStatus(user?.isActive);
                return (
                  <TableRow key={user._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted rounded-lg">
                          {user.avatar ? (
                            <img
                              src={
                                process.env.NEXT_PUBLIC_BASE_URL + user.avatar
                              }
                              className="w-12 h-12 rounded-full"
                              alt={user.fullname}
                            />
                          ) : (
                            <User className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{user.fullname}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {user.email}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{user.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant={accountStatus.variant}>
                          {accountStatus.icon}
                          {accountStatus.label}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleAssignTask(user)}
                          >
                            <ClipboardList className="h-4 w-4 mr-2" />
                            Assign Task
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(user)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            Showing {stuffs.length} of {totalPages * limit} staff members
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            limit={limit}
            onLimitChange={setLimit}
          />
        </div>
      </CardContent>
      <AssignTaskDialog
        stuff={selectStuff}
        open={openAssignTaskDialog}
        onOpenChange={() => setOpenAssignTaskDialog(false)}
      />
      <StuffEditDialog
        stuff={selectStuff}
        open={openEditDialog}
        onOpenChange={() => setOpenEditDialog(false)}
      />
    </Card>
  );
}
