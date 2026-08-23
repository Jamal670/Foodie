import api from "../../../api/axios";
import { CATEGORY_QUERIES } from "../../../api/endpoints/Menu-create&update/Categories/create-category.endpoint";

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
//*-*-*-*-*-*-*-*-*-*-*-*-* Upload Image REST API*-*-*-*-*-*-*-*-*-*-*-*-*
export const uploadImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post("/upload/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data; // returns { imageUrl }
  } catch (err) {
    throw handleHttpError(err);
  }
};

//*-*-*-*-*-*-*-*-*-*-*-*-* GraphQL APIs *-*-*-*-*-*-*-*-*-*-*-*-*
export const getMenuCategoriesTree = async () => {
  try {
    const response = await api.post("/graphql", {
      query: CATEGORY_QUERIES.GET_MENU_CATEGORIES_TREE,
    });
    handleGraphQLErrors(response);
    return response.data?.data?.getMenuCategoriesTree || [];
  } catch (err) {
    throw handleHttpError(err);
  }
};

export const getLevel1And2Categories = async () => {
  try {
    const response = await api.post("/graphql", {
      query: CATEGORY_QUERIES.GET_LEVEL1_AND_2_CATEGORIES,
    });
    handleGraphQLErrors(response);
    return response.data?.data?.getLevel1And2Categories || [];
  } catch (err) {
    throw handleHttpError(err);
  }
};

export const createMenuCategory = async (dto) => {
  try {
    const response = await api.post("/graphql", {
      query: CATEGORY_QUERIES.CREATE_MENU_CATEGORY,
      variables: { dto },
    });
    handleGraphQLErrors(response);
    return response.data?.data?.createMenuCategory;
  } catch (err) {
    throw handleHttpError(err);
  }
};

export const updateMenuCategory = async (dto) => {
  try {
    const response = await api.post("/graphql", {
      query: CATEGORY_QUERIES.UPDATE_MENU_CATEGORY,
      variables: { dto },
    });
    handleGraphQLErrors(response);
    return response.data?.data?.updateMenuCategory;
  } catch (err) {
    throw handleHttpError(err);
  }
};

export const deleteMenuCategory = async (id, force) => {
  const dto = { id: parseInt(id, 10) };
  if (force === true) dto.force = true;

  const response = await api.post("/graphql", {
    query: CATEGORY_QUERIES.DELETE_MENU_CATEGORY,
    variables: { dto },
  });
  handleGraphQLErrors(response);
  return response.data?.data?.deleteMenuCategory;
};

/**
 * performDeleteCategory
 * Called AFTER the user has confirmed the modal.
 * Decides whether to send force:true based on hasChildren.
 * Returns { success, message } or throws on network / GraphQL errors.
 */
export const performDeleteCategory = async (id, hasChildren) => {
  try {
    return await deleteMenuCategory(id, hasChildren ? true : undefined);
  } catch (err) {
    throw handleHttpError(err);
  }
};


