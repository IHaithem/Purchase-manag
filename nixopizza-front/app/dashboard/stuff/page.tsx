// app/dashboard/stuff/page.tsx
"use client";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StuffHeader } from "@/components/stuff/stuff-header";
import { StuffTable } from "@/components/stuff/stuff-table";
import { getStuff } from "@/lib/apis/stuff";
import { IUser } from "@/store/user.store";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function AlertsPage() {
  const [stuffs, setStuffs] = useState<IUser[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchStuff = async () => {
      const params: any = {
        page: currentPage,
        limit,
      };

      if (searchQuery) {
        params.name = searchQuery;
      }

      const { success, staffs, pages, message } = await getStuff(params);
      if (success) {
        setStuffs(staffs);
        setTotalPages(pages);
      } else {
        toast.error(message);
      }
    };
    fetchStuff();
  }, [currentPage, limit, searchQuery]);

  const addNewStuff = (newStuff: IUser) => {
    setStuffs([...stuffs, newStuff]);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <StuffHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          addNewStuff={addNewStuff}
        />
        <StuffTable
          stuffs={stuffs}
          setStuffs={setStuffs}
          totalPages={totalPages}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          limit={limit}
          setLimit={setLimit}
        />
      </div>
    </DashboardLayout>
  );
}
