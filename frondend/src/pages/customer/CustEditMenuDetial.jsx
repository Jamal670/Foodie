import React, { useState } from "react";
import { useNavigate, useLocation, useParams, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { addToCart, deleteCartItem } from "../../services/customer/carts/cart.service";
import { useAlertStore } from "../../context/alertStore";
import { setCartId } from "../../utils/cartStorage";
import { useMenuItemDetail } from "../../hooks/useMenuItemDetail";
import ProductDetailView from "../../components/customer/ProductDetailView";

/**
 * CustEditMenuDetial component.
 * Allows editing an existing cart item by pre-selecting its variation/customization/quantity
 * and safely updating the backend cart line item without changing overall cart item count.
 */
const CustEditMenuDetial = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { qrToken, menuItemId, cartItemId } = useParams();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Extract optional selection parameters from query string
  const quantityParam = Number(searchParams.get("quantity") || 1);
  const variationIdParam = searchParams.get("variationId");
  const customizationIdParam = searchParams.get("customizationId");
  const variationNameParam = searchParams.get("variationName");
  const customizationNameParam = searchParams.get("customizationName");

  const initialSelection = {
    variationId: variationIdParam ? Number(variationIdParam) : undefined,
    variationName: variationNameParam ? decodeURIComponent(variationNameParam) : undefined,
    customizationId: customizationIdParam ? Number(customizationIdParam) : undefined,
    customizationName: customizationNameParam ? decodeURIComponent(customizationNameParam) : undefined,
    quantity: quantityParam || 1,
  };

  const {
    productDetails,
    effectiveItem,
    detailsLoading,
    menuLoading,
  } = useMenuItemDetail(menuItemId, qrToken, location.state?.item);

  const handleUpdateItem = async (dto) => {
    if (isSubmitting || !cartItemId) return;
    setIsSubmitting(true);

    try {
      // 1. Delete old cart item first
      await deleteCartItem(cartItemId);

      // 2. Add new selection (reuses backend price calculation & cart merging)
      const updatedCart = await addToCart(dto);

      // 3. Update React Query cache and local storage cart ID (net zero cart count change)
      queryClient.setQueryData(["my-cart"], updatedCart);
      if (updatedCart?.id) {
        setCartId(updatedCart.id);
      }

      useAlertStore.getState().showAlert("Cart item updated successfully!");

      // 4. Navigate back to cart page after short confirmation
      setTimeout(() => {
        if (qrToken && updatedCart?.id) {
          navigate(`/customer/cart/t/${qrToken}/${updatedCart.id}`);
        } else if (qrToken) {
          navigate(`/customer/cart/t/${qrToken}`);
        } else {
          navigate("/customer/cart");
        }
      }, 1200);
    } catch (err) {
      console.error("Failed to update cart item:", err);
      useAlertStore
        .getState()
        .showAlert(err.message || "Failed to update item in cart.");
      queryClient.invalidateQueries({ queryKey: ["my-cart"] });
      setIsSubmitting(false);
    }
  };

  return (
    <ProductDetailView
      effectiveItem={effectiveItem}
      productDetails={productDetails}
      detailsLoading={detailsLoading}
      menuLoading={menuLoading}
      buttonLabel="Update"
      initialSelection={initialSelection}
      onSubmit={handleUpdateItem}
      isSubmitting={isSubmitting}
      qrToken={qrToken}
      titles={'Edit Product'}
    />
  );
};

export default CustEditMenuDetial;
