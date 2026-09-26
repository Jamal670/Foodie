import api from "../../../api/axios";
import {
  BASE_URL,
  GET_WAITER_POS_MENU_ITEMS_MUTATION,
  GET_MENU_ITEM_DETAIL_BY_ID_MUTATION,
  AVAILABLE_TABLES_NUMBERS_MUTATION,
  CREATE_ORDER_BY_POS_OPERATOR_MUTATION,
} from "../../../api/waiter/waiterPOS/waiterPOS.endpoint";
import {
  PERMISSION_CODES,
  PERMISSION_KEYS,
  hasPermission,
} from "../../../utils/permissionUtils";

/**
 * Fetch Waiter POS Menu Items (Categories & Menu Items)
 */
export const fetchGetWaiterPOSMenuItems = async (input) => {
  const permInput = input || {
    permissionKey: PERMISSION_KEYS.POS_VIEW,
    permissionCode: PERMISSION_CODES.POS_VIEW,
  };

  try {
    const response = await api.post(BASE_URL, {
      query: GET_WAITER_POS_MENU_ITEMS_MUTATION,
      variables: { input: permInput },
    });

    if (response.data?.errors && response.data.errors.length > 0) {
      const errorMsg = response.data.errors.map((e) => e.message).join(", ");
      throw new Error(errorMsg);
    }

    return response.data?.data?.GetWaiterPOSMenuItems || null;
  } catch (error) {
    console.error("Error in fetchGetWaiterPOSMenuItems:", error);
    const apiError =
      error.response?.data?.errors?.[0]?.message ||
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch POS menu items.";
    throw new Error(apiError);
  }
};

/**
 * Fetch details for a specific menu item (Variations, Customizations, Addons)
 */
export const fetchGetMenuItemDetailById = async (menuItemId, permissionInput) => {
  const numericId = Number(menuItemId);
  if (!numericId || Number.isNaN(numericId)) {
    throw new Error("Invalid menu item ID.");
  }

  const permInput = permissionInput || {
    permissionKey: PERMISSION_KEYS.POS_VIEW,
    permissionCode: PERMISSION_CODES.POS_VIEW,
  };

  try {
    const response = await api.post(BASE_URL, {
      query: GET_MENU_ITEM_DETAIL_BY_ID_MUTATION,
      variables: {
        permissionInput: permInput,
        input: { menuItemId: numericId },
      },
    });

    if (response.data?.errors && response.data.errors.length > 0) {
      const errorMsg = response.data.errors.map((e) => e.message).join(", ");
      throw new Error(errorMsg);
    }

    return response.data?.data?.getMenuItemDetailById || null;
  } catch (error) {
    console.error("Error in fetchGetMenuItemDetailById:", error);
    const apiError =
      error.response?.data?.errors?.[0]?.message ||
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch menu item details.";
    throw new Error(apiError);
  }
};

/**
 * Fetch available tables numbers for Waiter POS order placement
 */
export const fetchAvailableTablesNumbers = async (permissionInput) => {
  const permInput = permissionInput || {
    permissionKey: PERMISSION_KEYS.POS_CREATE_ORDER,
    permissionCode: PERMISSION_CODES.POS_CREATE_ORDER,
  };

  if (!hasPermission(permInput.permissionCode, permInput.permissionKey)) {
    throw new Error("You do not have permission to view available tables.");
  }

  try {
    const response = await api.post(BASE_URL, {
      query: AVAILABLE_TABLES_NUMBERS_MUTATION,
      variables: { input: permInput },
    });

    if (response.data?.errors && response.data.errors.length > 0) {
      const errorMsg = response.data.errors.map((e) => e.message).join(", ");
      throw new Error(errorMsg);
    }

    return response.data?.data?.AvailableTablesNumbers || [];
  } catch (error) {
    console.error("Error in fetchAvailableTablesNumbers:", error);
    const apiError =
      error.response?.data?.errors?.[0]?.message ||
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch available tables.";
    throw new Error(apiError);
  }
};

/**
 * Create POS Order by Waiter / Operator
 */
export const fetchCreateOrderByPosOperator = async ({ input, permissionInput }) => {
  const permInput = permissionInput || {
    permissionKey: PERMISSION_KEYS.POS_CREATE_ORDER,
    permissionCode: PERMISSION_CODES.POS_CREATE_ORDER,
  };

  if (!hasPermission(permInput.permissionCode, permInput.permissionKey)) {
    throw new Error("You do not have permission to create POS orders.");
  }

  try {
    const response = await api.post(BASE_URL, {
      query: CREATE_ORDER_BY_POS_OPERATOR_MUTATION,
      variables: {
        permissionInput: permInput,
        input,
      },
    });

    if (response.data?.errors && response.data.errors.length > 0) {
      const errorMsg = response.data.errors.map((e) => e.message).join(", ");
      throw new Error(errorMsg);
    }

    return response.data?.data?.createOrderByPosOperator ?? false;
  } catch (error) {
    console.error("Error in fetchCreateOrderByPosOperator:", error);
    const apiError =
      error.response?.data?.errors?.[0]?.message ||
      error.response?.data?.message ||
      error.message ||
      "Failed to create POS order.";
    throw new Error(apiError);
  }
};

const WaiterPOSService = {
  fetchGetWaiterPOSMenuItems,
  fetchGetMenuItemDetailById,
  fetchAvailableTablesNumbers,
  fetchCreateOrderByPosOperator,
};

export default WaiterPOSService;

