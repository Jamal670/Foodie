import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  fetchGetWaiterPOSMenuItems,
  fetchGetMenuItemDetailById,
  fetchAvailableTablesNumbers,
  fetchCreateOrderByPosOperator,
} from "../services/waiter/waiterPOS/waiterPOS.service";
import { useAlertStore } from "../context/alertStore";
import {
  hasPermission,
  PERMISSION_CODES,
  PERMISSION_KEYS,
} from "../utils/permissionUtils";

/**
 * Custom hook to fetch and cache POS menu data (15 min staleTime)
 */
export const useWaiterPOSMenu = () => {
  const hasPosViewPermission = hasPermission(
    PERMISSION_CODES.POS_VIEW,
    PERMISSION_KEYS.POS_VIEW
  );

  const query = useQuery({
    queryKey: ["waiter-pos-menu"],
    queryFn: () =>
      fetchGetWaiterPOSMenuItems({
        permissionKey: PERMISSION_KEYS.POS_VIEW,
        permissionCode: PERMISSION_CODES.POS_VIEW,
      }),
    staleTime: 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    enabled: hasPosViewPermission,
  });

  useEffect(() => {
    if (query.isError && query.error) {
      useAlertStore.getState().showAlert(query.error.message);
    }
  }, [query.isError, query.error]);

  return {
    ...query,
    hasPosViewPermission,
    categories: query.data?.categories || [],
    menuItems: query.data?.menuItems || [],
  };
};

/**
 * Custom hook to fetch menu item details (5 min staleTime)
 */
export const useWaiterPOSMenuItemDetail = (menuItemId) => {
  const numericItemId = Number(menuItemId);
  const isValidItemId = !Number.isNaN(numericItemId) && numericItemId > 0;

  const {
    data: posMenuData,
    isLoading: menuLoading,
    isError: menuError,
    error: menuFetchError,
  } = useWaiterPOSMenu();

  const hasPosViewPermission = hasPermission(
    PERMISSION_CODES.POS_VIEW,
    PERMISSION_KEYS.POS_VIEW
  );

  const {
    data: rawDetails,
    isLoading: detailsLoading,
    isError: detailsError,
    error: detailsFetchError,
  } = useQuery({
    queryKey: ["waiter-pos-menu-item-detail", numericItemId],
    queryFn: () => fetchGetMenuItemDetailById(numericItemId),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    enabled: isValidItemId && hasPosViewPermission,
  });

  useEffect(() => {
    if (detailsError && detailsFetchError) {
      useAlertStore.getState().showAlert(detailsFetchError.message);
    }
  }, [detailsError, detailsFetchError]);

  // Find effective item from posMenuData
  const effectiveItem =
    posMenuData?.menuItems?.find(
      (item) => Number(item.id) === numericItemId
    ) || null;

  // Process rawDetails: map addons to addonItems from posMenuData
  const productDetails = rawDetails
    ? {
        ...rawDetails,
        addons: (rawDetails.addons || []).map((addon) => {
          const addonItem = posMenuData?.menuItems?.find(
            (m) => Number(m.id) === Number(addon.addonId)
          );
          return {
            ...addon,
            addonItem: addonItem || null,
          };
        }),
      }
    : null;

  return {
    numericItemId,
    isValidItemId,
    posMenuData,
    productDetails,
    effectiveItem,
    isLoading: menuLoading || (detailsLoading && !effectiveItem),
    menuLoading,
    detailsLoading,
  };
};

/**
 * Custom hook to fetch available table numbers (sorted sequentially)
 */
export const useAvailableTables = () => {
  const hasCreateOrderPermission = hasPermission(
    PERMISSION_CODES.POS_CREATE_ORDER,
    PERMISSION_KEYS.POS_CREATE_ORDER
  );

  const query = useQuery({
    queryKey: ["available-tables"],
    queryFn: () =>
      fetchAvailableTablesNumbers({
        permissionKey: PERMISSION_KEYS.POS_CREATE_ORDER,
        permissionCode: PERMISSION_CODES.POS_CREATE_ORDER,
      }),
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    enabled: hasCreateOrderPermission,
  });

  useEffect(() => {
    if (query.isError && query.error) {
      useAlertStore.getState().showAlert(query.error.message);
    }
  }, [query.isError, query.error]);

  const rawTables = query.data || [];
  const sortedTables = [...rawTables].sort(
    (a, b) => (Number(a.tableNumber) || 0) - (Number(b.tableNumber) || 0)
  );

  return {
    ...query,
    hasCreateOrderPermission,
    tables: sortedTables,
  };
};

/**
 * Custom hook mutation for creating POS Order
 */
export const useCreatePosOrder = () => {
  return useMutation({
    mutationFn: (input) =>
      fetchCreateOrderByPosOperator({
        input,
        permissionInput: {
          permissionKey: PERMISSION_KEYS.POS_CREATE_ORDER,
          permissionCode: PERMISSION_CODES.POS_CREATE_ORDER,
        },
      }),
  });
};

