export const BASE_URL = "/graphql";

export const GET_WAITER_POS_MENU_ITEMS_MUTATION = `
  mutation GetWaiterPOSMenuItems($input: VerifyPermissionDto!) {
    GetWaiterPOSMenuItems(input: $input) {
      categories {
        id
        name
        level
        parentCategoryId
        imageUrl
        description
        children {
          id
          name
          level
          parentCategoryId
          imageUrl
          description
          children {
            id
            name
            level
            parentCategoryId
            imageUrl
            description
          }
        }
      }
      menuItems {
        id
        name
        description
        categoryId
        basePrice
        discountedPrice
        images {
          id
          imageUrl
          isThumbnail
        }
      }
    }
  }
`;

export const GET_MENU_ITEM_DETAIL_BY_ID_MUTATION = `
  mutation GetMenuItemDetailById(
    $permissionInput: VerifyPermissionDto!
    $input: GetMenuItemDetailByIdDto!
  ) {
    getMenuItemDetailById(
      permissionInput: $permissionInput
      input: $input
    ) {
      variations {
        id
        name
        price
      }
      customizations {
        id
        name
        price
        multiSelect
      }
      addons {
        id
        itemId
        addonId
      }
    }
  }
`;

export const AVAILABLE_TABLES_NUMBERS_MUTATION = `
  mutation AvailableTablesNumbers($input: VerifyPermissionDto!) {
    AvailableTablesNumbers(input: $input) {
      id
      qrToken
      tableNumber
      status
      qrType
    }
  }
`;

export const CREATE_ORDER_BY_POS_OPERATOR_MUTATION = `
  mutation CreateOrderByPosOperator(
    $permissionInput: VerifyPermissionDto!
    $input: CreatePosOrderDto!
  ) {
    createOrderByPosOperator(
      permissionInput: $permissionInput
      input: $input
    )
  }
`;

