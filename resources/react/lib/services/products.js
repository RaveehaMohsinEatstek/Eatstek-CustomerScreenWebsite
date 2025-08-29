import httpClient from "./api/httpClient";
import { createHttpClient } from "./api/httpClient";

const localClient = createHttpClient(true);
const liveClient = createHttpClient(false);

// const ipClient = createHttpClient(true);
function ProductService() {
  return {
    getOrdersList: (values) => {
      return httpClient.get(`/api/order-screen`);
    },
    getBranchDetails: () => {
      return httpClient.get("/api/branches");
    },
    allCatelogs: (isLive = true) => {
      const client = isLive ? liveClient : localClient;
      return client.get("/api/get-catalog");
    },
    getPendingCompleteOrders: () => {
      return httpClient.get("/api/get-pending-complete-orders");
    },
    finalizeOrder: (values) => {
      return httpClient.post(`/api/finalizeOrder`, values);
    },
    updateOrderStatus: (values) => {
      return httpClient.post(`/api/update-order-status`, values);
    },
    OrderStatusChange: (values) => {
      return httpClient.post(`/api/change-order-status`, values);
    },

    addReconciliationData: (values) => {
      return httpClient.post(`/api/reconciliations`, values);
    },

     getHubriseStock: () => {
        return httpClient.get(`/api/hubrise/inventory`);
    },
    
    getDelieverOrders: () => {
      return httpClient.get(`/api/get-hubrise-orders`);
    },
    checkScreenAuthentication: (values) => {
      return httpClient.post(`/api/authenticate-screen`, values);
    },
     getCustomerScreenWebsiteMacAddress: () => {
      return httpClient.get(`/api/screens/mac-address`);
    },
    
    

  };
}

export default ProductService();
