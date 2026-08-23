// base url
export const BASE_URL = "/graphql";

export const CATEGORY_QUERIES = {
  GET_MENU_CATEGORIES_TREE: `
    query GetMenuCategoriesTree {
      getMenuCategoriesTree {
        id
        name
        level
        restaurantId
        parentCategoryId
        imageUrl
        description
        children {
          id
          name
          level
          restaurantId
          parentCategoryId
          imageUrl
          description
          children {
            id
            name
            level
            restaurantId
            parentCategoryId
            imageUrl
            description
          }
        }
      }
    }
  `,
// children {
            //   id
            //   name
            //   level
            //   restaurantId
            //   parentCategoryId
            //   imageUrl
            //   description
            // }
  GET_LEVEL1_AND_2_CATEGORIES: `
    query GetLevel1And2Categories {
      getLevel1And2Categories {
        id
        name
        restaurantId
        level
      }
    }
  `,

  CREATE_MENU_CATEGORY: `
    mutation CreateMenuCategory($dto: CreateMenuCategoryDto!) {
      createMenuCategory(dto: $dto) {
        id
        name
        level
        restaurantId
        parentCategoryId
        imageUrl
        description
      }
    }
  `,

  UPDATE_MENU_CATEGORY: `
    mutation UpdateMenuCategory($dto: UpdateMenuCategoryDto!) {
      updateMenuCategory(dto: $dto) {
        id
        name
        level
        restaurantId
        parentCategoryId
        imageUrl
        description
      }
    }
  `,

  DELETE_MENU_CATEGORY: `
    mutation DeleteMenuCategory($dto: DeleteMenuCategoryDto!) {
      deleteMenuCategory(dto: $dto) {
        success
        message
      }
    }
  `,
};
