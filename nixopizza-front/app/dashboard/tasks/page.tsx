// app/dashboard/tasks/page.tsx
"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { TasksHeader } from "@/components/tasks/tasks-header";
import { TasksTable } from "@/components/tasks/tasks-table";
import { getTasks } from "@/lib/apis/task";
import { useEffect, useState } from "react";

import toast from "react-hot-toast";

export interface ITask {
  _id: string;
  taskNumber: string;
  staffId: {
    _id: string;
    fullname: string;
    email: string;
    avatar: string;
  };
  items: {
    productId: {
      _id: string;
      name: string;
      imageUrl: string;
    };
    quantity: number;
  }[];
  status: "pending" | "completed" | "canceled";
  deadline: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState({ sortBy: "createdAt", order: "desc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const params: any = {
          taskNumber: search,
          page: currentPage,
          limit,
          sortBy: sort.sortBy,
          order: sort.order,
        };

        // Only add status if it's not "all"
        if (status !== "all") {
          params.status = status;
        }

        const { tasks, success, message, pages } = await getTasks(params);

        if (success) {
          setTasks(tasks || []);
          setTotalPages(pages || 1);
        } else {
          toast.error(message || "Failed to fetch tasks");
        }
      } catch (error: any) {
        toast.error("Failed to fetch tasks");
        console.error("Error fetching tasks:", error);
      }
    };

    fetchTasks();
  }, [search, status, sort, currentPage, limit]);

  const handleUpdateTask = (updatedTask: ITask) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task._id === updatedTask._id ? updatedTask : task
      )
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <TasksHeader
          onSearchChange={setSearch}
          onStatusChange={setStatus}
          onSortChange={setSort}
        />
        <TasksTable
          tasks={tasks}
          setTasks={setTasks}
          totalPages={totalPages}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          limit={limit}
          setLimit={setLimit}
          onUpdateTask={handleUpdateTask}
        />
      </div>
    </DashboardLayout>
  );
}
