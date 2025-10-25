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
      data: {
        notAssignedOrders,
        assignedOrders,
        confirmedOrders,
        paidOrders,
        totalValue,
      },
    } = await api.get("/orders/stats");

    return {
      success: true,
      notAssignedOrders,
      assignedOrders,
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

export const assignOrder = async (orderId: string, staffId: string) => {
  try {
    const { data } = await api.post(`/orders/${orderId}/assign`, { staffId });
    return { success: true, order: data.order };
  } catch (error: any) {
    console.error("Assign order error:", error);
    const message = error.response?.data?.message || "Failed to assign order";
    return { success: false, message };
  }
};


export const confirmOrder = async (
  orderId: string,
  formData: FormData
) => {
  try {
    const { data } = await api.post(`/orders/${orderId}/confirm`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return { success: true, order: data.order };
  } catch (error: any) {
    console.error("Confirm order error:", error);
    const message = error.response?.data?.message || "Failed to confirm order";
    return { success: false, message };
  }
};


