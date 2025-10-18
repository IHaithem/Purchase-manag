"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MoreHorizontal,
  Plus,
  Laptop,
  Sofa,
  Shirt,
  Shapes,
  Edit,
  Trash2,
  Package,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CategoryEditDialog } from "./category-edit-dialog";
import { deleteCategory } from "@/lib/apis/categories";
import toast from "react-hot-toast";
import { ICategory } from "@/app/dashboard/categories/page";

export default function CategoriesTable({
  categories,
  setCategories,
  searchQuery,
}: {
  categories: ICategory[];
  setCategories: any;
  searchQuery: string;
}) {
  const [openCategoryEdit, setOpenCategoryEdit] = React.useState(false);
  const [selectedCategory, setSelectedCategory] =
    React.useState<ICategory | null>(null);
  const handleEdit = (category: ICategory) => {
    setOpenCategoryEdit(true);
    setSelectedCategory(category);
  };
  const handleDelete = async (categoryId: string) => {
    const { success, message } = await deleteCategory(categoryId);

    if (success) {
      toast.success("Category Deleted Successfully");
      setCategories(categories.filter((cat) => cat._id !== categoryId));
    } else {
      toast.error(message);
    }
  };

  const setCategoryOnChange = (category: ICategory) => {
    setCategories(
      categories.map((cat) => (cat._id === category._id ? category : cat))
    );
  };

  const isFiltered = searchQuery;

  return (
    <div className="container mx-auto">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Categories</CardTitle>
        </CardHeader>
        <CardContent>
          {categories.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="border-b">
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id} className="border-b">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              process.env.NEXT_PUBLIC_BASE_URL + category.image
                            }
                            alt={category.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />

                          <div>{category.name}</div>
                        </div>
                      </TableCell>
                      <TableCell>{category.description}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleEdit(category)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(category._id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            // Empty state component
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 p-3 bg-muted rounded-full">
                <Package className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-1">
                {isFiltered ? "No categories found" : "No categories yet"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {isFiltered
                  ? "You don't have any categories with this filtration."
                  : "You don't have any categories yet. Start by creating one."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      <CategoryEditDialog
        open={openCategoryEdit}
        onOpenChange={setOpenCategoryEdit}
        category={selectedCategory}
        setCategory={setCategoryOnChange}
      />
    </div>
  );
}
