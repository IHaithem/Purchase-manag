import { login, logout } from "@/hooks/useAuth";
import api from "../axios.ts";

// Login user
export const getCategories = async (params?: { name: string }) => {
  try {
    const {
      data: { categories },
    } = await api.get("/categories", { params });
    return { success: true, categories };
  } catch (error: any) {
    console.error("Categories error:", error);
    const message =
      error.response?.data?.message || "Failed to fetch Categories";
    return { success: false, message };
  }
};

// Logout user
export const createCategory = async (formData: FormData) => {
  try {
    const {
      data: { category },
    } = await api.post("/categories", formData);
    return { success: true, category };
  } catch (error: any) {
    console.error("Category error:", error);
    const message =
      error.response?.data?.message || "Failed to ctreate Category";
    return { success: false, message };
  }
};

// Update profile
export const updateCategory = async (
  categoryId: string,
  formData: FormData
) => {
  try {
    const {
      data: { message, category },
    } = await api.put("/categories/" + categoryId, formData);
    return { success: true, message, category };
  } catch (error: any) {
    console.error("Category error:", error);
    const message =
      error.response?.data?.message || "Failed to update Category";
    return { success: false, message };
  }
};

// Delete profile
export const deleteCategory = async (categoryId: string) => {
  try {
    await api.delete("/categories/" + categoryId);
    return { success: true };
  } catch (error: any) {
    console.error("Category error:", error);
    const message =
      error.response?.data?.message || "Failed to delete Category";
    return { success: false, message };
  }
};
