import React, { useState, useEffect, useRef } from "react";
import { Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import "../../assets/css/Customer/CustMenuDetail.css";
import {
  FaShoppingCart,
  FaPlus,
  FaMinus,
  FaCheck,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { FiMinus } from "react-icons/fi";
import { IoIosAdd, IoIosArrowBack } from "react-icons/io";
import { getThumbnailUrl } from "../../services/customer/menu/showmenu.service";
import { useCartCount, getCartNavigationPath } from "../../utils/cartStorage";

const ProductDetailView = ({
  effectiveItem,
  productDetails,
  detailsLoading = false,
  menuLoading = false,
  buttonLabel = "Add",
  initialSelection = {},
  onSubmit,
  isSubmitting = false,
  qrToken,
  titles = "",     
}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const cartCount = useCartCount();
  const carouselRef = useRef(null);

  // Interaction State
  const [selectedVariationId, setSelectedVariationId] = useState(null);
  const [selectedCustomizations, setSelectedCustomizations] = useState([]);
  const [selectedAddonIds, setSelectedAddonIds] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [activeCarouselDot, setActiveCarouselDot] = useState(0);
  const [activeAddonDot, setActiveAddonDot] = useState(0);
  const [showBanner, setShowBanner] = useState(false);

  const variations = productDetails?.variations || [];
  const customizations = productDetails?.customizations || [];
  const addons = productDetails?.addons || [];

  const title = effectiveItem?.name || "Menu Item";
  const mainImage = getThumbnailUrl(effectiveItem?.images);
  const images = effectiveItem?.images || [];

  // Carousel Scroll Handlers
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

  // Sync initial selection when props change
  useEffect(() => {
    if (initialSelection.quantity !== undefined) {
      setQuantity(Math.max(1, initialSelection.quantity));
    }

    if (initialSelection.selectedAddonIds) {
      setSelectedAddonIds(initialSelection.selectedAddonIds);
    }
  }, [initialSelection.quantity, initialSelection.selectedAddonIds]);

  // Handle variation initial selection or default selection
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
  }, [productDetails, initialSelection.variationId, initialSelection.variationName]);

  // Handle customizations initial selection or matching
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
  }, [productDetails, initialSelection.customizationId, initialSelection.customizationName]);

  // Customization selection toggle (handles multiSelect)
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
        : [...prev, addonId],
    );
  };

  // Addon card product navigation handler
  const handleAddonNavigation = (addon) => {
    const targetId = addon.addonItem?.id || addon.addonItemId;
    if (targetId) {
      if (qrToken) {
        navigate(`/customer/menu-details/t/${qrToken}/${targetId}`);
      } else {
        navigate(`/customer/menu-details/${targetId}`);
      }
    }
  };

  const handleQuantityChange = (change) => {
    setQuantity((prev) => Math.max(1, prev + change));
  };

  // Price Calculation
  const selectedVariation = variations.find(
    (v) => v.id === selectedVariationId,
  );

  const displayBasePrice = Number(effectiveItem?.basePrice || 0);

  const displayDiscountedPrice = selectedVariation
    ? Number(selectedVariation.price)
    : effectiveItem?.discountedPrice !== undefined &&
      effectiveItem?.discountedPrice !== null &&
      Number(effectiveItem.discountedPrice) > 0
      ? Number(effectiveItem.discountedPrice)
      : displayBasePrice;

  const customizationsTotal = selectedCustomizations.reduce(
    (sum, c) => sum + Number(c.price || 0),
    0,
  );

  const selectedAddonsList = addons.filter((a) =>
    selectedAddonIds.includes(a.id),
  );
  const addonsTotal = selectedAddonsList.reduce((sum, a) => {
    const itemPrice =
      a.addonItem?.discountedPrice !== undefined &&
        a.addonItem?.discountedPrice !== null &&
        Number(a.addonItem.discountedPrice) > 0
        ? Number(a.addonItem.discountedPrice)
        : Number(a.addonItem?.basePrice || 0);
    return sum + itemPrice;
  }, 0);

  const unitPrice = displayDiscountedPrice + customizationsTotal + addonsTotal;
  const totalPrice = unitPrice * quantity;

  const handleFormSubmit = () => {
    if (isSubmitting || !effectiveItem) return;

    const customizationNameStr =
      selectedCustomizations.length > 0
        ? selectedCustomizations.map((c) => c.name).join(", ")
        : undefined;

    const dto = {
      menuItemId: Number(effectiveItem.id),
      menuItemName: title,
      variationId: selectedVariationId || undefined,
      itemVariationName: selectedVariation?.name || undefined,
      customizationId: selectedCustomizations[0]?.id || undefined,
      itemCustomizationName: customizationNameStr,
      quantity,
      price: unitPrice,
      image: mainImage,
    };

    if (onSubmit) {
      onSubmit(dto);
      setShowBanner(true);
    }
  };

  // Cold cache miss loading state
  if (menuLoading && !effectiveItem) {
    return (
      <div className="product-detail-page">
        <div
          className="product-detail-card-container d-flex justify-content-center align-items-center"
          style={{ minHeight: "400px" }}
        >
          <Spinner animation="border" variant="primary" role="status">
            <span className="visually-hidden">Loading item details...</span>
          </Spinner>
        </div>
      </div>
    );
  }

  // Not Found State
  if (!menuLoading && !effectiveItem) {
    return (
      <div className="product-detail-page">
        <div className="product-detail-card-container text-center py-5">
          <h2 style={{ color: "#333", marginBottom: "15px" }}>
            Item Not Found
          </h2>
          <p style={{ color: "#666", marginBottom: "25px" }}>
            The requested menu item is unavailable or does not exist.
          </p>
          <button
            className="bottom-add-main-btn"
            style={{ width: "auto", padding: "12px 30px" }}
            onClick={() => navigate(-1)}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      <div className="product-detail-card-container">
        {/* Header Section */}
        <div className="product-header">
          <button
            className="back-btn"
            onClick={() => navigate(-1)}
            aria-label="Go Back"
          >
            <IoIosArrowBack size={15} />
            <span>Back</span>
          </button>
          <div><h5 className="cart-header-title">{titles}</h5></div>
          <div className="cart-wrapper">
            <img
              src="/images/grocery-store.png"
              alt="Shopping Cart"
              className="cart-image"
              onClick={() =>
                navigate(getCartNavigationPath(qrToken, queryClient))
              }
            />
            <div className="cart-count">{cartCount}</div>
          </div>
        </div>

        {/* 2-Column Main Content Container */}
        <div className="product-main-content-layout">
          {/* Left Column: Image Carousel & Ingredients */}
          <div className="product-left-column">
            <div className="product-carousel-section">
              <div className="product-carousel-track" ref={carouselRef}>
                {images.length > 0 ? (
                  images.map((img, idx) => (
                    <div key={img.id || idx} className="carousel-slide main-slide">
                      <img
                        src={img.imageUrl}
                        alt={`${title} ${idx + 1}`}
                        className="product-main-image"
                      />
                    </div>
                  ))
                ) : (
                  <div className="carousel-slide main-slide">
                    <img
                      src={mainImage || "/images/scrambled_eggs.jpg"}
                      alt={title}
                      className="product-main-image"
                    />
                  </div>
                )}
              </div>

              {images.length > 1 && (
                <>
                  <button
                    className="carousel-nav-btn left"
                    onClick={handleScrollLeft}
                    aria-label="Previous Image"
                  >
                    <FaChevronLeft />
                  </button>
                  <button
                    className="carousel-nav-btn right"
                    onClick={handleScrollRight}
                    aria-label="Next Image"
                  >
                    <FaChevronRight />
                  </button>
                </>
              )}

              {images.length > 1 && (
                <div className="image-carousel-dots">
                  {images.map((_, dotIdx) => (
                    <span
                      key={dotIdx}
                      className={`dot ${activeCarouselDot === dotIdx ? "active" : ""}`}
                      onClick={() => setActiveCarouselDot(dotIdx)}
                    ></span>
                  ))}
                </div>
              )}
            </div>

            {/* Ingredients Section — Desktop */}
            {effectiveItem?.description && (
              <div className="section-block ingredients-section ingredients-left">
                <h3 className="section-heading">Ingredients</h3>
                <p className="ingredients-text">{effectiveItem.description}</p>
              </div>
            )}
          </div>

          {/* Right Column: Title, Price, Variations, Customizations, Quantity & Addons */}
          <div className="product-right-column">
            {/* Title & Subtitle */}
            <div className="product-title-section">
              <h1 className="product-title">{title}</h1>
            </div>

            {/* Price Container - Only render when variations are empty */}
            {(!variations || variations.length === 0) && (
              <div className="price-container-wrapper">
                <div className="price-display-row">
                  {displayBasePrice > displayDiscountedPrice && displayBasePrice > 0 && (
                    <span className="original-price">
                      RS. {displayBasePrice.toLocaleString()}
                    </span>
                  )}
                  <div className="discount-price-pill">
                    RS. {displayDiscountedPrice.toLocaleString()}
                  </div>
                </div>
              </div>
            )}

            {/* Variations Section */}
            <div className="section-block variations-section">
              <h3 className="section-heading">Variations</h3>
              {detailsLoading ? (
                <div
                  style={{
                    height: "40px",
                    backgroundColor: "#e5e7eb",
                    borderRadius: "20px",
                    opacity: 0.6,
                  }}
                ></div>
              ) : variations && variations.length > 0 ? (
                <div className="variation-buttons-group">
                  {variations.map((v) => (
                    <div
                      key={v.id}
                      className={`variation-btn ${selectedVariationId === v.id ? "active" : ""}`}
                      onClick={() => setSelectedVariationId(v.id)}
                    >
                      <span className="variation-name">{v.name}</span>
                      <span className="variation-price-text">{v.price}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-section-msg">No variations for this item</div>
              )}
            </div>

            {/* Customizations Section */}
            <div className="section-block customizations-section">
              <h3 className="section-heading">Customizations</h3>
              {detailsLoading ? (
                <div
                  style={{
                    height: "80px",
                    backgroundColor: "#e5e7eb",
                    borderRadius: "15px",
                    opacity: 0.6,
                  }}
                ></div>
              ) : customizations && customizations.length > 0 ? (
                <div className="customizations-purple-card">
                  {customizations.map((c) => {
                    const isChecked = selectedCustomizations.some(
                      (sc) => sc.id === c.id,
                    );
                    return (
                      <div
                        key={c.id}
                        className="customization-item-row"
                        onClick={() => handleCustomizationToggle(c)}
                      >
                        <div className="customization-left-group">
                          <div
                            className={`custom-checkbox ${isChecked ? "checked" : ""}`}
                          >
                            {isChecked && <FaCheck className="check-mark" />}
                          </div>
                          <span className="customization-item-text">
                            {c.name}
                          </span>
                        </div>
                        <span className="customization-item-price">
                          {c.price > 0 ? `${c.price}` : "Free"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-section-msg">No customizations for this item</div>
              )}
            </div>

            {/* Quantity & Action Button */}
            <div className="section-block quantity-section">
              <h3 className="section-heading">Quantity</h3>
              <div className="quantity-controls-bar">
                <div className="quantity-control-wrapper">
                  <button
                    className="quantity-btns minuss"
                    onClick={() => handleQuantityChange(-1)}
                    aria-label="Decrease quantity"
                    disabled={isSubmitting}
                  >
                    <FiMinus />
                  </button>
                  <span className="quantity-value-display">
                    {String(quantity).padStart(2, "0")}
                  </span>
                  <button
                    className="quantity-btns pluss"
                    onClick={() => handleQuantityChange(1)}
                    aria-label="Increase quantity"
                    disabled={isSubmitting}
                  >
                    <IoIosAdd />
                  </button>
                </div>
                <button
                  className="bottom-add-main-btn full-width"
                  onClick={handleFormSubmit}
                  disabled={isSubmitting}
                  style={{ opacity: isSubmitting ? 0.7 : 1 }}
                >
                  <span>{isSubmitting ? "Processing..." : buttonLabel}</span>
                  <span>RS. {totalPrice.toLocaleString()}</span>
                </button>
              </div>
            </div>

            {/* Ingredients Section — Mobile */}
            {effectiveItem?.description && (
              <div className="section-block ingredients-section ingredients-mobile">
                <h3 className="section-heading">Ingredients</h3>
                <p className="ingredients-text">{effectiveItem.description}</p>
              </div>
            )}

            {/* Addons Section */}
            <div className="section-block addons-section">
              <div className="addons-header">
                <h3 className="section-heading">Addons with {title}</h3>
              </div>
              {detailsLoading ? (
                <div
                  style={{
                    height: "120px",
                    backgroundColor: "#e5e7eb",
                    borderRadius: "15px",
                    opacity: 0.6,
                  }}
                ></div>
              ) : addons && addons.length > 0 ? (
                <>
                  <div className="addons-scroll-container">
                    <div className="addons-flex-list">
                      {addons.map((addon) => {
                        const addonItem = addon.addonItem;
                        if (!addonItem) return null;

                        const priceToDisplay =
                          addonItem.discountedPrice !== undefined &&
                            addonItem.discountedPrice !== null &&
                            Number(addonItem.discountedPrice) > 0
                            ? addonItem.discountedPrice
                            : addonItem.basePrice;

                        const isAdded = selectedAddonIds.includes(addon.id);
                        const addonImageUrl = getThumbnailUrl(addonItem.images);

                        return (
                          <div
                            key={addon.id}
                            className="addon-card"
                            onClick={() => handleAddonNavigation(addon)}
                            style={{ cursor: "pointer" }}
                          >
                            <div className="addon-price-badge">
                              RS. {priceToDisplay}
                            </div>
                            <img
                              src={addonImageUrl}
                              alt={addonItem.name}
                              className="addon-card-image"
                            />
                            <div className="addon-bottom-overlay">
                              <span className="addon-title-text">
                                {addonItem.name}
                              </span>
                              <button
                                className={`addon-plus-btn ${isAdded ? "added" : ""}`}
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

                  {addons.length > 3 && (
                    <div className="addons-carousel-dots">
                      {[0, 1, 2, 3, 4].map((dotIdx) => (
                        <span
                          key={dotIdx}
                          className={`dot ${activeAddonDot === dotIdx ? "active" : ""}`}
                          onClick={() => setActiveAddonDot(dotIdx)}
                        ></span>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="empty-section-msg">No addons for this item</div>
              )}
            </div>
          </div>
        </div>

        {/* Floating Cart Banner */}
        {showBanner && (
          <div
            className="order-cart-floating-bar"
            style={{
              position: "fixed",
              bottom: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: "75%",
              borderRadius: "20px 20px 0 0",
              padding: "14px 24px",
              boxSizing: "border-box",
              zIndex: 9999,
              cursor: "pointer",
            }}
            onClick={() =>
              navigate(getCartNavigationPath(qrToken, queryClient))
            }
          >
            <div className="cart-info-left">
              <div className="cart-icon-circle">
                <FaShoppingCart className="cart-icon" />
              </div>
              <div className="cart-text-content">
                <span className="order-title">
                  {buttonLabel === "Update" ? "Item Updated in Cart" : "Item Added to Cart"}
                </span>
                <span className="items-count">{quantity} x {title}</span>
              </div>
            </div>
            <div className="cart-thumb-wrapper">
              <img
                src={mainImage || "/images/scrambled_eggs.jpg"}
                alt="Cart item"
                className="cart-thumb-image"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailView;
