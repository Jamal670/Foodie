import React, { useState } from "react";
import { useNavigate, useLocation, useParams, useSearchParams } from "react-router-dom";
import { useMenuItemDetail } from "../../hooks/useMenuItemDetail";
import WaiterProductDetailView from "../../components/waiter/component/WaiterProductDetailView";
import breakfastImg from "/images/breakfast.png";
import scrambledEggsImg from "/images/scrambled_eggs.jpg";

// Default item fallback when no state is passed
const defaultItem = {
  id: 101,
  name: "Scrambled Eggs",
  category: "Eggs",
  basePrice: 3899,
  discountedPrice: 3899,
  description:
    "Freshly scrambled eggs served with butter toast, fresh herbs, and mild seasoning.",
  images: [
    { id: 1, imageUrl: breakfastImg },
    { id: 2, imageUrl: scrambledEggsImg },
  ],
  variations: [
    { id: 1, name: "Single", price: "3,899" },
    { id: 2, name: "Double", price: "5,200" },
  ],
  customizations: [
    { id: 1, name: "Extra Cheese", price: 250, multiSelect: true },
    { id: 2, name: "Spicy Salsa", price: 150, multiSelect: true },
    { id: 3, name: "Butter Toast", price: 0, multiSelect: true },
  ],
  addons: [],
};

/**
 * WaiterEditMenuDetails component.
 * Allows editing an existing cart item on the waiter side by pre-selecting its variation, customization, and quantity.
 */
const WaiterEditMenuDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { menuItemId, cartItemId } = useParams();
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Extract initial selections from URL query string or location state item
  const itemInState = location.state?.item;
  const quantityParam = Number(searchParams.get("quantity") || itemInState?.quantity || 1);
  const variationIdParam = searchParams.get("variationId");
  const customizationIdParam = searchParams.get("customizationId");
  const variationNameParam = searchParams.get("variationName") || itemInState?.itemVariationName;
  const customizationNameParam = searchParams.get("customizationName") || itemInState?.itemCustomizationName;

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
  } = useMenuItemDetail(menuItemId, null, itemInState);

  const activeItem = effectiveItem || itemInState || defaultItem;
  const activeDetails = productDetails || activeItem;

  const handleUpdateItem = (dto) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      navigate("/waiter/cart");
    }, 1200);
  };

  return (
    <WaiterProductDetailView
      effectiveItem={activeItem}
      productDetails={activeDetails}
      detailsLoading={detailsLoading}
      menuLoading={menuLoading}
      buttonLabel="Update"
      initialSelection={initialSelection}
      onSubmit={handleUpdateItem}
      isSubmitting={isSubmitting}
      titles="Edit Product"
    />
  );
};

export default WaiterEditMenuDetails;
