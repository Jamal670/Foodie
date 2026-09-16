export const BASE_URL = "/graphql";

export const GET_MY_CART_QUERY = `
  query GetMyCart {
    getMyCart {
      id
      branchId
      tableId
      sessionId
      isActive
      items {
        id
        cartId
        menuItemId
        menuItemName
        itemVariationName
        itemCustomizationName
        quantity
        price
        image
      }
    }
  }
`;

export const ADD_TO_CART_MUTATION = `
  mutation AddToCart($dto: AddCartItemDto!) {
    addToCart(dto: $dto) {
      id
      branchId
      tableId
      sessionId
      isActive
      items {
        id
        cartId
        menuItemId
        menuItemName
        itemVariationName
        itemCustomizationName
        quantity
        price
        image
      }
    }
  }
`;

export const DELETE_CART_ITEM_MUTATION = `
  mutation DeleteCartItem($dto: DeleteCustCartItemDto!) {
    deleteCartItem(dto: $dto)
  }
`;
