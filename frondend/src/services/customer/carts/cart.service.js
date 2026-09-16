import api from "../../../api/axios";
import {
  BASE_URL,
  GET_MY_CART_QUERY,
  ADD_TO_CART_MUTATION,
  DELETE_CART_ITEM_MUTATION,
} from "../../../api/customerEndpoints/carts/cart.endpoints";

/**
 * Service to fetch active cart for current customer session.
 * @returns {Promise<Object|null>} Active CustCart object or null.
 */
export const fetchMyCart = async () => {
  try {
    const response = await api.post(BASE_URL, {
      query: GET_MY_CART_QUERY,
    });

    if (response.data?.errors && response.data.errors.length > 0) {
      const errorMsg = response.data.errors.map((e) => e.message).join(", ");
      throw new Error(errorMsg);
    }

    return response.data?.data?.getMyCart || null;
  } catch (error) {
    console.error("Error fetching my cart:", error);
    const apiError =
      error.response?.data?.errors?.[0]?.message ||
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch cart.";
    throw new Error(apiError);
  }
};

/**
 * Service to add item to customer cart.
 * @param {Object} dto - AddCartItemDto payload.
 * @returns {Promise<Object>} Updated CustCart object.
 */
export const addToCart = async (dto) => {
  if (!dto || !dto.menuItemId) {
    throw new Error("Menu item ID is required.");
  }

  try {
    const response = await api.post(BASE_URL, {
      query: ADD_TO_CART_MUTATION,
      variables: {
        dto,
      },
    });

    if (response.data?.errors && response.data.errors.length > 0) {
      const errorMsg = response.data.errors.map((e) => e.message).join(", ");
      throw new Error(errorMsg);
    }

    const data = response.data?.data?.addToCart;
    if (!data) {
      throw new Error("Failed to add item to cart.");
    }

    return data;
  } catch (error) {
    console.error("Error adding to cart:", error);
    const apiError =
      error.response?.data?.errors?.[0]?.message ||
      error.response?.data?.message ||
      error.message ||
      "Failed to add item to cart.";
    throw new Error(apiError);
  }
};

/**
 * Service to delete a cart item by cartItemId.
 * @param {number|string} cartItemId - ID of the cart item to delete.
 * @returns {Promise<boolean>} True if successfully deleted.
 */
export const deleteCartItem = async (cartItemId) => {
  const numericId = Number(cartItemId);
  if (!numericId || Number.isNaN(numericId)) {
    throw new Error("Invalid cart item ID.");
  }

  try {
    const response = await api.post(BASE_URL, {
      query: DELETE_CART_ITEM_MUTATION,
      variables: {
        dto: {
          cartItemId: numericId,
        },
      },
    });

    if (response.data?.errors && response.data.errors.length > 0) {
      const errorMsg = response.data.errors.map((e) => e.message).join(", ");
      throw new Error(errorMsg);
    }

    return response.data?.data?.deleteCartItem ?? true;
  } catch (error) {
    console.error("Error deleting cart item:", error);
    const apiError =
      error.response?.data?.errors?.[0]?.message ||
      error.response?.data?.message ||
      error.message ||
      "Failed to delete cart item.";
    throw new Error(apiError);
  }
};
