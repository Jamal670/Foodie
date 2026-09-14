import api from "../../../api/axios";
import {
  BASE_URL,
  SCAN_QR_CODE_MUTATION,
  GET_PRODUCT_DETAIL_BY_ID_MUTATION,
} from "../../../api/customerEndpoints/menu/showmenu.endpoint";

/**
 * Service to fetch complete menu data by QR Token via GraphQL scanQrCode mutation.
 * @param {string} qrToken - The QR token extracted from the URL.
 * @returns {Promise<Object>} ScanQrCode payload containing session, restaurant, branch, table, categories, and menuItems.
 */
export const fetchMenuByQrToken = async (qrToken) => {
  if (!qrToken) {
    throw new Error("QR token is required to load the menu.");
  }

  try {
    const response = await api.post(BASE_URL, {
      query: SCAN_QR_CODE_MUTATION,
      variables: {
        input: {
          qrToken,
        },
      },
    });

    if (response.data?.errors && response.data.errors.length > 0) {
      const errorMsg = response.data.errors.map((e) => e.message).join(", ");
      throw new Error(errorMsg);
    }

    const data = response.data?.data?.scanQrCode;
    if (!data) {
      throw new Error("No menu data returned for this QR code.");
    }

    return data;
  } catch (error) {
    console.error("Error fetching menu by QR token:", error);
    const apiError =
      error.response?.data?.errors?.[0]?.message ||
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch menu data.";
    throw new Error(apiError);
  }
};

/**
 * Service to fetch item variations, customizations, and addons by menuItemId.
 * @param {number|string} menuItemId - Numeric ID of the target menu item.
 * @returns {Promise<Object>} Object containing variations, customizations, addons.
 */
export const fetchProductDetailById = async (menuItemId) => {
  const numericId = Number(menuItemId);
  if (!numericId || Number.isNaN(numericId)) {
    throw new Error("Invalid menu item ID.");
  }

  try {
    const response = await api.post(BASE_URL, {
      query: GET_PRODUCT_DETAIL_BY_ID_MUTATION,
      variables: {
        dto: {
          menuItemId: numericId,
        },
      },
    });

    if (response.data?.errors && response.data.errors.length > 0) {
      const errorMsg = response.data.errors.map((e) => e.message).join(", ");
      throw new Error(errorMsg);
    }

    const data = response.data?.data?.getProductDetailById;
    if (!data) {
      throw new Error("No product details returned.");
    }

    return data;
  } catch (error) {
    console.error("Error fetching product detail by ID:", error);
    const apiError =
      error.response?.data?.errors?.[0]?.message ||
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch product details.";
    throw new Error(apiError);
  }
};

/**
 * Extract Level 1 categories from menu data.
 * @param {Object} menuData - The complete scanQrCode GraphQL response payload.
 * @returns {Array} List of Level 1 categories.
 */
export const getLevel1Categories = (menuData) => {
  return menuData?.categories?.filter((cat) => cat.level === 1) || [];
};

/**
 * Find a category by its ID within the categories tree.
 * @param {Array} categories - Array of categories.
 * @param {number|string} categoryId - The category ID to find.
 * @returns {Object|null} Matching category object or null.
 */
export const getCategoryById = (categories = [], categoryId) => {
  if (!categories || categoryId === undefined || categoryId === null) return null;
  const idToFind = Number(categoryId);

  for (const cat of categories) {
    if (Number(cat.id) === idToFind) {
      return cat;
    }
    if (cat.children && cat.children.length > 0) {
      const foundInChild = getCategoryById(cat.children, categoryId);
      if (foundInChild) return foundInChild;
    }
  }
  return null;
};

/**
 * Extract Level 2 children categories of a given category.
 * @param {Object} category - Parent category object.
 * @returns {Array} List of Level 2 child categories.
 */
export const getLevel2Children = (category) => {
  if (!category || !category.children) return [];
  return category.children.filter((child) => child.level === 2) || [];
};

/**
 * Filter menu items by a specific category ID.
 * @param {Array} menuItems - List of menu items.
 * @param {number|string} targetCategoryId - Category ID to filter by.
 * @returns {Array} Filtered list of menu items.
 */
export const filterMenuItemsByCategoryId = (menuItems = [], targetCategoryId) => {
  if (!menuItems || targetCategoryId === undefined || targetCategoryId === null) return [];
  const targetId = Number(targetCategoryId);
  return menuItems.filter((item) => Number(item.categoryId) === targetId);
};

/**
 * Extract thumbnail image URL from menu item images.
 * @param {Array} images - Array of image objects ({ imageUrl, isThumbnail }).
 * @returns {string} Image URL or default fallback.
 */
export const getThumbnailUrl = (images = []) => {
  if (!images || images.length === 0) return "/images/breakfast.png";
  const thumbnail = images.find((img) => img.isThumbnail === true);
  return thumbnail?.imageUrl || images[0]?.imageUrl || "/images/breakfast.png";
};
