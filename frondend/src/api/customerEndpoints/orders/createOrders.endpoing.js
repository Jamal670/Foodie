export const BASE_URL = "/graphql";

export const CREATE_ORDER_MUTATION = `
  mutation CreateOrder($input: CreateOrdersDto!) {
    createOrder(input: $input) {
      id
      orderNumber
      branchId
      tableId
      tableSessionId
      customerId
      orderType
      status
      paymentMethod
      subtotal
      tax
      total
      createdAt
      updatedAt
    }
  }
`;

export const GET_ORDER_STATUS_QUERY = `
  query GetOrder($orderId: Int!) {
    getOrder(orderId: $orderId) {
      id
      orderNumber
      branchId
      tableId
      tableSessionId
      customerId
      orderType
      status
      paymentMethod
      subtotal
      tax
      total
      createdAt
      updatedAt
    }
  }
`;
