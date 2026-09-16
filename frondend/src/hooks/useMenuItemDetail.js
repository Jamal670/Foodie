import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  fetchMenuByQrToken,
  fetchProductDetailById,
} from "../services/customer/menu/showmenu.service";
import { useAlertStore } from "../context/alertStore";

/**
 * Custom hook to fetch product details and warm menu data for a given menuItemId & qrToken.
 */
export const useMenuItemDetail = (menuItemId, qrToken, locationStateItem = null) => {
  const numericItemId = Number(menuItemId);
  const isValidItemId = !Number.isNaN(numericItemId) && numericItemId > 0;

  // 1. Consume warm menu cache or fetch on cold cache miss
  const {
    data: menuData,
    isLoading: menuLoading,
    isError: menuError,
    error: menuFetchError,
  } = useQuery({
    queryKey: ["customer-menu", qrToken],
    queryFn: () => fetchMenuByQrToken(qrToken),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    enabled: !!qrToken,
  });

  // 2. Fetch product details (variations, customizations, addons)
  const {
    data: productDetails,
    isLoading: detailsLoading,
    isError: detailsError,
    error: detailsFetchError,
  } = useQuery({
    queryKey: ["product-details", numericItemId],
    queryFn: () => fetchProductDetailById(numericItemId),
    enabled: isValidItemId,
  });

  // Surface errors via useAlertStore
  useEffect(() => {
    if (menuError && menuFetchError) {
      useAlertStore
        .getState()
        .showAlert(menuFetchError.message || "Failed to load menu data.");
    }
  }, [menuError, menuFetchError]);

  useEffect(() => {
    if (detailsError && detailsFetchError) {
      useAlertStore
        .getState()
        .showAlert(
          detailsFetchError.message || "Failed to load product details.",
        );
    }
  }, [detailsError, detailsFetchError]);

  // Find target menu item in cached menuData or location state
  const cachedItem = menuData?.menuItems?.find(
    (item) => Number(item.id) === numericItemId,
  );
  const effectiveItem =
    cachedItem ||
    (locationStateItem && Number(locationStateItem.id) === numericItemId
      ? locationStateItem
      : null);

  return {
    numericItemId,
    isValidItemId,
    menuData,
    productDetails,
    effectiveItem,
    isLoading: menuLoading || (detailsLoading && !effectiveItem),
    menuLoading,
    detailsLoading,
  };
};
