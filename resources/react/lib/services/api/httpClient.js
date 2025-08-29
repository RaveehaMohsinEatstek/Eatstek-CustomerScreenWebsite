import axios from "axios";

const ErrorCodeMessages = {
  403: "Access Forbidden",
  404: "Resource or page not found",
  500: "Internal Server Error",
};

// Define URLs
// export const LIVE_URL = "https://chb.eatstekltd.co.uk";
export const LIVE_URL = `https://${import.meta.env.VITE_API_BASE_URL}`;

export const createHttpClient = (useLocal = false) => {
  return axios.create({
    baseURL: LIVE_URL,
  });
};

const httpClient = createHttpClient(true);

httpClient.interceptors.response.use(
  (response) => {
    const subStatus = response?.data?.subscription_status;
    if (subStatus) {
      const { is_active, days_left, message } = subStatus;
      if (!is_active || days_left <= 1) {
        const event = new CustomEvent("showSubscriptionAlert", {
          detail: {
            message:
              message ||
              (!is_active
                ? "Your subscription has expired. Please renew to continue service."
                : "Your subscription is expiring soon! Renew to avoid interruption."),
            severity: !is_active ? "error" : "warning",
          },
        });
        window.dispatchEvent(event);
      }
    }
    return response;
  },
  (error) => {
    if (error?.response?.status === 451) {
      const event = new CustomEvent('showSubscriptionBlock', {
        detail: {
          message: "Your subscription has been blocked. Please contact support."
        }
      });
      window.dispatchEvent(event);
      
      return new Promise(() => {});
    }

    const status = error?.response?.status;
    const errorMessage =
      status && ErrorCodeMessages[status]
        ? ErrorCodeMessages[status]
        : error.response?.data?.message || error.message || "Unknown error";

    return Promise.reject(errorMessage);
  }
);

export default httpClient;