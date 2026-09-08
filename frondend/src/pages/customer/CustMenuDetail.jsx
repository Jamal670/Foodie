import React, { useState } from "react";
import { Container } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import "../../assets/css/Customer/CustMenuDetail.css";
import {
  FaArrowLeft,
  FaShoppingCart,
  FaPlus,
  FaMinus,
  FaArrowRight,
  FaCheck
} from "react-icons/fa";
import { FiShoppingBag, FiMinus } from "react-icons/fi";
import { IoIosAdd } from "react-icons/io";

const CustListMenuListDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get passed item state or fallback to default Scrambled Eggs
  const itemData = location.state?.item || {};

  const [selectedFriedState, setSelectedFriedState] = useState("Deep Fry");
  const [quantity, setQuantity] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [activeCarouselDot, setActiveCarouselDot] = useState(0);
  const [activeAddonDot, setActiveAddonDot] = useState(0);

  // Customizations state (matching the 3 options in the uploaded image)
  const [customizations, setCustomizations] = useState([
    { id: 1, text: "Extra fries on top", checked: true },
    { id: 2, text: "Extra fries on top", checked: false },
    { id: 3, text: "Extra fries on top", checked: true }
  ]);

  // Addons list with generated high-resolution assets
  const addons = [
    {
      id: 1,
      name: "Toasts",
      price: "Pkr 400",
      numericPrice: 400,
      image: "/images/toast_addon.jpg"
    },
    {
      id: 2,
      name: "Avocado",
      price: "Pkr 400",
      numericPrice: 400,
      image: "/images/avocado_addon.jpg"
    },
    {
      id: 3,
      name: "Sandwich",
      price: "Pkr 400",
      numericPrice: 400,
      image: "/images/sandwich_addon.jpg"
    }
  ];

  const handleCustomizationToggle = (id) => {
    setCustomizations(prev =>
      prev.map(c => c.id === id ? { ...c, checked: !c.checked } : c)
    );
  };

  const handleAddonToggle = (addonId) => {
    setSelectedAddons(prev =>
      prev.includes(addonId)
        ? prev.filter(id => id !== addonId)
        : [...prev, addonId]
    );
  };

  const handleQuantityChange = (change) => {
    setQuantity(prev => Math.max(1, prev + change));
  };

  // Pricing calculations
  const originalPrice = 3999;
  const baseDiscountPrice = 2899;
  const addonsTotal = selectedAddons.length * 400;
  const totalPrice = (baseDiscountPrice + addonsTotal) * quantity;
  const totalItemCount = quantity + selectedAddons.length;

  const mainImage = itemData.image || "/images/scrambled_eggs.jpg";
  const title = itemData.name || "Scrambled Eggs";

  return (
    <div className="product-detail-page">
      {/* Centered mobile card frame for desktop & seamless mobile view */}
      <div className="product-detail-card-container">

        {/* Header Section */}
        <div className="product-header">
          <button className="back-btn" onClick={() => navigate(-1)} aria-label="Go Back">
            <FaArrowLeft />
            <span>Back</span>
          </button>
          <div className="cart-wrapper">
            <img
              src="/images/grocery-store.png"
              alt="Shopping Cart"
              className="cart-image"
              onClick={() => navigate("/customer/menu-orders")}
            />

            <div className="cart-count">
              2
            </div>
          </div>
        </div>

        {/* Title & Prep Time */}
        <div className="product-title-section">
          <h1 className="product-title">{title}</h1>
          <p className="product-subtitle">
            Served In <strong>25 Mins</strong>
          </p>
        </div>

        {/* Hero Image Slider with Next-Image Peek */}
        <div className="product-carousel-section">
          <div className="product-carousel-track">
            <div className="carousel-slide main-slide">
              <img
                src={mainImage}
                alt={title}
                className="product-main-image"
              />
            </div>
            <div className="carousel-slide peek-slide">
              <img
                src={mainImage}
                alt={`${title} Preview`}
                className="product-main-image"
              />
            </div>
          </div>

          {/* Image Carousel Dots (5 dots) */}
          <div className="image-carousel-dots">
            {[0, 1, 2, 3, 4].map((dotIdx) => (
              <span
                key={dotIdx}
                className={`dot ${activeCarouselDot === dotIdx ? "active" : ""}`}
                onClick={() => setActiveCarouselDot(dotIdx)}
              ></span>
            ))}
          </div>
        </div>

        {/* Price Row: Strikethrough Original & Discounted Pill */}
        <div className="price-display-row">
          <span className="original-price">RS. {originalPrice.toLocaleString()}</span>
          <div className="discount-price-pill">
            RS. {baseDiscountPrice.toLocaleString()}
          </div>
        </div>

        {/* Variations Section */}
        <div className="section-block variations-section">
          <h3 className="section-heading">Variations</h3>
          <div className="variation-buttons-group">
            <button
              className={`variation-btn ${selectedFriedState === "Deep Fry" ? "active" : ""}`}
              onClick={() => setSelectedFriedState("Deep Fry")}
            >
              Deep Fry
            </button>
            <button
              className={`variation-btn ${selectedFriedState === "Extra Fry" ? "active" : ""}`}
              onClick={() => setSelectedFriedState("Extra Fry")}
            >
              Extra Fry
            </button>
          </div>
        </div>

        {/* Customizations Section (Purple container box with checked pills) */}
        <div className="section-block customizations-section">
          <h3 className="section-heading">Customizations</h3>
          <div className="customizations-purple-card">
            {customizations.map((item) => (
              <div
                key={item.id}
                className="customization-item-row"
                onClick={() => handleCustomizationToggle(item.id)}
              >
                <span className="customization-item-text">{item.text}</span>
                <div className={`custom-checkbox ${item.checked ? "checked" : ""}`}>
                  {item.checked && <FaCheck className="check-mark" />}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quantity Section */}
        <div className="section-block quantity-section">
          <h3 className="section-heading">Quantity</h3>
          {/* Bottom Pre-Cart Action Container (Price + Add button) */}
          <div className="bottom-action-bar">
              <div className="quantity-control-wrapper">
            <button 
              className="quantity-btns minuss"
              onClick={() => handleQuantityChange(-1)}
              aria-label="Decrease quantity"
            >
              <FiMinus  />
            </button>
            <span className="quantity-value-display">
              {String(quantity).padStart(2, '0')}
            </span>
            <button 
              className="quantity-btns pluss"
              onClick={() => handleQuantityChange(1)}
              aria-label="Increase quantity"
            >
              <IoIosAdd />
            </button>
          </div>
            <button className="bottom-add-main-btn">
              Add
            </button>
          </div>

        </div>

        {/* Addons Section */}
        <div className="section-block addons-section">
          <div className="addons-header">
            <h3 className="section-heading">Addons with {title}</h3>
            <FaArrowRight className="addons-arrow-icon" />
          </div>

          <div className="addons-scroll-container">
            <div className="addons-flex-list">
              {addons.map((addon) => (
                <div key={addon.id} className="addon-card">
                  <div className="addon-price-badge">{addon.price}</div>
                  <img
                    src={addon.image}
                    alt={addon.name}
                    className="addon-card-image"
                  />
                  <div className="addon-bottom-overlay">
                    <span className="addon-title-text">{addon.name}</span>
                    <button
                      className={`addon-plus-btn ${selectedAddons.includes(addon.id) ? "added" : ""}`}
                      onClick={() => handleAddonToggle(addon.id)}
                      aria-label={`Toggle addon ${addon.name}`}
                    >
                      {selectedAddons.includes(addon.id) ? <FaMinus /> : <FaPlus />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Addons Carousel Dots (5 dots) */}
          <div className="addons-carousel-dots">
            {[0, 1, 2, 3, 4].map((dotIdx) => (
              <span
                key={dotIdx}
                className={`dot ${activeAddonDot === dotIdx ? "active" : ""}`}
                onClick={() => setActiveAddonDot(dotIdx)}
              ></span>
            ))}
          </div>
        </div>



        {/* Floating Cart Banner ("Page with cart enabled") */}
        <div className="order-cart-floating-bar">
          <div className="cart-info-left">
            <div className="cart-icon-circle">
              <FaShoppingCart className="cart-icon" />
            </div>
            <div className="cart-text-content">
              <span className="order-title">Order</span>
              <span className="items-count">{totalItemCount} Items</span>
            </div>
          </div>
          <div className="cart-thumb-wrapper">
            <img
              src={mainImage}
              alt="Cart item"
              className="cart-thumb-image"
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default CustListMenuListDetail;


