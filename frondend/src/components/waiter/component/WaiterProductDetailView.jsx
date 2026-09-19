import React, { useState, useEffect, useRef } from "react";
import { Container, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
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
import "../../../assets/css/Waiter/WaiterOrderDetails.css";
import breakfastImg from "/images/breakfast.png";
import scrambledEggsImg from "/images/scrambled_eggs.jpg";

/**
 * Shared Waiter Product Detail View component (analogous to customer-side ProductDetailView.jsx).
 * Used for both Add Item (WaiterOrderDetails) and Edit Item (WaiterEditMenuDetails) flows.
 */
const WaiterProductDetailView = ({
  effectiveItem,
  productDetails,
  detailsLoading = false,
  menuLoading = false,
  buttonLabel = "Add",
  initialSelection = {},
  onSubmit,
  isSubmitting = false,
  titles = "Menu Detail",
  onBack,
  onNavigateCart,
}) => {
  const navigate = useNavigate();
  const carouselRef = useRef(null);

  // Interaction State
  const [selectedVariationId, setSelectedVariationId] = useState(null);
  const [selectedCustomizations, setSelectedCustomizations] = useState([]);
  const [selectedAddonIds, setSelectedAddonIds] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [activeCarouselDot, setActiveCarouselDot] = useState(0);
  const [showBanner, setShowBanner] = useState(false);

  const variations = productDetails?.variations || effectiveItem?.variations || [];
  const customizations = productDetails?.customizations || effectiveItem?.customizations || [];
  const addons = productDetails?.addons || effectiveItem?.addons || [];

  const title = effectiveItem?.name || "Menu Item";
  const images =
    effectiveItem?.images && effectiveItem.images.length > 0
      ? effectiveItem.images
      : [{ id: 1, imageUrl: effectiveItem?.image || breakfastImg }];

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

  // Sync initial quantity & addons selection when props update
  useEffect(() => {
    if (initialSelection.quantity !== undefined && initialSelection.quantity !== null) {
      setQuantity(Math.max(1, Number(initialSelection.quantity)));
    }
    if (initialSelection.selectedAddonIds) {
      setSelectedAddonIds(initialSelection.selectedAddonIds);
    }
  }, [initialSelection.quantity, initialSelection.selectedAddonIds]);

  // Sync variation selection from initialSelection or default to first variation
  useEffect(() => {
    if (variations.length > 0) {
      if (initialSelection.variationId !== undefined && initialSelection.variationId !== null) {
        const matched = variations.find((v) => Number(v.id) === Number(initialSelection.variationId));
        if (matched) {
          setSelectedVariationId(matched.id);
        } else if (initialSelection.variationName) {
          const matchedByName = variations.find(
            (v) => v.name.toLowerCase() === initialSelection.variationName.toLowerCase()
          );
          setSelectedVariationId(matchedByName ? matchedByName.id : variations[0].id);
        } else {
          setSelectedVariationId(variations[0].id);
        }
      } else if (initialSelection.variationName) {
        const matchedByName = variations.find(
          (v) => v.name.toLowerCase() === initialSelection.variationName.toLowerCase()
        );
        setSelectedVariationId(matchedByName ? matchedByName.id : variations[0].id);
      } else {
        setSelectedVariationId(variations[0].id);
      }
    } else {
      setSelectedVariationId(null);
    }
  }, [productDetails, effectiveItem, initialSelection.variationId, initialSelection.variationName]);

  // Sync customizations from initialSelection
  useEffect(() => {
    if (customizations.length > 0) {
      if (initialSelection.customizationId !== undefined && initialSelection.customizationId !== null) {
        const matched = customizations.filter(
          (c) => Number(c.id) === Number(initialSelection.customizationId)
        );
        if (matched.length > 0) {
          setSelectedCustomizations(matched);
        }
      } else if (initialSelection.customizationName) {
        const matchedByName = customizations.filter((c) =>
          initialSelection.customizationName
            .toLowerCase()
            .includes(c.name.toLowerCase())
        );
        if (matchedByName.length > 0) {
          setSelectedCustomizations(matchedByName);
        }
      }
    }
  }, [productDetails, effectiveItem, initialSelection.customizationId, initialSelection.customizationName]);

  // Customization selection toggle (supports multiSelect)
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

  // Helper function to safely parse numerical prices from string or number
  const parsePrice = (val) => {
    if (typeof val === "number") return val;
    if (typeof val === "string") return Number(val.replace(/[^0-9.-]+/g, "")) || 0;
    return 0;
  };

  const selectedVariation = variations.find(
    (v) => v.id === selectedVariationId
  );

  const displayBasePrice = parsePrice(effectiveItem?.basePrice || effectiveItem?.price);
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
      a.addonItem?.discountedPrice || a.addonItem?.basePrice || a.price || 0
    );
    return sum + addonPrice;
  }, 0);

  const unitPrice = displayDiscountedPrice + customizationsTotal + addonsTotal;
  const totalPrice = unitPrice * quantity;

  const handleFormSubmit = () => {
    if (isSubmitting) return;

    const customizationNameStr =
      selectedCustomizations.length > 0
        ? selectedCustomizations.map((c) => c.name).join(", ")
        : undefined;

    const dto = {
      menuItemId: Number(effectiveItem?.id || 101),
      menuItemName: title,
      variationId: selectedVariationId || undefined,
      itemVariationName: selectedVariation?.name || undefined,
      customizationId: selectedCustomizations[0]?.id || undefined,
      itemCustomizationName: customizationNameStr,
      quantity,
      price: unitPrice,
      image: images[0]?.imageUrl || breakfastImg,
    };

    if (onSubmit) {
      onSubmit(dto);
    }
    setShowBanner(true);
    setTimeout(() => {
      setShowBanner(false);
    }, 3000);
  };

  // Loading state fallback
  if (menuLoading && !effectiveItem) {
    return (
      <div className="wod-page">
        <Container fluid className="wod-container d-flex justify-content-center align-items-center" style={{ minHeight: "400px" }}>
          <Spinner animation="border" variant="primary" role="status">
            <span className="visually-hidden">Loading item details...</span>
          </Spinner>
        </Container>
      </div>
    );
  }

  return (
    <div className="wod-page">
      <Container fluid className="wod-container">
        {/* Header Navigation */}
        <div className="wod-header-nav">
          <button
            className="wod-back-btn"
            onClick={onBack ? onBack : () => navigate(-1)}
            aria-label="Go Back"
          >
            <IoIosArrowBack size={18} />
            <span>Back</span>
          </button>
          <div className="d-flex align-items-center gap-2">
            <h1 className="wod-category-title">
              {titles}
            </h1>
          </div>
          <div className="wod-cart-wrapper">
            <img
              src="/images/grocery-store.png"
              alt="Shopping Cart"
              className="wod-cart-image"
              onClick={onNavigateCart ? onNavigateCart : () => navigate("/waiter/cart")}
            />
          </div>
        </div>

        {/* 2-Column Main Content Layout */}
        <div className="wod-main-content-layout">
          {/* Left Column: Image Carousel & Ingredients */}
          <div className="wod-left-column">
            <div className="wod-carousel-section">
              <div className="wod-carousel-track" ref={carouselRef}>
                {images.map((img, idx) => (
                  <div key={img.id || idx} className="wod-carousel-slide">
                    <img
                      src={img.imageUrl}
                      alt={`${title} ${idx + 1}`}
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
            {effectiveItem?.description && (
              <div className="wod-section-block wod-ingredients-left">
                <h3 className="wod-section-heading">Ingredients</h3>
                <p className="wod-ingredients-text">{effectiveItem.description}</p>
              </div>
            )}
          </div>

          {/* Right Column: Title, Price, Variations, Customizations, Quantity & Addons */}
          <div className="wod-right-column">
            {/* Title Section */}
            <div className="wod-title-section">
              <h1 className="wod-title">{title}</h1>
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
              {detailsLoading ? (
                <div style={{ height: "40px", backgroundColor: "#e5e7eb", borderRadius: "20px", opacity: 0.6 }}></div>
              ) : variations && variations.length > 0 ? (
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
              {detailsLoading ? (
                <div style={{ height: "80px", backgroundColor: "#e5e7eb", borderRadius: "15px", opacity: 0.6 }}></div>
              ) : customizations && customizations.length > 0 ? (
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
                          {c.price > 0 ? `${c.price}` : "Free"}
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

            {/* Quantity & Action Button */}
            <div className="wod-section-block">
              <h3 className="wod-section-heading">Quantity</h3>
              <div className="wod-quantity-controls-bar">
                <div className="wod-quantity-control-wrapper">
                  <button
                    className="wod-quantity-btn minuss"
                    onClick={() => handleQuantityChange(-1)}
                    aria-label="Decrease quantity"
                    disabled={isSubmitting}
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
                    disabled={isSubmitting}
                  >
                    <IoIosAdd />
                  </button>
                </div>
                <button
                  className="wod-add-main-btn"
                  onClick={handleFormSubmit}
                  disabled={isSubmitting}
                  style={{ opacity: isSubmitting ? 0.7 : 1 }}
                >
                  <span>{isSubmitting ? "Processing..." : buttonLabel}</span>
                  <span>PKR {totalPrice.toLocaleString()}</span>
                </button>
              </div>
            </div>

            {/* Ingredients Section — Mobile */}
            {effectiveItem?.description && (
              <div className="wod-section-block wod-ingredients-mobile">
                <h3 className="wod-section-heading">Ingredients</h3>
                <p className="wod-ingredients-text">{effectiveItem.description}</p>
              </div>
            )}

            {/* Addons Section */}
            <div className="wod-section-block">
              <div className="wod-addons-header">
                <h3 className="wod-section-heading">
                  Addons with {title}
                </h3>
              </div>
              {detailsLoading ? (
                <div style={{ height: "120px", backgroundColor: "#e5e7eb", borderRadius: "15px", opacity: 0.6 }}></div>
              ) : addons && addons.length > 0 ? (
                <div className="wod-addons-scroll-container">
                  <div className="wod-addons-flex-list">
                    {addons.map((addon) => {
                      const addonItem = addon.addonItem || addon;
                      if (!addonItem) return null;

                      const priceToDisplay = parsePrice(
                        addonItem.discountedPrice || addonItem.basePrice || addonItem.price
                      );
                      const isAdded = selectedAddonIds.includes(addon.id);
                      const addonImg =
                        addonItem.images?.[0]?.imageUrl || addonItem.image || breakfastImg;

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
        {showBanner && (
          <div className="wod-toast-banner" onClick={() => setShowBanner(false)}>
            <div className="wod-toast-left">
              <div className="wod-toast-icon">
                <FaShoppingCart />
              </div>
              <div className="wod-toast-text">
                <span className="wod-toast-title">
                  {buttonLabel === "Update" ? "Item Updated in Cart" : "Item Added to Order"}
                </span>
                <span className="wod-toast-sub">
                  {quantity} x {title} (PKR {totalPrice.toLocaleString()})
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

export default WaiterProductDetailView;
