import axiosAPI from "../axios.ts";

// Get orders with filters
export const getOrders = async (params?: any) => {
  try {
    const { data } = await axiosAPI.get("/orders", { params });
    return { success: true, orders: data.orders, pages: data.pages, total: data.total };
  } catch (error: any) {
    const message = error.response?.data?.message || "Failed to fetch orders";
    return { success: false, message };
  }
};

// Create order
export const createOrder = async (formData: FormData) => {
  try {
    const { data } = await axiosAPI.post("/orders", formData);
    return { success: true, order: data.order };
  } catch (error: any) {
    const message = error.response?.data?.message || "Failed to create order";
    return { success: false, message };
  }
};

// Assign order
export const assignOrder = async (orderId: string, staffId: string) => {
  try {
    const { data } = await axiosAPI.post(`/orders/${orderId}/assign`, { staffId });
    return { success: true, order: data.order };
  } catch (error: any) {
    const message = error.response?.data?.message || "Failed to assign order";
    return { success: false, message };
  }
};

// Explicit confirm (with bill)
export const confirmOrder = async (orderId: string, formData: FormData) => {
  try {
    const { data } = await axiosAPI.post(`/orders/${orderId}/confirm`, formData);
    return { success: true, order: data.order };
  } catch (error: any) {
    const message = error.response?.data?.message || "Failed to confirm order";
    return { success: false, message };
  }
};

// Generic update (paid, canceled, expectedDate changes, fallback confirmation)
export const updateOrder = async (orderId: string, body: any | FormData) => {
  try {
    const isFormData = body instanceof FormData;
    const { data } = await axiosAPI.put(
      `/orders/${orderId}`,
      body,
      isFormData
        ? { headers: { "Content-Type": "multipart/form-data" } }
        : undefined
    );
    return { success: true, order: data.order };
  } catch (error: any) {
    const message = error.response?.data?.message || "Failed to update order";
    return { success: false, message };
  }
};

// Stats (404 fix)
export const getOrderStats = async () => {
  try {
    const { data } = await axiosAPI.get("/orders/stats");
    return { success: true, stats: data };
  } catch (error: any) {
    const message = error.response?.data?.message || "Failed to fetch order stats";
    return { success: false, message };
  }
};