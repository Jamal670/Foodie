/**
 * Waiter Cart LocalStorage Data Helper
 * Centralized utility for managing waiter-side temporary cart storage.
 * Follows the specified cart & cartItems data structure.
 */

const STORAGE_KEY = "waiter_cart_data";
const EVENT_NAME = "waiterCartUpdated";

const getDefaultCartData = () => ({
  cart: {
    id: 1,
    branchId: null,
    tableId: null,
  },
  cartItems: [],
});

/**
 * Get raw cart data object containing { cart, cartItems }
 */
export const getWaiterCartData = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultCartData();
    const parsed = JSON.parse(raw);
    return {
      cart: parsed?.cart || { id: 1, branchId: null, tableId: null },
      cartItems: Array.isArray(parsed?.cartItems) ? parsed.cartItems : [],
    };
  } catch (err) {
    console.error("Error reading waiter cart from localStorage:", err);
    return getDefaultCartData();
  }
};

/**
 * Save cart data to localStorage and dispatch update event
 */
const saveWaiterCartData = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: data }));
  } catch (err) {
    console.error("Error saving waiter cart to localStorage:", err);
  }
};

/**
 * Get cart header info
 */
export const getWaiterCart = () => {
  const data = getWaiterCartData();
  return data.cart;
};

/**
 * Get array of cart items
 */
export const getWaiterCartItems = () => {
  const data = getWaiterCartData();
  return data.cartItems;
};

/**
 * Get total number of items in waiter cart
 */
export const getWaiterCartItemCount = () => {
  const items = getWaiterCartItems();
  return items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
};

/**
 * Add item to waiter cart
 * @param {Object} itemDto
 */
export const addWaiterCartItem = (itemDto) => {
  const data = getWaiterCartData();
  const cartId = data.cart.id || 1;

  const newItem = {
    id: Date.now(),
    cartId: cartId,
    menuItemId: Number(itemDto.menuItemId),
    menuItemName: itemDto.menuItemName || itemDto.name || "Menu Item",
    itemVariationName: itemDto.itemVariationName || null,
    itemCustomizationName: itemDto.itemCustomizationName || null,
    quantity: Number(itemDto.quantity) || 1,
    price: Number(itemDto.price) || 0,
    image: itemDto.image || null,
    variationId: itemDto.variationId ? Number(itemDto.variationId) : null,
    customizationId: itemDto.customizationId ? Number(itemDto.customizationId) : null,
  };

  // Check if identical item (same menuItemId, variationId, customizationId/name) already exists
  const existingIndex = data.cartItems.findIndex(
    (item) =>
      Number(item.menuItemId) === newItem.menuItemId &&
      (item.variationId || null) === (newItem.variationId || null) &&
      (item.customizationId || null) === (newItem.customizationId || null) &&
      (item.itemCustomizationName || null) === (newItem.itemCustomizationName || null)
  );

  if (existingIndex > -1) {
    const existing = data.cartItems[existingIndex];
    const updatedQty = Number(existing.quantity) + newItem.quantity;
    data.cartItems[existingIndex] = {
      ...existing,
      quantity: updatedQty,
      price: newItem.price, // unit or total updated
    };
  } else {
    data.cartItems.push(newItem);
  }

  saveWaiterCartData(data);
  return data.cartItems;
};

/**
 * Update an existing cart item in waiter cart
 * @param {number|string} cartItemId
 * @param {Object} updatedFields
 */
export const updateWaiterCartItem = (cartItemId, updatedFields) => {
  const data = getWaiterCartData();
  const numericId = Number(cartItemId);

  const index = data.cartItems.findIndex((item) => Number(item.id) === numericId);
  if (index > -1) {
    data.cartItems[index] = {
      ...data.cartItems[index],
      ...updatedFields,
      quantity: updatedFields.quantity ? Number(updatedFields.quantity) : data.cartItems[index].quantity,
      price: updatedFields.price !== undefined ? Number(updatedFields.price) : data.cartItems[index].price,
      variationId: updatedFields.variationId !== undefined ? (updatedFields.variationId ? Number(updatedFields.variationId) : null) : data.cartItems[index].variationId,
      customizationId: updatedFields.customizationId !== undefined ? (updatedFields.customizationId ? Number(updatedFields.customizationId) : null) : data.cartItems[index].customizationId,
    };
    saveWaiterCartData(data);
  }

  return data.cartItems;
};

/**
 * Remove an item from waiter cart
 * @param {number|string} cartItemId
 */
export const removeWaiterCartItem = (cartItemId) => {
  const data = getWaiterCartData();
  const numericId = Number(cartItemId);

  data.cartItems = data.cartItems.filter((item) => Number(item.id) !== numericId);
  saveWaiterCartData(data);
  return data.cartItems;
};

/**
 * Clear waiter cart completely
 */
export const clearWaiterCart = () => {
  const freshData = getDefaultCartData();
  saveWaiterCartData(freshData);
  return freshData;
};

/**
 * Helper listener hook subscription key
 */
export const WAITER_CART_EVENT = EVENT_NAME;

const waiterCartData = {
  getWaiterCartData,
  getWaiterCart,
  getWaiterCartItems,
  getWaiterCartItemCount,
  addWaiterCartItem,
  updateWaiterCartItem,
  removeWaiterCartItem,
  clearWaiterCart,
  WAITER_CART_EVENT,
};

export default waiterCartData;
