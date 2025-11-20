import React from "react";
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
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { CategoryEditDialog } from "./category-edit-dialog";
import { deleteCategory } from "@/lib/apis/categories";
import toast from "react-hot-toast";

export interface ICategory {
  _id: string;
  name: string;
  description?: string;
  image: string;
  createdAt?: string;
  updatedAt?: string;
}

const resolveCategoryImage = (image?: string) => {
  if (!image) return "";
  return image.startsWith("http") ? image : process.env.NEXT_PUBLIC_BASE_URL + image;
};

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

  const filtered = searchQuery
    ? categories.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : categories;

  return (
    <div className="container mx-auto">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Categories</CardTitle>
        </CardHeader>
        <CardContent>
          {filtered.length > 0 ? (
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
                  {filtered.map((category) => (
                    <TableRow key={category._id} className="border-b">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <img
                            src={resolveCategoryImage(category.image)}
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
            <div className="text-sm text-muted-foreground">
              No categories found
            </div>
          )}
        </CardContent>
      </Card>

      {selectedCategory && (
        <CategoryEditDialog
          category={selectedCategory}
          open={openCategoryEdit}
          onOpenChange={setOpenCategoryEdit}
          setCategory={setCategoryOnChange}
        />
      )}
    </div>
  );
}