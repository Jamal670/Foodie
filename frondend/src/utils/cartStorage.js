import { useState, useEffect } from "react";

const STORAGE_KEY_COUNT = "customer_cartCount";
const STORAGE_KEY_CART_ID = "customer_cartId";

/**
 * Get current cart count from localStorage safely (min 0).
 */
export const getCartCount = () => {
  try {
    const val = localStorage.getItem(STORAGE_KEY_COUNT);
    if (val === null || val === undefined) return 0;
    const parsed = parseInt(val, 10);
    return Number.isNaN(parsed) || parsed < 0 ? 0 : parsed;
  } catch (err) {
    console.error("Error reading cart count from localStorage:", err);
    return 0;
  }
};

/**
 * Set cart count in localStorage and notify listeners.
 */
export const setCartCount = (count) => {
  try {
    const safeCount = Math.max(0, parseInt(count, 10) || 0);
    localStorage.setItem(STORAGE_KEY_COUNT, safeCount.toString());
    window.dispatchEvent(new CustomEvent("cartCountUpdated", { detail: safeCount }));
    return safeCount;
  } catch (err) {
    console.error("Error setting cart count in localStorage:", err);
    return 0;
  }
};

/**
 * Increment cart count by amount (default +1) immediately.
 */
export const incrementCartCount = (by = 1) => {
  const current = getCartCount();
  return setCartCount(current + (by || 1));
};

/**
 * Decrement cart count by amount (default -1) immediately (min 0).
 */
export const decrementCartCount = (by = 1) => {
  const current = getCartCount();
  return setCartCount(current - (by || 1));
};

/**
 * Get stored cart ID from localStorage.
 */
export const getCartId = () => {
  try {
    return localStorage.getItem(STORAGE_KEY_CART_ID) || null;
  } catch (err) {
    console.error("Error reading cart ID from localStorage:", err);
    return null;
  }
};

/**
 * Set stored cart ID in localStorage.
 */
export const setCartId = (cartId) => {
  try {
    if (cartId !== null && cartId !== undefined) {
      localStorage.setItem(STORAGE_KEY_CART_ID, cartId.toString());
    }
  } catch (err) {
    console.error("Error setting cart ID in localStorage:", err);
  }
};

/**
 * React hook to synchronize cart count across components & storage events.
 */
export const useCartCount = () => {
  const [count, setCountState] = useState(getCartCount());

  useEffect(() => {
    const handleUpdate = () => {
      setCountState(getCartCount());
    };

    window.addEventListener("cartCountUpdated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("cartCountUpdated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  return count;
};

/**
 * Helper to generate cart navigation path `/customer/cart/t/:qrToken/:cartId`
 * using available cache or localStorage without making extra API calls.
 */
export const getCartNavigationPath = (qrToken, queryClient) => {
  const cachedCart = queryClient?.getQueryData(["my-cart"]);
  const cartId = cachedCart?.id || getCartId();

  if (qrToken && cartId) {
    return `/customer/cart/t/${qrToken}/${cartId}`;
  }
  if (qrToken) {
    return `/customer/cart/t/${qrToken}`;
  }
  if (cartId) {
    return `/customer/cart/${cartId}`;
  }
  return "/customer/cart";
};
