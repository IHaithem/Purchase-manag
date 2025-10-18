// import { AxiosInstance } from "axios";
// import axiosRetry from "axios-retry";

// // Status to retry
// export const statusRetry = [408, 425, 429, 500, 502, 503, 504];

// // Here's the retry logic built with axios-retry

// function handleRetryLogic(axios: AxiosInstance): AxiosInstance {
//   // handle the logic with axios-retry
//   axiosRetry(axios, {
//     // times
//     retries: 5,
//     //
//     shouldResetTimeout: true,
//     // delay
//     retryDelay: (count, error) => {
//       // if network error
//       if (error.code == "ERR_NETWORK" && count == 1)
//         return 400; // => 800ms to retry
//       else return 50; // 50ms to retry
//     },
//     // condition
//     retryCondition: (error) => {
//       const config = error.config;

//       // Check if retry is disabled for this request
//       if (config && (config as any)?.shouldRetry === false) {
//         return false; // Skip retry
//       }

//       // Retry for network errors or timeout errors
//       if (error.code === "ERR_NETWORK" || error.code === "ECONNABORTED") {
//         return true;
//       }

//       // Retry for specific HTTP status codes
//       if (
//         error.response?.status &&
//         statusRetry.includes(error.response.status)
//       ) {
//         return true;
//       }

//       return false; // Do not retry for other cases
//     },
//     // when retry
//     onRetry: (count) => {
//       console.log("retrying-time", count);
//     },
//   });

//   return axios;
// }

// export default handleRetryLogic;

// retry.ts
import { AxiosInstance } from "axios";
import axiosRetry from "axios-retry";

// Status to retry
export const statusRetry = [408, 425, 429, 500, 502, 503, 504];

// Here's the retry logic built with axios-retry
function handleRetryLogic(axios: AxiosInstance): AxiosInstance {
  // handle the logic with axios-retry
  axiosRetry(axios, {
    // times
    retries: 5,
    //
    shouldResetTimeout: true,
    // delay
    retryDelay: (count, error) => {
      // if network error
      if (error.code == "ERR_NETWORK" && count == 1)
        return 400; // => 800ms to retry
      else return 50; // 50ms to retry
    },
    // condition
    retryCondition: (error) => {
      const config = error.config;

      // Check if retry is disabled for this request
      if (config && (config as any)?.shouldRetry === false) {
        return false; // Skip retry
      }

      // Don't retry auth refresh requests to avoid infinite loops
      if (config && config.url?.includes("/auth/refresh")) {
        return false;
      }

      // Retry for network errors or timeout errors
      if (error.code === "ERR_NETWORK" || error.code === "ECONNABORTED") {
        return true;
      }

      // Retry for specific HTTP status codes
      if (
        error.response?.status &&
        statusRetry.includes(error.response.status)
      ) {
        return true;
      }

      return false; // Do not retry for other cases
    },
    // when retry
    onRetry: (count) => {
      console.log("retrying-time", count);
    },
  });

  return axios;
}

export default handleRetryLogic;
