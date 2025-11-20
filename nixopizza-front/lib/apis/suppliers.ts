import axiosAPI from "../axios.ts";

const apiURL = "/suppliers";

export const get_all_suppliers = async (params?: any): Promise<any> => {
  try {
    const customParamsSerializer = (params: any) => {
      const parts: string[] = [];
      for (const key in params) {
        if (Object.prototype.hasOwnProperty.call(params, key)) {
          const val = params[key];
          if (val !== null && typeof val !== "undefined") {
            if (Array.isArray(val) && val.length > 0) {
              parts.push(
                `${encodeURIComponent(key)}=${encodeURIComponent(val.join(","))}`
              );
            } else if (!Array.isArray(val)) {
              parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(val)}`);
            }
          }
        }
      }
      return parts.join("&");
    };
    const res = await axiosAPI.get(apiURL, {
      params,
      paramsSerializer: customParamsSerializer,
    });
    if (res.status === 200 && res.data) {
      return res.data;
    }
    throw res;
  } catch {
    throw Error("supplier (Get-All) : Something went wrong");
  }
};

export const get_supplier_by_id = async (id: string): Promise<any> => {
  try {
    const res = await axiosAPI.get<any>(`${apiURL}/${id}`);
    if (res.status === 200 && res.data) return res.data;
    throw res;
  } catch (err: any) {
    if (err.status === 404) throw 404;
    throw Error("suppliers (Get) : Something went wrong");
  }
};

export const create_supplier = async (supplierData: FormData): Promise<any> => {
  try {
    // Remove empty email entirely
    const email = supplierData.get("email");
    if (!email || String(email).trim() === "") supplierData.delete("email");

    const res = await axiosAPI.post<any>(apiURL, supplierData);
    if (res.status === 201 && res.data) {
      return res.data;
    }
    throw res.status;
  } catch (err: any) {
    const status = err.response?.status || err.status;
    if (status === 409) {
      throw Error("Email already in use");
    }
    throw Error(err.response?.data?.message || "suppliers (Create) : Something went wrong");
  }
};

export const updateSupplier = async (id: string, formData: FormData) => {
  try {
    const email = formData.get("email");
    if (!email || String(email).trim() === "") {
      formData.delete("email");
      formData.append("removeEmail", "true");
    }

    const {
      data: { supplier },
    } = await axiosAPI.put("/suppliers/" + id, formData);
    return { success: true, supplier };
  } catch (error: any) {
    const status = error.response?.status;
    if (status === 409) {
      return { success: false, message: "Email already in use" };
    }
    const message =
      error.response?.data?.message || "Failed to update supplier";
    return { success: false, message };
  }
};

export const deleteSupplier = async (id: string) => {
  try {
    const {
      data: { message },
    } = await axiosAPI.delete("/suppliers/" + id);
    return { success: true, message };
  } catch (error: any) {
    const message =
      error.response?.data?.message || "Failed to delete supplier";
    return { success: false, message };
  }
};