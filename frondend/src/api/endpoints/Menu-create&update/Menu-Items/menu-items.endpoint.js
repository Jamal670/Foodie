// GraphQL routes definition for Menu Items
export const MENU_ITEMS_QUERIES = {
  GET_MENU_ITEMS: `
    query GetMenuItems {
      getMenuItems {
        id
        name
        description
        basePrice
        discountedPrice
        status
        categoryId
        category {
          id
          name
        }
        images {
          id
          imageUrl
          isThumbnail
        }
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
          addonId
          addonItem {
            id
            name
          }
        }
      }
    }
  `,

  GET_MENU_ITEM: `
    query GetMenuItem($dto: GetMenuItemDto!) {
      getMenuItem(dto: $dto) {
        id
        name
        description
        basePrice
        discountedPrice
        status
        categoryId
        category {
          id
          name
        }
        images {
          id
          imageUrl
          isThumbnail
        }
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
          addonId
          addonItem {
            id
            name
          }
        }
      }
    }
  `,

  CREATE_MENU_ITEM: `
    mutation CreateMenuItem($dto: CreateMenuItemDto!) {
      createMenuItem(dto: $dto) {
        id
        name
        status
      }
    }
  `,

  UPDATE_MENU_ITEM: `
    mutation UpdateMenuItem($dto: UpdateMenuItemDto!) {
      updateMenuItem(dto: $dto) {
        id
        name
        status
      }
    }
  `,

  DELETE_MENU_ITEM: `
    mutation DeleteMenuItem($dto: DeleteMenuItemDto!) {
      deleteMenuItem(dto: $dto) {
        success
        message
      }
    }
  `,

  DELETE_MENU_ITEMS: `
    mutation DeleteMenuItems($dto: DeleteMenuItemListDto!) {
      deleteMenuItems(dto: $dto) {
        success
        message
      }
    }
  `,
};
