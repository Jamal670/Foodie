import api from "../../../api/axios";
import {
  BASE_URL,
  CREATE_ORDER_MUTATION,
  GET_ORDER_STATUS_QUERY,
} from "../../../api/customerEndpoints/orders/createOrders.endpoing";

/**
 * Service to create a new order for the active customer session.
 * @param {Object} input - CreateOrdersDto object (orderType, paymentMethod, name, phoneNo, email).
 * @param {string} [accessToken] - Optional access token.
 * @returns {Promise<Object>} Created Orders object.
 */
export const createOrder = async (input, accessToken) => {
  if (!input || !input.paymentMethod) {
    throw new Error("Payment method is required to place an order.");
  }

  try {
    const config = {};
    if (accessToken) {
      config.headers = { Authorization: `Bearer ${accessToken}` };
    }

    const response = await api.post(
      BASE_URL,
      {
        query: CREATE_ORDER_MUTATION,
        variables: {
          input,
        },
      },
      config
    );

    if (response.data?.errors && response.data.errors.length > 0) {
      const errorMsg = response.data.errors.map((e) => e.message).join(", ");
      throw new Error(errorMsg);
    }

    const data = response.data?.data?.createOrder;
    if (!data) {
      throw new Error("Failed to place order.");
    }

    return data;
  } catch (error) {
    console.error("Error creating order:", error);
    const apiError =
      error.response?.data?.errors?.[0]?.message ||
      error.response?.data?.message ||
      error.message ||
      "Failed to place order.";
    throw new Error(apiError);
  }
};

/**
 * Service to fetch order details/status by orderId.
 * @param {number|string} orderId - Numeric order ID.
 * @param {string} [accessToken] - Optional access token.
 * @returns {Promise<Object|null>} Orders object or null.
 */
export const getOrderStatus = async (orderId, accessToken) => {
  const numericId = Number(orderId);
  if (!numericId || Number.isNaN(numericId)) {
    throw new Error("Invalid order ID.");
  }

  try {
    const config = {};
    if (accessToken) {
      config.headers = { Authorization: `Bearer ${accessToken}` };
    }

    const response = await api.post(
      BASE_URL,
      {
        query: GET_ORDER_STATUS_QUERY,
        variables: {
          orderId: numericId,
        },
      },
      config
    );

    if (response.data?.errors && response.data.errors.length > 0) {
      const errorMsg = response.data.errors.map((e) => e.message).join(", ");
      throw new Error(errorMsg);
    }

    return response.data?.data?.getOrder || null;
  } catch (error) {
    console.error("Error fetching order status:", error);
    const apiError =
      error.response?.data?.errors?.[0]?.message ||
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch order status.";
    throw new Error(apiError);
  }
};
