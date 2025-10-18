import axiosAPI from "../axios.ts";

// ✅ Get all stuffs
export const createTask = async (taskData: any) => {
  try {
    const {
      data: { task },
    } = await axiosAPI.post("/tasks", taskData);
    return { success: true, task };
  } catch (error: any) {
    console.error("Task error:", error);
    const message = error.response?.data?.message || "Failed to create Task";
    return { success: false, message };
  }
};

// ✅ Get all stuffs
export const getTasks = async (params?: any) => {
  try {
    const {
      data: { tasks, pages },
    } = await axiosAPI.get("/tasks", { params });
    return { success: true, tasks, pages };
  } catch (error: any) {
    console.error("Tasks error:", error);
    const message = error.response?.data?.message || "Failed to fetch Tasks";
    return { success: false, message };
  }
};
