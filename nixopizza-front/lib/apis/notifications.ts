import axiosAPI from "../axios.ts";

// The axios notifications curd logic

const apiURL = "v1/notifications";

// get all notifications with pagination
export const get_all_notifications = async (): Promise<any> => {
  try {
    const res = await axiosAPI.get(apiURL);
    if ((res.status === 200, res.data)) {
      return res.data.data;
    } else {
      throw res;
    }
  } catch (err: any) {
    console.log("GET :", err);
    throw Error("notification (Get-All) : Something went wrong");
  }
};

// get notification by id
export const get_notification_by_id = async (id: string): Promise<any> => {
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
    throw Error("notifications (Get) : Something went wrong");
  }
};

// Create notification
export const create_notification = async (
  notification: any
): Promise<any> => {
  try {
    const res = await axiosAPI.post<any>(apiURL, notification);
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
    throw Error("notifications (Create) : Something went wrong");
  }
};

// Update notification
export const update_notification = async (
  id: string,
  notification: any
): Promise<any> => {
  try {
    const res = await axiosAPI.put<any>(`${apiURL}/${id}`, notification);
    if (res.status == 200 && res.data) {
      return res.data;
    } else {
      throw res.status;
    }
  } catch (err: any) {
    if (err.status == 409) {
      throw 409; // conflict in the name
    }
    console.log("UPDATE :", err);
    throw Error("notifications (Update) : Something went wrong");
  }
};

// Delete notification
export const delete_notification = async (id: string): Promise<200> => {
  try {
    const res = await axiosAPI.delete(`${apiURL}/${id}`);
    if (res.status == 200) {
      return 200;
    } else {
      throw res.status;
    }
  } catch (err: any) {
    if (err.status == 403) {
      throw 403; // notification has submissions
    }
    console.log("DELETE :", err);
    throw Error("notifications (Delete) : Something went wrong");
  }
};

