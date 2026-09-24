export const BASE_URL = "/graphql";

export const WAITER_VIEW_ORDERS_MUTATION = `
  mutation WaiterViewOrders($input: VerifyPermissionDto!) {
    waiterViewOrders(input: $input) {
      id
      tableId
      tableSessionId
      customerId
      branchId
      status
      orderType
      orderNumber
      total
      paymentMethod
      createdAt
      customer {
        id
        name
        isActive
      }
      table {
        id
        tableNumber
        status
      }
    }
  }
`;

export const SHOW_MENU_ITEMS_DETAILS_MUTATION = `
  mutation ShowMenuItemsDetails($input: VerifyPermissionDto!) {
    showMenuItemsDetails(input: $input) {
      id
      menuItemName
      menuItemId
      quantity
      unitPrice
      totalPrice
      variations {
        id
        name
        price
      }
      customizations {
        id
        name
        price
      }
    }
  }
`;

export const UPDATE_ORDER_STATUS_MUTATION = `
  mutation UpdateOrderStatus($input: VerifyPermissionDto!) {
    updateOrderStatus(input: $input)
  }
`;
