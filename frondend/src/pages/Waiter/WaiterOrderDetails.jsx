import React, { useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useMenuItemDetail } from "../../hooks/useMenuItemDetail";
import WaiterProductDetailView from "../../components/waiter/component/WaiterProductDetailView";
import breakfastImg from "/images/breakfast.png";
import scrambledEggsImg from "/images/scrambled_eggs.jpg";

// Fallback sample product item when no item is passed in location state
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
  addons: [
    {
      id: 201,
      addonItem: {
        id: 107,
        name: "Pancakes with Syrup",
        basePrice: 1890,
        images: [{ imageUrl: breakfastImg }],
      },
    },
    {
      id: 202,
      addonItem: {
        id: 108,
        name: "Aloo Paratha",
        basePrice: 1200,
        images: [{ imageUrl: breakfastImg }],
      },
    },
    {
      id: 203,
      addonItem: {
        id: 106,
        name: "Pastas",
        basePrice: 2450,
        images: [{ imageUrl: breakfastImg }],
      },
    },
  ],
};

const WaiterOrderDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { menuItemId } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hook to fetch product detail or fall back to location state item
  const {
    productDetails,
    effectiveItem,
    detailsLoading,
    menuLoading,
  } = useMenuItemDetail(menuItemId, null, location.state?.item);

  const activeItem = effectiveItem || location.state?.item || defaultItem;
  const activeDetails = productDetails || activeItem;

  const handleAddToCart = (dto) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      navigate(-1);
    }, 1200);
  };

  return (
    <WaiterProductDetailView
      effectiveItem={activeItem}
      productDetails={activeDetails}
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
