import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../assets/css/Customer/CustCart.css";
import { FaArrowLeft, FaTimes, FaCheck, FaArrowRight } from "react-icons/fa";
import { FiMinus, FiShoppingBag } from "react-icons/fi";
import { IoIosAdd } from "react-icons/io";
import { FaPlus, FaMinus } from "react-icons/fa";

const CustCart = () => {
  const navigate = useNavigate();
  const { qrToken } = useParams();

  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Scrambled Eggs",
      image: "/images/scrambled_eggs.jpg",
      price: 3899,
      quantity: 1,
      showDetails: false,
      details: {
        variation: "Deep Fry",
        customizations: ["Extra fries on top,"],
        addons: ["Toast (RS. 600)"],
      },
    },
    {
      id: 2,
      name: "Scrambled Eggs",
      image: "/images/scrambled_eggs.jpg",
      price: 3899,
      quantity: 1,
      showDetails: false,
      details: {
        variation: "Extra Fry",
        customizations: [],
        addons: [],
      },
    },
  ]);

  const [paymentMethod, setPaymentMethod] = useState("Card"); // "Card" | "Cash"
  const [orderPlaced, setOrderPlaced] = useState(false);

  const handleQuantityChange = (id, change) => {
    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(1, item.quantity + change);
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (id) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const toggleDetails = (id) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, showDetails: !item.showDetails } : item
      )
    );
  };

  const handlePlaceOrder = () => {
    setOrderPlaced(true);
    setTimeout(() => {
      setOrderPlaced(false);
      if (qrToken) {
        navigate(`/customer/menu-orders/t/${qrToken}`);
      } else {
        navigate("/customer/menu-orders");
      }
    }, 1800);
  };

  // Calculations
  const itemsTotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const taxRate = paymentMethod === "Card" ? 0.05 : 0.16;
  const taxAmount = itemsTotal * taxRate;
  const finalSubtotal = itemsTotal + taxAmount;
  const taxLabel = paymentMethod === "Card" ? "Card Tax (5%)" : "Cash Tax (16%)";

  return (
    <div className="cust-cart-page">
      <div className="cust-cart-card-container">
        {/* Header Section */}
        <div className="cust-cart-header">
          <button
            className="cart-back-btn"
            onClick={() => navigate(-1)}
            aria-label="Go Back"
          >
            <FaArrowLeft />
            <span>Back</span>
          </button>
          <h1 className="cart-header-title">My Cart</h1>
          <div className="cart-wrapper">
                  <img
                    src="/images/grocery-store.png"
                    alt="Shopping Cart"
                    className="cart-image"
                    onClick={() => navigate("/customer/menu-orders")}
                  />

                  <div className="cart-count">2</div>
                </div>
        </div>

        {/* Main Content Layout (2-Column on Tablet & Monitor) */}
        <div className="cart-main-content-layout">
          {/* Left Column: Cart Items List */}
          <div className="cart-left-column">
            <div className="cart-items-list">
              {cartItems.length > 0 ? (
                cartItems.map((item) => (
                  <div key={item.id} className="cart-item-card">
                    <div className="cart-item-main-row">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="cart-item-thumb"
                      />
                      <div className="cart-item-center-info">
                        <div className="cart-item-top-header">
                          <h3 className="cart-item-name">{item.name}</h3>
                          <button
                            className="cart-remove-btn"
                            onClick={() => handleRemoveItem(item.id)}
                            aria-label="Remove item"
                          >
                            <FaTimes />
                          </button>
                        </div>

                        {/* Subtitle Details: Variation, Customization, Quantity + Price */}
                        <div className="cart-meta-details-list">
                          <div className="cart-meta-row-scroll">
                            <span className="cart-meta-label">Variation:</span>
                            <span className="cart-meta-value">
                              {item.details?.variation || "Small"}
                            </span>
                          </div>
                          <div className="cart-meta-row-scroll">
                            <span className="cart-meta-label">Customization:</span>
                            <span className="cart-meta-value">
                              {item.details?.customizations?.length > 0
                                ? item.details.customizations.join(", ")
                                : "Extra Cheez"}
                            </span>
                          </div>

                          {/* Quantity row with price on the right side */}
                          <div className="cart-meta-quantity-price-row">
                            <div className="cart-meta-qty-group">
                              <span className="cart-meta-label">Quantity:</span>
                              <div className="cart-quantity-controls-inline">
                                <button
                                  className="cart-qty-btn minus"
                                  onClick={() => handleQuantityChange(item.id, -1)}
                                  aria-label="Decrease quantity"
                                >
                                <FaMinus />
                                </button>
                                <span className="cart-qty-val">{item.quantity}</span>
                                <button
                                  className="cart-qty-btn plus"
                                  onClick={() => handleQuantityChange(item.id, 1)}
                                  aria-label="Increase quantity"
                                >
                                  <FaPlus />
                                </button>
                              </div>
                            </div>
                            <span className="cart-item-small-price">
                              RS. {(item.price * item.quantity).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="cart-empty-view">
                  <p>Your cart is empty.</p>
                  <button
                    className="cart-browse-btn"
                    onClick={() => navigate(-1)}
                  >
                    Browse Menu
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Checkout Summary & Payment Options */}
          {cartItems.length > 0 && (
            <div className="cart-right-column">
              <div className="cart-sticky-checkout-container">
                {/* Paid By Section */}
                <div className="checkout-section-block">
                  <h4 className="checkout-section-heading">Paid By</h4>
                  <div className="payment-options-row">
                    <div
                      className={`payment-option-card ${
                        paymentMethod === "Card" ? "selected" : ""
                      }`}
                      onClick={() => setPaymentMethod("Card")}
                    >
                      <div
                        className={`payment-radio ${
                          paymentMethod === "Card" ? "checked" : ""
                        }`}
                      >
                        {paymentMethod === "Card" && (
                          <FaCheck className="radio-check-icon" />
                        )}
                      </div>
                      <span className="payment-label">Card (+5% Tax)</span>
                    </div>

                    <div
                      className={`payment-option-card ${
                        paymentMethod === "Cash" ? "selected" : ""
                      }`}
                      onClick={() => setPaymentMethod("Cash")}
                    >
                      <div
                        className={`payment-radio ${
                          paymentMethod === "Cash" ? "checked" : ""
                        }`}
                      >
                        {paymentMethod === "Cash" && (
                          <FaCheck className="radio-check-icon" />
                        )}
                      </div>
                      <span className="payment-label">Cash (+16% Tax)</span>
                    </div>
                  </div>
                </div>

                {/* Summary Calculations */}
                <div className="checkout-summary-list">
                  {/* Total Row */}
                  <div className="summary-row">
                    <span className="summary-label">Total</span>
                    <span className="summary-val">
                      Rs. {Math.round(itemsTotal).toLocaleString()}
                    </span>
                  </div>

                  {/* Tax Row */}
                  <div className="summary-row">
                    <span className="summary-label">{taxLabel}</span>
                    <span className="summary-val">
                      Rs. {Math.round(taxAmount).toLocaleString()}
                    </span>
                  </div>

                  {/* Subtotal Row */}
                  <div className="summary-row final-subtotal-row">
                    <span className="summary-label">Subtotal</span>
                    <span className="summary-val">
                      Rs. {Math.round(finalSubtotal).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Place Your Order Button */}
                <button
                  className="place-order-main-btn"
                  onClick={handlePlaceOrder}
                >
                  <span>Place Your Order</span>
                  <FaArrowRight className="btn-arrow-icon" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustCart;
