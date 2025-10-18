import axiosAPI from "../axios.ts";

// ✅ Get all stuffs
export const getStuff = async (params?: { name?: string }) => {
  try {
    const {
      data: { staffs, total, pages },
    } = await axiosAPI.get("/admin/staffs", { params });
    return { success: true, staffs, total, pages };
  } catch (error: any) {
    console.error("Stuff error:", error);
    const message = error.response?.data?.message || "Failed to fetch Stuffs";
    return { success: false, message };
  }
};

// ✅ Get stuff by ID
export const getStuffById = async (id: string) => {
  try {
    const { data } = await axiosAPI.get(`/admin/staffs/${id}`);
    return { success: true, stuff: data?.stuff };
  } catch (error: any) {
    console.error("GetStuffById error:", error);
    const status = error.response?.status;
    if (status === 404) return { success: false, message: "Stuff not found" };
    const message =
      error.response?.data?.message || "Failed to fetch stuff by ID";
    return { success: false, message };
  }
};

// ✅ Create new stuff
export const createStuff = async (data: FormData) => {
  try {
    // Axios automatically sets Content-Type: multipart/form-data when sending FormData
    const response = await axiosAPI.post("/admin/staffs", data);
    return { success: true, staff: response.data.staff };
  } catch (error: any) {
    console.error("CreateStuff error:", error);
    const status = error.response?.status;
    if (status === 409) {
      return {
        success: false,
        message: "Staff with this email already exists",
      };
    }
    const message =
      error.response?.data?.message || "Failed to create staff member";
    return { success: false, message };
  }
};

// ✅ Update stuff
export const updateStuff = async (id: string, stuff: any) => {
  try {
    const { data } = await axiosAPI.put(`/admin/staffs/${id}`, stuff);
    return { success: true, stuff: data?.stuff };
  } catch (error: any) {
    console.error("UpdateStuff error:", error);
    const status = error.response?.status;
    if (status === 409)
      return { success: false, message: "Conflict: Stuff name already exists" };
    const message = error.response?.data?.message || "Failed to update Stuff";
    return { success: false, message };
  }
};

// ✅ Delete stuff
export const deleteStuff = async (id: string) => {
  try {
    await axiosAPI.delete(`/admin/staffs/${id}`);
    return { success: true };
  } catch (error: any) {
    console.error("DeleteStuff error:", error);
    const status = error.response?.status;
    if (status === 403)
      return {
        success: false,
        message: "Cannot delete: Stuff has submissions",
      };
    const message = error.response?.data?.message || "Failed to delete Stuff";
    return { success: false, message };
  }
};
