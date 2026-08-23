// GraphQL routes definition for QR Code management
export const QR_CODE_QUERIES = {
  GET_ALL_TABLES: `
    query GetAllTables {
      getAllTables {
        id
        tableNumber
        qrToken
        qrType
      }
    }
  `,

  CREATE_TABLES: `
    mutation CreateTables($dto: CreateTableDto!) {
      createTables(dto: $dto) {
        success
        message
      }
    }
  `,

  CREATE_TAKEAWAY_QR: `
    mutation CreateTakeawayQr {
      createTakeawayQr {
        success
        message
      }
    }
  `,

  CREATE_ONE_MORE_TABLE: `
    mutation CreateOneMoreTable {
      createOneMoreTable {
        success
        message
      }
    }
  `,

  DELETE_TABLE_QR: `
    mutation DeleteTableQr($dto: DeleteTableQrDto!) {
      deleteTableQr(dto: $dto) {
        success
        message
      }
    }
  `,
};
