import api from "../../../api/axios";
import {
  BASE_URL,
  WAITER_VIEW_ORDERS_MUTATION,
  SHOW_MENU_ITEMS_DETAILS_MUTATION,
  UPDATE_ORDER_STATUS_MUTATION,
} from "../../../api/waiter/waiterOrder/waiterOrder.endpoint";

/**
 * Fetch active orders for waiter (permission 92406370843 / waiter.Orders.view)
 */
export const fetchWaiterViewOrders = async (input) => {
  try {
    const response = await api.post(BASE_URL, {
      query: WAITER_VIEW_ORDERS_MUTATION,
      variables: { input },
    });

    if (response.data?.errors && response.data.errors.length > 0) {
      const errorMsg = response.data.errors.map((e) => e.message).join(", ");
      throw new Error(errorMsg);
    }

    return response.data?.data?.waiterViewOrders || [];
  } catch (error) {
    console.error("Error in fetchWaiterViewOrders:", error);
    const apiError =
      error.response?.data?.errors?.[0]?.message ||
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch waiter orders.";
    throw new Error(apiError);
  }
};

/**
 * Fetch item details for a specific order (permission 924063708430338 / waiter.Orders.view.details)
 */
export const fetchShowMenuItemsDetails = async (input) => {
  try {
    const response = await api.post(BASE_URL, {
      query: SHOW_MENU_ITEMS_DETAILS_MUTATION,
      variables: { input },
    });

    if (response.data?.errors && response.data.errors.length > 0) {
      const errorMsg = response.data.errors.map((e) => e.message).join(", ");
      throw new Error(errorMsg);
    }

    return response.data?.data?.showMenuItemsDetails || [];
  } catch (error) {
    console.error("Error in fetchShowMenuItemsDetails:", error);
    const apiError =
      error.response?.data?.errors?.[0]?.message ||
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch order details.";
    throw new Error(apiError);
  }
};

/**
 * Update order status (permission 92406370334 / waiter.Orders.edit)
 */
export const updateOrderStatus = async (input) => {
  try {
    const response = await api.post(BASE_URL, {
      query: UPDATE_ORDER_STATUS_MUTATION,
      variables: { input },
    });

    if (response.data?.errors && response.data.errors.length > 0) {
      const errorMsg = response.data.errors.map((e) => e.message).join(", ");
      throw new Error(errorMsg);
    }

    return response.data?.data?.updateOrderStatus ?? false;
  } catch (error) {
    console.error("Error in updateOrderStatus:", error);
    const apiError =
      error.response?.data?.errors?.[0]?.message ||
      error.response?.data?.message ||
      error.message ||
      "Failed to update order status.";
    throw new Error(apiError);
  }
};

const WaiterOrderService = {
  fetchWaiterViewOrders,
  fetchShowMenuItemsDetails,
  updateOrderStatus,
};

export default WaiterOrderService;
