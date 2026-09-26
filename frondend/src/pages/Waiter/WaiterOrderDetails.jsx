import React, { useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import WaiterProductDetailView from "../../components/waiter/component/WaiterProductDetailView";
import { useWaiterPOSMenuItemDetail } from "../../hooks/useWaiterPOS";
import {
  hasPermission,
  PERMISSION_CODES,
  PERMISSION_KEYS,
} from "../../utils/permissionUtils";

import { addWaiterCartItem } from "../../utils/waiterCartData";

const WaiterOrderDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { menuItemId: routeMenuItemId } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasPosViewPermission = hasPermission(
    PERMISSION_CODES.POS_VIEW,
    PERMISSION_KEYS.POS_VIEW
  );

  const itemIdFromState =
    location.state?.item?.id || location.state?.menuItemId;
  const targetMenuItemId = routeMenuItemId || itemIdFromState;

  const {
    productDetails,
    effectiveItem: fetchedEffectiveItem,
    detailsLoading,
    menuLoading,
  } = useWaiterPOSMenuItemDetail(targetMenuItemId);

  const activeItem = fetchedEffectiveItem || location.state?.item;

  const handleAddToCart = (dto) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      addWaiterCartItem(dto);
      setTimeout(() => {
        setIsSubmitting(false);
        navigate(-1);
      }, 800);
    } catch (err) {
      console.error("Error adding to waiter cart:", err);
      setIsSubmitting(false);
    }
  };

  if (!hasPosViewPermission) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
          width: "100%",
        }}
      >
        <h2 style={{ color: "#666", fontWeight: "700", fontSize: "1.8rem" }}>
          NO Found
        </h2>
      </div>
    );
  }

  return (
    <WaiterProductDetailView
      effectiveItem={activeItem}
      productDetails={productDetails}
      detailsLoading={detailsLoading}
      menuLoading={menuLoading}
      buttonLabel="Add"
      onSubmit={handleAddToCart}
      isSubmitting={isSubmitting}
      titles="Menu Detail"
    />
  );
};

export default WaiterOrderDetails;
