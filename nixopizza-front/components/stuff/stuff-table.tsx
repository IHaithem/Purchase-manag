import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  ClipboardList,
  Edit,
  MoreHorizontal,
  User,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { deleteStuff } from "@/lib/apis/stuff";
import { IUser } from "@/store/user.store";
import { useState } from "react";
import { resolveImage } from "@/lib/resolveImage";
import { StuffEditDialog } from "./stuff-edit-dialog";

interface StuffTableProps {
  stuffs: IUser[];
  // NOTE: setStuffs accepts ONLY an array (not a functional updater) in this version.
  setStuffs: (s: IUser[]) => void;
  totalPages: number;
  currentPage: number;
  setCurrentPage: (p: number) => void;
  limit: number;
  setLimit: (l: number) => void;
}

export function StuffTable({
  stuffs,
  setStuffs,
  totalPages,
  currentPage,
  setCurrentPage,
  limit,
  setLimit,
}: StuffTableProps) {
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedStuff, setSelectedStuff] = useState<IUser | null>(null);

  const getAccountStatus = (isActive: boolean) =>
    isActive
      ? {
          label: "Active",
          variant: "default" as const,
          icon: <CheckCircle className="h-4 w-4" />,
        }
      : {
          label: "Inactive",
          variant: "destructive" as const,
          icon: <XCircle className="h-4 w-4" />,
        };

  const handleEdit = (user: IUser) => {
    setSelectedStuff(user);
    setOpenEditDialog(true);
  };

  const handleDelete = async (user: IUser) => {
    const data = await deleteStuff(user._id);
    if (data.success) {
      toast.success("Staff deleted successfully");
      setStuffs(stuffs.filter((s) => s._id !== user._id));
      if (selectedStuff?._id === user._id) {
        setOpenEditDialog(false);
        setSelectedStuff(null);
      }
    } else {
      toast.error(data.message || "Failed to delete staff");
    }
  };

  // FIX: do NOT use functional updater since setStuffs type is (s: IUser[]) => void
  const handleUpdated = (updated: IUser) => {
    const newList = stuffs.map((s) => (s._id === updated._id ? updated : s));
    setStuffs(newList);
    if (selectedStuff && selectedStuff._id === updated._id) {
      setSelectedStuff(updated);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Staff Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
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
                  const accountStatus = getAccountStatus(user.isActive);
                  return (
                    <TableRow key={user._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-muted rounded-lg">
                            {user.avatar ? (
                              <img
                                src={resolveImage(user.avatar)}
                                className="w-12 h-12 rounded-full object-cover"
                                alt={user.fullname}
                              />
                            ) : (
                              <User className="h-5 w-5 text-muted-foreground" />
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
                        <Badge variant={accountStatus.variant}>
                          {accountStatus.icon}
                          {accountStatus.label}
                        </Badge>
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
                              onClick={() => toast("Assign task flow TBD")}
                            >
                              <ClipboardList className="h-4 w-4 mr-2" />
                              Assign Task
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(user)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(user)}
                              className="text-destructive focus:text-destructive"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Delete
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
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Rows per page:
              </span>
              <select
                className="border rounded-md px-2 py-1 text-sm"
                value={limit}
                onChange={(e) => {
                  const newLimit = Number(e.target.value);
                  setLimit(newLimit);
                  setCurrentPage(1);
                }}
              >
                {[5, 10, 20, 50].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Prev
              </Button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <StuffEditDialog
        stuff={selectedStuff}
        open={openEditDialog}
        onOpenChange={(o) => {
          if (!o) setSelectedStuff(null);
          setOpenEditDialog(o);
        }}
        onUpdated={handleUpdated}
      />
    </>
  );
}