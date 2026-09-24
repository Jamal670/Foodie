/**
 * Permission utility functions for Waiter & POS operations.
 */

export const PERMISSION_CODES = {
  ORDERS_TAB: "9240637",
  ORDERS_VIEW: "92406370843",
  ORDERS_VIEW_DETAILS: "924063708430338",
  ORDERS_EDIT: "92406370334",
  POS_TAB: "9240767",
};

export const PERMISSION_KEYS = {
  ORDERS_TAB: "waiter.Orders",
  ORDERS_VIEW: "waiter.Orders.view",
  ORDERS_VIEW_DETAILS: "waiter.Orders.view.details",
  ORDERS_EDIT: "waiter.Orders.edit",
  POS_TAB: "waiter.POS",
};

/**
 * Retrieve permissions array stored during login.
 */
export const getStoredPermissions = () => {
  try {
    const stored = localStorage.getItem("permissions");
    if (stored) {
      return JSON.parse(stored);
    }
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const userObj = JSON.parse(userStr);
      return userObj.permission || [];
    }
  } catch (err) {
    console.error("Error reading stored permissions:", err);
  }
  return [];
};

/**
 * Check if logged-in user possesses a permission given permissionCode and/or permissionKey.
 * @param {string} [permissionCode]
 * @param {string} [permissionKey]
 * @returns {boolean}
 */
export const hasPermission = (permissionCode, permissionKey) => {
  const permissions = getStoredPermissions();
  if (!Array.isArray(permissions) || permissions.length === 0) {
    return false;
  }

  return permissions.some((item) => {
    const perm = item.__permission__ || item;
    const codeMatch = permissionCode
      ? String(perm.permissionCode) === String(permissionCode)
      : true;
    const keyMatch = permissionKey
      ? perm.permissionKey === permissionKey
      : true;
    return codeMatch && keyMatch;
  });
};
