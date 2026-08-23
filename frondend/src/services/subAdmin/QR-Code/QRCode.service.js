import api from "../../../api/axios";
import { QR_CODE_QUERIES } from "../../../api/endpoints/QR-code/QrCode.endpoint";

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

export const getAllQrCodes = async () => {
  try {
    const response = await api.post("/graphql", {
      query: QR_CODE_QUERIES.GET_ALL_TABLES,
    });
    handleGraphQLErrors(response);
    return response.data?.data?.getAllTables || [];
  } catch (err) {
    throw handleHttpError(err);
  }
};

export const createDineInQrCodes = async (tableNumber) => {
  try {
    const response = await api.post("/graphql", {
      query: QR_CODE_QUERIES.CREATE_TABLES,
      variables: {
        dto: { tableNumber: parseInt(tableNumber, 10) },
      },
    });
    handleGraphQLErrors(response);
    return response.data?.data?.createTables;
  } catch (err) {
    throw handleHttpError(err);
  }
};

export const createTakeawayQrCode = async () => {
  try {
    const response = await api.post("/graphql", {
      query: QR_CODE_QUERIES.CREATE_TAKEAWAY_QR,
    });
    handleGraphQLErrors(response);
    return response.data?.data?.createTakeawayQr;
  } catch (err) {
    throw handleHttpError(err);
  }
};

export const createOneMoreTable = async () => {
  try {
    const response = await api.post("/graphql", {
      query: QR_CODE_QUERIES.CREATE_ONE_MORE_TABLE,
    });
    handleGraphQLErrors(response);
    return response.data?.data?.createOneMoreTable;
  } catch (err) {
    throw handleHttpError(err);
  }
};

export const deleteTableQr = async (id) => {
  try {
    const response = await api.post("/graphql", {
      query: QR_CODE_QUERIES.DELETE_TABLE_QR,
      variables: {
        dto: { id: parseInt(id, 10) },
      },
    });
    handleGraphQLErrors(response);
    return response.data?.data?.deleteTableQr;
  } catch (err) {
    throw handleHttpError(err);
  }
};
