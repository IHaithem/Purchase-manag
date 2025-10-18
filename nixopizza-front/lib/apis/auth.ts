import { login, logout } from "@/hooks/useAuth";
import api from "../axios.ts";

// Login user
export const loginUser = async (formData: {
  email: string;
  password: string;
}) => {
  try {
    const {
      data: { user, access_token },
    } = await api.post("/auth/login", formData);
    login(user, access_token);
    return { success: true, user };
  } catch (error: any) {
    console.error("Login error:", error);
    const message =
      error.response?.data?.message || "Failed to login. Please try again.";
    return { success: false, message };
  }
};

// Logout user
export const logoutUser = async () => {
  try {
    await api.post("/auth/logout");
  } catch (error: any) {
    console.error("Logout error:", error);
  } finally {
    logout();
  }
};

// Update profile
export const updateProfile = async (formData: {
  password: string;
  newPassword: string;
}) => {
  try {
    const {
      data: { message },
    } = await api.put("/auth/profile", formData);
    return { success: true, message };
  } catch (error: any) {
    console.error("Update profile error:", error);
    const message =
      error.response?.data?.message || "Failed to update profile.";
    return { success: false, message };
  }
};
