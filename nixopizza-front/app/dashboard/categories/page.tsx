"use client";
import { CategoryHeader } from "@/components/categories/category-header";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import CategoriesTable from "@/components/categories/category-table";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getCategories } from "@/lib/apis/categories";

export interface ICategory {
  _id: string;
  id: number;
  name: string;
  description: string;
  image: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    const fetchCategories = async () => {
      const { categories, success, message } = await getCategories({
        name: searchQuery,
      });
      setCategories(categories);
      if (!success) {
        toast.error(message);
      }
    };
    fetchCategories();
  }, [searchQuery]);
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <CategoryHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setCategories={setCategories}
        />
        <CategoriesTable
          searchQuery={searchQuery}
          categories={categories}
          setCategories={setCategories}
        />
      </div>
    </DashboardLayout>
  );
}
