import axiosAPI from "../axios.ts";

// The axios categories curd logic

const apiURL = "v1/low-stock";

// get all categories with pagination
export const get_all_low_stock = async (): Promise<any> => {
  try {
    const res = await axiosAPI.get(apiURL);
    if ((res.status === 200, res.data)) {
      return res.data.data;
    } else {
      throw res;
    }
  } catch (err: any) {
    console.log("GET :", err);
    throw Error("low stock (Get-All) : Something went wrong");
  }
};
