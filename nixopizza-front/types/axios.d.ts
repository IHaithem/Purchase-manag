// types/axios.d.ts
import "axios";

declare module "axios" {
  export interface AxiosRequestConfig {
    shouldRetry?: boolean;
    _retry?: boolean; // also useful since you're using _retry
  }
}
