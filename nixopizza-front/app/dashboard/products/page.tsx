"use client";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ProductsTable } from "@/components/products/products-table";
import { ProductsHeader } from "@/components/products/products-header";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getProducts } from "@/lib/apis/products";
import { ICategory } from "../categories/page";

export interface IProduct {
  _id: string;
  name: string;
  barcode: string;
  unit: string;
  categoryId: {
    _id: string;
    name: string;
    image: string;
  };
  imageUrl: string;
  currentStock: number;
  minQty: number;
  maxQty: number;
  createdAt?: Date;
  updatedAt?: Date;
}
export default function ProductsPage() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [sort, setSort] = useState({ sortBy: "name", order: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10);
  useEffect(() => {
    const fecthProducts = async () => {
      const { products, pages, message, success } = await getProducts({
        limit,
        page: currentPage,
        categoryId,
        name: search,
        ...sort,
      });
      if (success) {
        setProducts(products);
        setTotalPages(pages);
      } else {
        toast.error(message);
      }
    };
    fecthProducts();
  }, [limit, currentPage, search, categoryId, sort]);
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <ProductsHeader
          onSearchChange={setSearch}
          onCategoryChange={setCategoryId}
          onSortChange={setSort}
        />
        <ProductsTable
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
          currentPage={currentPage}
          products={products}
          setProducts={setProducts}
          limit={limit}
          setLimit={setLimit}
        />
      </div>
    </DashboardLayout>
  );
}
