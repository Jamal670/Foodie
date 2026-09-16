import React, { useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addToCart } from "../../services/customer/carts/cart.service";
import { useAlertStore } from "../../context/alertStore";
import { incrementCartCount, setCartId } from "../../utils/cartStorage";
import { useMenuItemDetail } from "../../hooks/useMenuItemDetail";
import ProductDetailView from "../../components/customer/ProductDetailView";

const CustMenuDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { qrToken, menuItemId } = useParams();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    productDetails,
    effectiveItem,
    detailsLoading,
    menuLoading,
  } = useMenuItemDetail(menuItemId, qrToken, location.state?.item);

  const addToCartMutation = useMutation({
    mutationFn: (dto) => addToCart(dto),
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(["my-cart"], updatedCart);
      if (updatedCart?.id) {
        setCartId(updatedCart.id);
      }
    },
    onError: (err) => {
      useAlertStore
        .getState()
        .showAlert(err.message || "Failed to add item to cart.");
      queryClient.invalidateQueries({ queryKey: ["my-cart"] });
    },
  });

  const handleAddToCart = (dto) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    // Increment localStorage cart count immediately by +1
    incrementCartCount(1);
    addToCartMutation.mutate(dto);

    setTimeout(() => {
      navigate(-1);
    }, 1500);
  };

  return (
    <ProductDetailView
      effectiveItem={effectiveItem}
      productDetails={productDetails}
      detailsLoading={detailsLoading}
      menuLoading={menuLoading}
      buttonLabel="Add"
      onSubmit={handleAddToCart}
      isSubmitting={isSubmitting}
      qrToken={qrToken}
      titles={''}
    />
  );
};

export default CustMenuDetail;
