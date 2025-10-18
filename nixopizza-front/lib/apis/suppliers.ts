import axiosAPI from "../axios.ts";

// The axios suppliers curd logic

const apiURL = "/suppliers";

export const get_all_suppliers = async (params?: any): Promise<any> => {
  try {
    const customParamsSerializer = (params: any) => {
      const parts: string[] = [];

      for (const key in params) {
        if (params.hasOwnProperty(key)) {
          const val = params[key];

          if (val !== null && typeof val !== "undefined") {
            if (Array.isArray(val)) {
              if (key === "categoryIds" && val.length > 0) {
                parts.push(
                  `${encodeURIComponent(key)}=${encodeURIComponent(
                    val.join(",")
                  )}`
                );
              } else if (val.length > 0) {
                parts.push(
                  `${encodeURIComponent(key)}=${encodeURIComponent(
                    val.join(",")
                  )}`
                );
              }
            } else {
              parts.push(
                `${encodeURIComponent(key)}=${encodeURIComponent(val)}`
              );
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

    if ((res.status === 200, res.data)) {
      return res.data;
    } else {
      throw res;
    }
  } catch (err: any) {
    console.log("GET :", err);
    throw Error("supplier (Get-All) : Something went wrong");
  }
};

// get supplier by id
export const get_supplier_by_id = async (id: string): Promise<any> => {
  try {
    const res = await axiosAPI.get<any>(`${apiURL}/${id}`);
    if (res.status == 200 && res.data) {
      return res.data;
    } else {
      throw res;
    }
  } catch (err: any) {
    if (err.status == 404) {
      throw 404;
    }
    throw Error("suppliers (Get) : Something went wrong");
  }
};

// Create supplier
export const create_supplier = async (supplier: any): Promise<any> => {
  try {
    const res = await axiosAPI.post<any>(apiURL, supplier);
    if (res.status == 201 && res.data) {
      return res.data;
    } else {
      throw res.status;
    }
  } catch (err: any) {
    if (err.status == 409) {
      throw 409; // conflict in the name
    }
    console.log("CREATE :", err);
    throw Error("suppliers (Create) : Something went wrong");
  }
};

// Update supplier
export const updateSupplier = async (id: string, formData: FormData) => {
  try {
    const {
      data: { supplier },
    } = await axiosAPI.put("/suppliers/" + id, formData);
    return { success: true, supplier };
  } catch (error: any) {
    console.error("Supplier error:", error);
    const message =
      error.response?.data?.message || "Failed to update supplier";
    return { success: false, message };
  }
};

// Delete supplier
export const deleteSupplier = async (id: string) => {
  try {
    const {
      data: { message },
    } = await axiosAPI.delete("/suppliers/" + id);
    return { success: true, message };
  } catch (error: any) {
    console.error("Supplier error:", error);
    const message =
      error.response?.data?.message || "Failed to delete supplier";
    return { success: false, message };
  }
};
