import api from "../axios.ts";

// Login user
export const getMonthAnalytics = async () => {
  try {
    const {
      data: { data, summary },
    } = await api.get("/admin/analytics/monthly");
    return { success: true, data, summary };
  } catch (error: any) {
    console.error("Analytics error:", error);
    const message =
      error.response?.data?.message ||
      "Failed to fetch Analytics. Please try again.";
    return { success: false, message };
  }
};
