import api from "../../api/axios";
import { MENU_ITEMS_QUERIES } from "../../api/endpoints/Menu-create&update/Menu-Items/menu-items.endpoint";

const handleGraphQLErrors = (response) => {
  if (response.data?.errors && response.data.errors.length > 0) {
    const errorMsg = response.data.errors.map((e) => e.message).join(", ");
    throw new Error(errorMsg);
  }
};

const handleHttpError = (err) => {
  console.error("API error details:", err);
  const graphQLErrors = err.response?.data?.errors;
  if (graphQLErrors && graphQLErrors.length > 0) {
    return new Error(graphQLErrors.map((e) => e.message).join(", "));
  }
  const errorMessage = err.response?.data?.message;
  return new Error(
    Array.isArray(errorMessage)
      ? errorMessage.join(", ")
      : errorMessage || err.message || "An error occurred.",
  );
};

export const getMenuItems = async () => {
  try {
    const response = await api.post("/graphql", {
      query: MENU_ITEMS_QUERIES.GET_MENU_ITEMS,
    });
    handleGraphQLErrors(response);
    return response.data?.data?.getMenuItems || [];
  } catch (err) {
    throw handleHttpError(err);
  }
};

export const getMenuItem = async (itemId) => {
  try {
    const response = await api.post("/graphql", {
      query: MENU_ITEMS_QUERIES.GET_MENU_ITEM,
      variables: {
        dto: { itemId: parseInt(itemId, 10) },
      },
    });
    handleGraphQLErrors(response);
    return response.data?.data?.getMenuItem;
  } catch (err) {
    throw handleHttpError(err);
  }
};

export const createMenuItem = async (dto) => {
  try {
    const response = await api.post("/graphql", {
      query: MENU_ITEMS_QUERIES.CREATE_MENU_ITEM,
      variables: { dto },
    });
    handleGraphQLErrors(response);
    return response.data?.data?.createMenuItem;
  } catch (err) {
    throw handleHttpError(err);
  }
};

export const updateMenuItem = async (dto) => {
  try {
    const response = await api.post("/graphql", {
      query: MENU_ITEMS_QUERIES.UPDATE_MENU_ITEM,
      variables: { dto },
    });
    handleGraphQLErrors(response);
    return response.data?.data?.updateMenuItem;
  } catch (err) {
    throw handleHttpError(err);
  }
};

export const deleteMenuItem = async (itemId) => {
  try {
    const response = await api.post("/graphql", {
      query: MENU_ITEMS_QUERIES.DELETE_MENU_ITEM,
      variables: {
        dto: { itemId: parseInt(itemId, 10) },
      },
    });
    handleGraphQLErrors(response);
    return response.data?.data?.deleteMenuItem;
  } catch (err) {
    throw handleHttpError(err);
  }
};

export const deleteMenuItems = async (itemIds) => {
  try {
    const response = await api.post("/graphql", {
      query: MENU_ITEMS_QUERIES.DELETE_MENU_ITEMS,
      variables: {
        dto: { itemIds: itemIds.map((id) => parseInt(id, 10)) },
      },
    });
    handleGraphQLErrors(response);
    return response.data?.data?.deleteMenuItems;
  } catch (err) {
    throw handleHttpError(err);
  }
};
