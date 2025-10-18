// app/dashboard/suppliers/page.tsx
"use client";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { SuppliersTable } from "@/components/suppliers/suppliers-table";
import { SuppliersHeader } from "@/components/suppliers/suppliers-header";
import { useEffect, useState } from "react";
import { get_all_suppliers } from "@/lib/apis/suppliers";

export interface ISupplier {
  _id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  categoryIds: string[];
  image: string;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<ISupplier[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [sort, setSort] = useState({ sortBy: "name", order: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10);

  const onAdding = (newSupplier: ISupplier) => {
    setSuppliers((prev) => [newSupplier, ...prev]);
  };

  useEffect(() => {
    const fetchSuppliers = async () => {
      const response = await get_all_suppliers({
        name: search,
        status,
        categoryIds,
        page: currentPage,
        limit,
        ...sort,
      });

      if (response) {
        const { suppliers, pages } = response;
        setTotalPages(pages);

        if (suppliers) {
          setSuppliers(suppliers);
        } else {
          console.log("zaz (pas de suppliers)");
        }
      } else {
        console.error("get_all_suppliers() a retourné undefined !");
      }
    };

    fetchSuppliers();
  }, [search, currentPage, limit, totalPages, status, categoryIds, sort]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <SuppliersHeader
          onAdding={onAdding}
          onSearchChange={setSearch}
          onStatusChange={setStatus}
          onSortChange={setSort}
          onCategoryChange={setCategoryIds}
        />
        <SuppliersTable
          totalPages={totalPages}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          limit={limit}
          setLimit={setLimit}
          suppliers={suppliers}
          setSuppliers={setSuppliers}
        />
      </div>
    </DashboardLayout>
  );
}
