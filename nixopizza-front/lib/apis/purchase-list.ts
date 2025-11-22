import axiosAPI from "../axios.ts";

export const getOrders = async (params?: any) => {
  try {
    const { data } = await axiosAPI.get("/orders", { params });
    return { success: true, orders: data.orders, pages: data.pages, total: data.total };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Failed to fetch orders" };
  }
};

export const createOrder = async (formData: FormData) => {
  try {
    const { data } = await axiosAPI.post("/orders", formData);
    return { success: true, order: data.order };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Failed to create order" };
  }
};

export const assignOrder = async (orderId: string, staffId: string) => {
  try {
    const { data } = await axiosAPI.post(`/orders/${orderId}/assign`, { staffId });
    return { success: true, order: data.order };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Failed to assign order" };
  }
};

// Step 1: assigned -> pending_review
export const submitForReview = async (orderId: string, formData: FormData) => {
  try {
    const { data } = await axiosAPI.post(`/orders/${orderId}/review`, formData);
    return { success: true, order: data.order };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Failed to submit for review" };
  }
};

// Backward compatibility alias (OLD confirm)
export const confirmOrder = async (orderId: string, formData: FormData) => {
  return await submitForReview(orderId, formData);
};

// Step 2: pending_review -> verified
export const verifyOrder = async (orderId: string) => {
  try {
    const { data } = await axiosAPI.post(`/orders/${orderId}/verify`);
    return { success: true, order: data.order };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Failed to verify order" };
  }
};

// Step 3: verified -> paid
export const markOrderPaid = async (orderId: string) => {
  try {
    const { data } = await axiosAPI.put(`/orders/${orderId}`, { status: "paid" });
    return { success: true, order: data.order };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Failed to mark paid" };
  }
};

// Generic update (expectedDate, cancel, etc.)
export const updateOrder = async (orderId: string, body: any | FormData) => {
  try {
    const isFormData = body instanceof FormData;
    const { data } = await axiosAPI.put(`/orders/${orderId}`, body, {
      headers: isFormData ? { "Content-Type": "multipart/form-data" } : {},
    });
    return { success: true, order: data.order };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Failed to update order" };
  }
};

// Stats
export const getOrdersStats = async () => {
  try {
    const { data } = await axiosAPI.get("/orders/stats");
    return { success: true, ...data };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Failed to fetch order stats" };
  }
};