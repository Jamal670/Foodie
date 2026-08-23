import React, { useState, useEffect } from "react";
import { Container } from "react-bootstrap";
import "../../assets/css/Customer/CustMenuDetail.css";
import { FaArrowLeft, FaShoppingCart, FaPlus, FaMinus, FaArrowRight } from "react-icons/fa";

// Import images (you'll need to replace these with actual image paths)
import breakfastImg from "/images/breakfast.png";
import toastImg from "/images/breakfast.png";
import avocadoImg from "/images/breakfast.png";
import sandwichImg from "/images/breakfast.png";

const CustListMenuListDetail = () => {
  const [selectedFriedState, setSelectedFriedState] = useState("Deep Fry");
  const [quantity, setQuantity] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [showBottomNav, setShowBottomNav] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const addons = [
    {
      id: 1,
      name: "Toasts",
      price: "Pkr 400",
      image: toastImg
    },
    {
      id: 2,
      name: "Avocado",
      price: "Pkr 400",
      image: avocadoImg
    },
    {
      id: 3,
      name: "Sandwich",
      price: "Pkr 400",
      image: sandwichImg
    }
  ];

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

  const basePrice = 3899;
  const addonPrice = selectedAddons.length * 400;
  const totalPrice = basePrice + addonPrice;

  const handleAddToCart = () => {
    setIsExiting(false);
    setShowBottomNav(true);
    // Start exit animation after 2.7 seconds, then hide after 3 seconds
    setTimeout(() => {
      setIsExiting(true);
    }, 2700);
    setTimeout(() => {
      setShowBottomNav(false);
      setIsExiting(false);
    }, 3000);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      setShowBottomNav(false);
    };
  }, []);

  return (
    <div className="product-detail-page">
      <Container fluid className="product-detail-container">
        {/* Header Section */}
        <div className="product-header">
          <button className="back-btn">
            <FaArrowLeft />
            <span>Back</span>
          </button>
          <h1 className="product-title">Scrambled Eggs</h1>
          <p className="product-subtitle">Served In <strong>25 Mins </strong> </p>
        </div>

        {/* Main Product Image */}
        <div className="product-image-section">
          <div className="product-image-wrapper">
            <img 
              src={breakfastImg} 
              alt="Scrambled Eggs" 
              className="product-main-image" 
            />
          </div>
          {/* Image Carousel Dots */}
          <div className="image-carousel-dots">
            <span className="dot active"></span>
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
        </div>

        {/* Product Options Section */}
        <div className="product-options">
          {/* Fried State */}
          <div className="option-group">
            <h3 className="option-heading">Fried State</h3>
            <div className="option-buttons">
              <button
                className={`option-btn ${selectedFriedState === "Deep Fry" ? "active" : ""}`}
                onClick={() => setSelectedFriedState("Deep Fry")}
              >
                Deep Fry
              </button>
              <button
                className={`option-btn ${selectedFriedState === "Extra Fry" ? "active" : ""}`}
                onClick={() => setSelectedFriedState("Extra Fry")}
              >
                Extra Fry
              </button>
            </div>
          </div>

          {/* Quantity */}
          <div className="option-group">
            <h3 className="option-heading">Quantity</h3>
            <div className="quantity-selector">
              <button 
                className="quantity-btn minus"
                onClick={() => handleQuantityChange(-1)}
              >
                <FaMinus />
              </button>
              <span className="quantity-value">{String(quantity).padStart(2, '0')}</span>
              <button 
                className="quantity-btn plus"
                onClick={() => handleQuantityChange(1)}
              >
                <FaPlus />
              </button>
            </div>
          </div>
        </div>

        {/* Add to Basket Button */}
        <div className="add-to-basket-section">
          <button className="add-to-basket-btn" onClick={handleAddToCart}>
            Add to Basket <FaShoppingCart />
          </button>
        </div>

        {/* Addons Section */}
        <div className="addons-section">
          <div className="addons-header">
            <h3 className="addons-title">Addons with Scrambled Eggs</h3>
            <FaArrowRight className="addons-arrow" />
          </div>
          
          <div className="addons-scroll-container">
            <div className="addons-list">
              {addons.map((addon) => (
                <div key={addon.id} className="addon-card">
                  <img 
                    src={addon.image} 
                    alt={addon.name} 
                    className="addon-image" 
                  />
                  <div className="addon-price">{addon.price}</div>
                  <div className="addon-bottom-row">
                  <div className="addon-name">{addon.name}</div>
                  <button
                    className={`addon-add-btn ${selectedAddons.includes(addon.id) ? "added" : ""}`}
                    onClick={() => handleAddonToggle(addon.id)}
                  >
                    {selectedAddons.includes(addon.id) ? <FaMinus /> : <FaPlus />}
                  </button>
                    </div>
                  
                </div>
              ))}
            </div>
          </div>

          {/* Addons Carousel Dots */}
          <div className="addons-carousel-dots">
            <span className="dot active"></span>
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
        </div>

          {/* Bottom Action Container - Price and Add Button (Sticky) */}
          <div className="bottom-action-container">
            <div className="bottom-price">PKR {totalPrice.toLocaleString()}</div>
            <button className="bottom-add-btn" onClick={handleAddToCart}>
              Add
            </button>
          </div>

          {/* Pop-up Panel - Shows for 3 seconds after Add is clicked */}
          {showBottomNav && (
            <div className="order-bar">
            <div className="order-bar-content">
              <FaShoppingCart className="order-cart-icon" />
              <div className="order-info">
                <span className="order-label">Order</span>
                <span className="order-items">{selectedAddons.length + quantity} Items</span>
              </div>
              <div className="order-image-wrapper">
                <img 
                  src={breakfastImg} 
                  alt="Order" 
                  className="order-image" 
                />
              </div>
            </div>
          </div>
          )}

          {/* Permanent Order Bar - Always visible at bottom */}
          
      </Container>
    </div>
  );
};

export default CustListMenuListDetail;

