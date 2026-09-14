// base url
export const BASE_URL = "/graphql";

export const SCAN_QR_CODE_MUTATION = `
  mutation ScanQrCode($input: ScanQrInput!) {
    scanQrCode(input: $input) {
      accessToken
      session {
        id
        tableId
        restaurantId
        branchId
        isActive
        expiresAt
      }
      restaurant {
        id
        restName
      }
      branch {
        id
        servingTime
        taxCash
        taxCard
      }
      table {
        id
        tableNumber
        status
        qrType
      }
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

export const GET_PRODUCT_DETAIL_BY_ID_MUTATION = `
  mutation GetProductDetailById($dto: ProductDetailsDto!) {
    getProductDetailById(dto: $dto) {
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
          description
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
  }
`;
