import api from "../axios.ts";

export const getOrders = async (params?: any) => {
  try {
    const {
      data: { orders, pages },
    } = await api.get("/orders", { params });
    return { success: true, orders, pages };
  } catch (error: any) {
    console.error("Order error:", error);
    const message = error.response?.data?.message || "Failed to fetch orders";
    return { success: false, message };
  }
};

export const getOrdersStats = async () => {
  try {
    const {
      data: { pendingOrders, confirmedOrders, paidOrders, totalValue },
    } = await api.get("/orders/stats");
    return {
      success: true,
      pendingOrders,
      confirmedOrders,
      paidOrders,
      totalValue,
    };
  } catch (error: any) {
    console.error("Order error:", error);
    const message = error.response?.data?.message || "Failed to fetch orders";
    return { success: false, message };
  }
};

export const createOrder = async (data: any) => {
  try {
    const {
      data: { order },
    } = await api.post("/orders", data);
    return { success: true, order };
  } catch (error: any) {
    console.error("Order error:", error);
    const message = error.response?.data?.message || "Failed to create order";
    return { success: false, message };
  }
};

export const updateOrder = async (orderId: string, formData: any) => {
  try {
    const {
      data: { order },
    } = await api.put("/orders/" + orderId, formData);
    return { success: true, order };
  } catch (error: any) {
    console.error("Order error:", error);
    const message = error.response?.data?.message || "Failed to create order";
    return { success: false, message };
  }
};
