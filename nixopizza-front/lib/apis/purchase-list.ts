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

// New: submit for review (assigned -> pending_review) with bill and total
export const submitForReview = async (orderId: string, formData: FormData) => {
  try {
    const { data } = await axiosAPI.post(`/orders/${orderId}/review`, formData);
    return { success: true, order: data.order };
  } catch (error: any) {
    const message = error.response?.data?.message || "Failed to submit for review";
    return { success: false, message };
  }
};

// New: verify (pending_review -> verified)
export const verifyOrder = async (orderId: string) => {
  try {
    const { data } = await axiosAPI.post(`/orders/${orderId}/verify`);
    return { success: true, order: data.order };
  } catch (error: any) {
    const message = error.response?.data?.message || "Failed to verify order";
    return { success: false, message };
  }
};

// New: paid (verified -> paid)
export const markOrderPaid = async (orderId: string) => {
  try {
    const { data } = await axiosAPI.put(`/orders/${orderId}`, { status: "paid" });
    return { success: true, order: data.order };
  } catch (error: any) {
    const message = error.response?.data?.message || "Failed to mark order paid";
    return { success: false, message };
  }
};

// Generic update (kept for other fields like expectedDate or cancel)
export const updateOrder = async (orderId: string, body: any | FormData) => {
  try {
    const isFormData = body instanceof FormData;
    const { data } = await axiosAPI.put(`/orders/${orderId}`, body, {
      headers: isFormData ? { "Content-Type": "multipart/form-data" } : {},
    });
    return { success: true, order: data.order };
  } catch (error: any) {
    const message = error.response?.data?.message || "Failed to update order";
    return { success: false, message };
  }
};

// Stats
export const getOrdersStats = async () => {
  try {
    const { data } = await axiosAPI.get("/orders/stats");
    return { success: true, ...data };
  } catch (error: any) {
    const message = error.response?.data?.message || "Failed to fetch order stats";
    return { success: false, message };
  }
};