"use client";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ProductsTable } from "@/components/products/products-table";
import { ProductsHeader } from "@/components/products/products-header";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getProducts, deleteProduct } from "@/lib/apis/products"; // ensure deleteProduct exists
import { useRouter } from "next/navigation";

export interface IProduct {
  _id: string;
  name: string;
  barcode?: string;
  unit: string;
  categoryId: {
    _id: string;
    name: string;
    image: string;
  };
  imageUrl: string;
  description?: string;
  currentStock: number;
  minQty: number;
  recommendedQty: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ProductsTableProps {
  products: IProduct[];
  onEdit: (p: IProduct) => void;
  onDelete: (id: string) => Promise<void>;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [sort, setSort] = useState({ sortBy: "name", order: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10);
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
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
    fetchProducts();
  }, [limit, currentPage, search, categoryId, sort]);

  const handleEdit = (p: any) => {
    router.push(`/dashboard/products/edit/${p._id}`);
  };

  const handleDelete = async (id: string) => {
    const { success, message } = await deleteProduct(id);
    if (success) {
      toast.success("Product deleted");
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } else {
      toast.error(message);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <ProductsHeader
          onSearchChange={setSearch}
          onCategoryChange={setCategoryId}
          onSortChange={setSort}
        />
        {/* You can later add pagination controls using currentPage/totalPages */}
        <ProductsTable
          products={products}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </DashboardLayout>
  );
}