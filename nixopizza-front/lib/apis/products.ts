import { IProduct } from "@/app/dashboard/products/page.jsx";
import api from "../axios.ts";

// Login user
export const createProduct = async (formData: FormData) => {
  try {
    const {
      data: { product },
    } = await api.post("/products", formData);
    return { success: true, product };
  } catch (error: any) {
    console.error("Product error:", error);
    const message = error.response?.data?.message || "Failed to create product";
    return { success: false, message };
  }
};

// Logout user
export const getProducts = async (params?: any) => {
  try {
    const {
      data: { products, total, pages },
    } = await api.get("/products", { params });
    return { success: true, products, total, pages };
  } catch (error: any) {
    console.error("products error:", error);
    const message = error.response?.data?.message || "Failed to fetch Products";
    return { success: false, message };
  }
};

export const getProduct = async (productId: string) => {
  try {
    const {
      data: { product },
    } = await api.get("/products/" + productId);
    return { success: true, product };
  } catch (error: any) {
    console.error("product error:", error);
    const message = error.response?.data?.message || "Failed to fetch Product";
    return { success: false, message };
  }
};

// Update profile
export const updateProduct = async (productId: string, formData: FormData) => {
  try {
    console.log("Updating product with ID:", formData);
    const {
      data: { message, product },
    } = await api.put(`/products/${productId}`, formData);
    return { success: true, message, product };
  } catch (error: any) {
    console.error("Product error:", error);
    const message = error.response?.data?.message || "Failed to update Product";
    return { success: false, message };
  }
};

export interface LowStockResponse {
  summary: {
    critical: number;
    high: number;
    medium: number;
    total: number;
  };
  critical: IProduct[];
  high: IProduct[];
  medium: IProduct[];
}

export const getLowStockProducts = async (params?: {
  name?: string;
  status?: "critical" | "high" | "medium";
}) => {
  try {
    const { data } = await api.get("/products/low", { params });

    return {
      success: true as const,
      summary: data.summary,
      products: [...data.critical, ...data.high, ...data.medium],
    };
  } catch (error: any) {
    return {
      success: false as const,
      message: error.response?.data?.message || "Failed to fetch products",
    };
  }
};

export const getOverStockProducts = async () => {
  try {
    const {
      data: { count, products },
    } = await api.get("/products/over");
    return { success: true, count, products };
  } catch (error: any) {
    console.error("product error:", error);
    const message =
      error.response?.data?.message || "Failed to fetch Over Stock Products";
    return { success: false, message };
  }
};

export const deleteProduct = async (productId: string) => {
  try {
    const {
      data: { message },
    } = await api.delete(`/products/${productId}`);
    return { success: true, message };
  } catch (error: any) {
    console.error("Product error:", error);
    const message = error.response?.data?.message || "Failed to delete Product";
    return { success: false, message };
  }
};
