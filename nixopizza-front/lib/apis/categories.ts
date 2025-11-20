import api from "../axios.ts";

export const getCategories = async (params?: { name?: string }) => {
  try {
    const {
      data: { categories },
    } = await api.get("/categories", { params });
    return { success: true, categories };
  } catch (error: any) {
    const message =
      error.response?.data?.message || "Failed to fetch Categories";
    return { success: false, message };
  }
};

export const createCategory = async (formData: FormData) => {
  try {
    const {
      data: { category },
    } = await api.post("/categories", formData);
    return { success: true, category };
  } catch (error: any) {
    const status = error.response?.status;
    if (status === 409) {
      return { success: false, message: "Category name must be unique" };
    }
    const message =
      error.response?.data?.message || "Failed to create Category";
    return { success: false, message };
  }
};

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
    const status = error.response?.status;
    if (status === 409) {
      return { success: false, message: "Category name must be unique" };
    }
    const message =
      error.response?.data?.message || "Failed to update Category";
    return { success: false, message };
  }
};

export const deleteCategory = async (categoryId: string) => {
  try {
    await api.delete("/categories/" + categoryId);
    return { success: true };
  } catch (error: any) {
    const message =
      error.response?.data?.message || "Failed to delete Category";
    return { success: false, message };
  }
};