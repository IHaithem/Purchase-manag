// components/tasks/tasks-table.tsx
"use client";

import { useState } from "react";
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
  CheckCircle,
  XCircle,
  Eye,
  Calendar,
  Plus,
} from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import { ITask } from "@/app/dashboard/tasks/page";

interface TasksTableProps {
  tasks: ITask[];
  setTasks: any;
  totalPages: number;
  currentPage: number;
  setCurrentPage: any;
  limit: number;
  setLimit: any;
  onUpdateTask: (task: ITask) => void;
}

export function TasksTable({
  tasks,
  setTasks,
  totalPages,
  currentPage,
  setCurrentPage,
  limit,
  setLimit,
  onUpdateTask,
}: TasksTableProps) {
  const [selectedTask, setSelectedTask] = useState<ITask | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "secondary";
      case "completed":
        return "default";
      case "canceled":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const handleViewTask = (task: ITask) => {
    setSelectedTask(task);
    setIsViewDialogOpen(true);
  };

  const handleMarkAsCompleted = (taskId: string) => {
    console.log("Marking task as completed:", taskId);
    // Implement mark as completed logic
  };

  const handleCancelTask = (taskId: string) => {
    console.log("Canceling task:", taskId);
    // Implement cancel task logic
  };

  if (tasks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Tasks</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 p-3 bg-muted rounded-full">
            <Calendar className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-1">No tasks found</h3>
          <p className="text-muted-foreground mb-4">
            You don't have any tasks yet. Start by assigning a task.
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Assign Task
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Task Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task ID</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task._id}>
                    <TableCell>
                      <div className="font-mono font-medium">
                        {task.taskNumber}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            process.env.NEXT_PUBLIC_BASE_URL +
                            task.staffId.avatar
                          }
                          alt={task.staffId.fullname}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <div className="font-medium">
                            {task.staffId.fullname}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {task.staffId.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{task.items.length}</span>
                        <span className="text-muted-foreground text-sm ml-1">
                          items
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {new Date(task.deadline).toLocaleDateString("en-GB")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(task.status) as any}>
                        {task.status.charAt(0).toUpperCase() +
                          task.status.slice(1)}
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
                            onClick={() => handleViewTask(task)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {task.status === "pending" && (
                            <>
                              <DropdownMenuItem
                                onClick={() => handleMarkAsCompleted(task._id)}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Mark as Completed
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleCancelTask(task._id)}
                                className="text-destructive"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Cancel Task
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              Showing {tasks.length} of {totalPages * limit} tasks
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
      </Card>

      {/* Task Detail Dialog - You can implement this separately */}
      {/* <TaskDetailDialog
        task={selectedTask}
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        onUpdateTask={onUpdateTask}
      /> */}
    </>
  );
}
