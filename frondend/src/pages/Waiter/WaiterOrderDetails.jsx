import React, { useState, useRef, useEffect } from "react";
import { Container } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { IoIosArrowBack, IoIosAdd } from "react-icons/io";
import { FiMinus } from "react-icons/fi";
import {
  FaCheck,
  FaChevronLeft,
  FaChevronRight,
  FaPlus,
  FaMinus,
  FaShoppingCart,
} from "react-icons/fa";
import "../../assets/css/Waiter/WaiterOrderDetails.css";
import breakfastImg from "/images/breakfast.png";
import scrambledEggsImg from "/images/scrambled_eggs.jpg";

// Mock sample product item for pure UI rendering when no item is passed in state
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

  // Selected item from state or fallback default item
  const item = location.state?.item || defaultItem;

  const carouselRef = useRef(null);

  // Interaction State
  const variations = item?.variations || [];
  const customizations = item?.customizations || [];
  const addons = item?.addons || [];

  const [selectedVariationId, setSelectedVariationId] = useState(
    variations.length > 0 ? variations[0].id : null
  );
  const [selectedCustomizations, setSelectedCustomizations] = useState([]);
  const [selectedAddonIds, setSelectedAddonIds] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [activeCarouselDot, setActiveCarouselDot] = useState(0);
  const [showToastBanner, setShowToastBanner] = useState(false);

  const images =
    item?.images && item.images.length > 0
      ? item.images
      : [{ id: 1, imageUrl: item?.image || breakfastImg }];

  // Carousel scroll controls
  const handleScrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -240, behavior: "smooth" });
    }
  };

  const handleScrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 240, behavior: "smooth" });
    }
  };

  // Customization selection toggle
  const handleCustomizationToggle = (customization) => {
    setSelectedCustomizations((prev) => {
      const isSelected = prev.some((c) => c.id === customization.id);
      if (isSelected) {
        return prev.filter((c) => c.id !== customization.id);
      } else {
        if (!customization.multiSelect) {
          const filtered = prev.filter((c) => c.multiSelect);
          return [...filtered, customization];
        }
        return [...prev, customization];
      }
    });
  };

  // Addon selection toggle
  const handleAddonToggle = (addonId) => {
    setSelectedAddonIds((prev) =>
      prev.includes(addonId)
        ? prev.filter((id) => id !== addonId)
        : [...prev, addonId]
    );
  };

  const handleQuantityChange = (change) => {
    setQuantity((prev) => Math.max(1, prev + change));
  };

  // Price calculations
  const selectedVariation = variations.find(
    (v) => v.id === selectedVariationId
  );
  const parsePrice = (val) => {
    if (typeof val === "number") return val;
    if (typeof val === "string") return Number(val.replace(/[^0-9.-]+/g, "")) || 0;
    return 0;
  };

  const displayBasePrice = parsePrice(item?.basePrice || item?.price);
  const displayDiscountedPrice = selectedVariation
    ? parsePrice(selectedVariation.price)
    : displayBasePrice;

  const customizationsTotal = selectedCustomizations.reduce(
    (sum, c) => sum + parsePrice(c.price),
    0
  );

  const selectedAddonsList = addons.filter((a) =>
    selectedAddonIds.includes(a.id)
  );
  const addonsTotal = selectedAddonsList.reduce((sum, a) => {
    const addonPrice = parsePrice(
      a.addonItem?.discountedPrice || a.addonItem?.basePrice || 0
    );
    return sum + addonPrice;
  }, 0);

  const unitPrice = displayDiscountedPrice + customizationsTotal + addonsTotal;
  const totalPrice = unitPrice * quantity;

  const handleAddToOrder = () => {
    setShowToastBanner(true);
    setTimeout(() => {
      setShowToastBanner(false);
    }, 3000);
  };

  return (
    <div className="wod-page">
      <Container fluid className="wod-container">
        {/* Header Navigation from WaiterMenuList */}
        <div className="wod-header-nav">
          <button className="wod-back-btn" onClick={() => navigate(-1)}>
            <IoIosArrowBack size={18} />
            <span>Back</span>
          </button>
          <div className="d-flex align-items-center gap-2">
            <h1 className="wod-category-title">
              {item?.name || "Menu Detail"}
            </h1>
          </div>
          <div></div>
        </div>

        {/* Complete Product Detail View from CustMenuDetail */}
        <div className="wod-main-content-layout">
          {/* Left Column: Image Carousel & Ingredients */}
          <div className="wod-left-column">
            <div className="wod-carousel-section">
              <div className="wod-carousel-track" ref={carouselRef}>
                {images.map((img, idx) => (
                  <div key={img.id || idx} className="wod-carousel-slide">
                    <img
                      src={img.imageUrl}
                      alt={`${item?.name || "Item"} ${idx + 1}`}
                      className="wod-main-image"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = breakfastImg;
                      }}
                    />
                  </div>
                ))}
              </div>

              {images.length > 1 && (
                <>
                  <button
                    className="wod-carousel-nav-btn left"
                    onClick={handleScrollLeft}
                    aria-label="Previous Image"
                  >
                    <FaChevronLeft />
                  </button>
                  <button
                    className="wod-carousel-nav-btn right"
                    onClick={handleScrollRight}
                    aria-label="Next Image"
                  >
                    <FaChevronRight />
                  </button>
                  <div className="wod-carousel-dots">
                    {images.map((_, dotIdx) => (
                      <span
                        key={dotIdx}
                        className={`wod-dot ${
                          activeCarouselDot === dotIdx ? "active" : ""
                        }`}
                        onClick={() => setActiveCarouselDot(dotIdx)}
                      ></span>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Ingredients Section — Desktop */}
            {item?.description && (
              <div className="wod-section-block wod-ingredients-left">
                <h3 className="wod-section-heading">Ingredients</h3>
                <p className="wod-ingredients-text">{item.description}</p>
              </div>
            )}
          </div>

          {/* Right Column: Title, Price, Variations, Customizations, Quantity & Addons */}
          <div className="wod-right-column">
            {/* Title Section */}
            <div className="wod-title-section">
              <h1 className="wod-title">{item?.name || "Menu Item"}</h1>
            </div>

            {/* Price Pill — rendered when variations are empty */}
            {(!variations || variations.length === 0) && (
              <div className="wod-price-wrapper">
                <div className="wod-price-row">
                  <div className="wod-discount-pill">
                    PKR {displayDiscountedPrice.toLocaleString()}
                  </div>
                </div>
              </div>
            )}

            {/* Variations Section */}
            <div className="wod-section-block">
              <h3 className="wod-section-heading">Variations</h3>
              {variations && variations.length > 0 ? (
                <div className="wod-variation-buttons-group">
                  {variations.map((v) => (
                    <div
                      key={v.id}
                      className={`wod-variation-btn ${
                        selectedVariationId === v.id ? "active" : ""
                      }`}
                      onClick={() => setSelectedVariationId(v.id)}
                    >
                      <span className="wod-variation-name">{v.name}</span>
                      <span className="wod-variation-price-text">
                        {v.price}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="wod-empty-msg">No variations for this item</div>
              )}
            </div>

            {/* Customizations Section */}
            <div className="wod-section-block">
              <h3 className="wod-section-heading">Customizations</h3>
              {customizations && customizations.length > 0 ? (
                <div className="wod-customizations-purple-card">
                  {customizations.map((c) => {
                    const isChecked = selectedCustomizations.some(
                      (sc) => sc.id === c.id
                    );
                    return (
                      <div
                        key={c.id}
                        className="wod-customization-item-row"
                        onClick={() => handleCustomizationToggle(c)}
                      >
                        <div className="wod-customization-left-group">
                          <div
                            className={`wod-custom-checkbox ${
                              isChecked ? "checked" : ""
                            }`}
                          >
                            {isChecked && <FaCheck className="wod-check-mark" />}
                          </div>
                          <span className="wod-customization-item-text">
                            {c.name}
                          </span>
                        </div>
                        <span className="wod-customization-item-price">
                          {c.price > 0 ? `PKR ${c.price}` : "Free"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="wod-empty-msg">
                  No customizations for this item
                </div>
              )}
            </div>

            {/* Quantity & Add to Order Action Button */}
            <div className="wod-section-block">
              <h3 className="wod-section-heading">Quantity</h3>
              <div className="wod-quantity-controls-bar">
                <div className="wod-quantity-control-wrapper">
                  <button
                    className="wod-quantity-btn minuss"
                    onClick={() => handleQuantityChange(-1)}
                    aria-label="Decrease quantity"
                  >
                    <FiMinus />
                  </button>
                  <span className="wod-quantity-value-display">
                    {String(quantity).padStart(2, "0")}
                  </span>
                  <button
                    className="wod-quantity-btn pluss"
                    onClick={() => handleQuantityChange(1)}
                    aria-label="Increase quantity"
                  >
                    <IoIosAdd />
                  </button>
                </div>
                <button
                  className="wod-add-main-btn"
                  onClick={handleAddToOrder}
                >
                  <span>Add to Order</span>
                  <span>PKR {totalPrice.toLocaleString()}</span>
                </button>
              </div>
            </div>

            {/* Ingredients Section — Mobile */}
            {item?.description && (
              <div className="wod-section-block wod-ingredients-mobile">
                <h3 className="wod-section-heading">Ingredients</h3>
                <p className="wod-ingredients-text">{item.description}</p>
              </div>
            )}

            {/* Addons Section */}
            <div className="wod-section-block">
              <div className="wod-addons-header">
                <h3 className="wod-section-heading">
                  Addons with {item?.name}
                </h3>
              </div>
              {addons && addons.length > 0 ? (
                <div className="wod-addons-scroll-container">
                  <div className="wod-addons-flex-list">
                    {addons.map((addon) => {
                      const addonItem = addon.addonItem;
                      if (!addonItem) return null;

                      const priceToDisplay = parsePrice(
                        addonItem.discountedPrice || addonItem.basePrice
                      );
                      const isAdded = selectedAddonIds.includes(addon.id);
                      const addonImg =
                        addonItem.images?.[0]?.imageUrl || breakfastImg;

                      return (
                        <div key={addon.id} className="wod-addon-card">
                          <div className="wod-addon-price-badge">
                            PKR {priceToDisplay}
                          </div>
                          <img
                            src={addonImg}
                            alt={addonItem.name}
                            className="wod-addon-card-image"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = breakfastImg;
                            }}
                          />
                          <div className="wod-addon-bottom-overlay">
                            <span className="wod-addon-title-text">
                              {addonItem.name}
                            </span>
                            <button
                              className={`wod-addon-plus-btn ${
                                isAdded ? "added" : ""
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddonToggle(addon.id);
                              }}
                              aria-label={`Toggle addon ${addonItem.name}`}
                            >
                              {isAdded ? <FaMinus /> : <FaPlus />}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="wod-empty-msg">No addons for this item</div>
              )}
            </div>
          </div>
        </div>

        {/* Floating Feedback Toast Banner */}
        {showToastBanner && (
          <div className="wod-toast-banner" onClick={() => setShowToastBanner(false)}>
            <div className="wod-toast-left">
              <div className="wod-toast-icon">
                <FaShoppingCart />
              </div>
              <div className="wod-toast-text">
                <span className="wod-toast-title">Added to Order</span>
                <span className="wod-toast-sub">
                  {quantity} x {item?.name} (PKR {totalPrice.toLocaleString()})
                </span>
              </div>
            </div>
            <div className="wod-toast-thumb">
              <img
                src={images[0]?.imageUrl || breakfastImg}
                alt="Cart thumbnail"
              />
            </div>
          </div>
        )}
      </Container>
    </div>
  );
};

export default WaiterOrderDetails;
