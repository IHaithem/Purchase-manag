import userStore, { IUser } from "@/store/user.store";

export const useAuth = () => userStore();

export const getAccessToken = () => {
  return userStore.getState().access_token;
};

export const setAccessToken = (access_token: string) => {
  userStore.getState().setAccessToken(access_token);
};

export const setProfile = (user: IUser) => {
  userStore.getState().setProfile(user);
};

export const login = (user: IUser, access_token: string) => {
  userStore.getState().login(user, access_token);
};

export const logout = () => {
  userStore.getState().logout();
};
