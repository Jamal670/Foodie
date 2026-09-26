import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../assets/css/Waiter/WaiterCart.css";
import { FaTimes, FaCheck, FaArrowRight } from "react-icons/fa";
import { IoIosArrowBack } from "react-icons/io";
import {
  getWaiterCartItems,
  removeWaiterCartItem,
  WAITER_CART_EVENT,
} from "../../utils/waiterCartData";

const WaiterCart = () => {
  const navigate = useNavigate();

  // Local state initialized directly from localStorage helper waiterCartData.js
  const [cartItems, setCartItems] = useState(() => getWaiterCartItems());
  const [paymentMethod, setPaymentMethod] = useState("Card"); // "Card" | "Cash"

  // Listen to waiterCartData updates in localStorage
  useEffect(() => {
    const syncCart = () => {
      setCartItems(getWaiterCartItems());
    };

    window.addEventListener(WAITER_CART_EVENT, syncCart);
    window.addEventListener("storage", syncCart);

    return () => {
      window.removeEventListener(WAITER_CART_EVENT, syncCart);
      window.removeEventListener("storage", syncCart);
    };
  }, []);

  const handleRemoveItem = (id) => {
    const updated = removeWaiterCartItem(id);
    setCartItems(updated);
  };

  const handleEditCartItem = (item) => {
    const queryParams = new URLSearchParams();
    if (item.quantity) queryParams.set("quantity", item.quantity.toString());
    if (item.variationId) queryParams.set("variationId", item.variationId.toString());
    if (item.customizationId) queryParams.set("customizationId", item.customizationId.toString());
    if (item.itemVariationName) queryParams.set("variationName", encodeURIComponent(item.itemVariationName));
    if (item.itemCustomizationName) queryParams.set("customizationName", encodeURIComponent(item.itemCustomizationName));

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
    const targetPath = `/waiter/menu/edit/${item.menuItemId || item.id}/${item.id}${queryString}`;

    navigate(targetPath, { state: { item } });
  };

  const handlePlaceOrder = () => {
    if (cartItems.length === 0) return;
    navigate("/waiter/orders", { state: { paymentMethod } });
  };

  const handleBrowseProducts = () => {
    navigate("/waiter/order-menu");
  };

  // Total Calculations (Price represents line item total or price)
  const itemsTotal = cartItems.reduce(
    (sum, item) => sum + Number(item.price || 0),
    0
  );
  const taxRate = paymentMethod === "Card" ? 0.05 : 0.16;
  const taxAmount = itemsTotal * taxRate;
  const finalSubtotal = itemsTotal + taxAmount;
  const taxLabel = paymentMethod === "Card" ? "Card Tax (5%)" : "Cash Tax (16%)";

  return (
    <div className="waiter-cart-page">
      <div className="waiter-cart-card-container">
        {/* Header Section */}
        <div className="waiter-cart-header">
          <button
            className="waiter-cart-back-btn"
            onClick={() => navigate(-1)}
            aria-label="Go Back"
          >
            <IoIosArrowBack size={15} />
            <span>Back</span>
          </button>
          <div className="d-flex align-items-center gap-2">
            <h1 className="wod-category-title">
              My Cart
            </h1>
          </div>
          <div></div>
        </div>

        {/* Main Content Layout */}
        <div className="waiter-cart-main-content-layout">
          {/* Left Column: Cart Items List */}
          <div className="waiter-cart-left-column">
            <div className="waiter-cart-items-list">
              {cartItems.length > 0 ? (
                cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="waiter-cart-item-card"
                    onClick={() => handleEditCartItem(item)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="waiter-cart-item-main-row">
                      <img
                        src={item.image || "/images/scrambled_eggs.jpg"}
                        alt={item.menuItemName}
                        className="waiter-cart-item-thumb"
                      />
                      <div className="waiter-cart-item-center-info">
                        <div className="waiter-cart-item-top-header">
                          <h3 className="waiter-cart-item-name">
                            {item.menuItemName}
                          </h3>
                          <button
                            className="waiter-cart-remove-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveItem(item.id);
                            }}
                            aria-label="Remove item"
                          >
                            <FaTimes />
                          </button>
                        </div>

                        {/* Subtitle Details: Variation, Customization, Quantity + Price */}
                        <div className="waiter-cart-meta-details-list">
                          <div className="waiter-cart-meta-row-scroll">
                            <span className="waiter-cart-meta-label">
                              Variation:
                            </span>
                            <span className="waiter-cart-meta-value">
                              {item.itemVariationName || "Standard"}
                            </span>
                          </div>
                          <div className="waiter-cart-meta-row-scroll">
                            <span className="waiter-cart-meta-label">
                              Customization:
                            </span>
                            <span className="waiter-cart-meta-value">
                              {item.itemCustomizationName || "None"}
                            </span>
                          </div>

                          {/* Quantity row with line total price on the right side */}
                          <div className="waiter-cart-meta-quantity-price-row">
                            <div className="waiter-cart-meta-qty-group">
                              <span className="waiter-cart-meta-label">
                                Quantity:
                              </span>
                              <span
                                className="waiter-cart-qty-val"
                                style={{ marginLeft: "6px", fontWeight: 600 }}
                              >
                                {item.quantity}
                              </span>
                            </div>
                            <span className="waiter-cart-item-small-price">
                              RS. {Number(item.price || 0).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="waiter-cart-empty-view text-center py-5">
                  <h2 style={{ color: "#333", marginBottom: "8px" }}>Oops!</h2>
                  <p style={{ color: "#666", marginBottom: "20px" }}>
                    Your cart is Empty.
                  </p>
                  <button
                    className="waiter-cart-browse-btn"
                    onClick={handleBrowseProducts}
                  >
                    Browse Products
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Checkout Summary & Payment Options */}
          <div className="waiter-cart-right-column">
            <div className="waiter-cart-sticky-checkout-container">
              {/* Paid By Section */}
              <div className="waiter-cart-checkout-section-block">
                <h4 className="waiter-cart-checkout-section-heading">
                  Paid By
                </h4>
                <div className="waiter-cart-payment-options-row">
                  <div
                    className={`waiter-cart-payment-option-card ${
                      paymentMethod === "Card" ? "selected" : ""
                    }`}
                    onClick={() => setPaymentMethod("Card")}
                  >
                    <div
                      className={`waiter-cart-payment-radio ${
                        paymentMethod === "Card" ? "checked" : ""
                      }`}
                    >
                      {paymentMethod === "Card" && (
                        <FaCheck className="waiter-cart-radio-check-icon" />
                      )}
                    </div>
                    <span className="waiter-cart-payment-label">
                      Card (+5% Tax)
                    </span>
                  </div>

                  <div
                    className={`waiter-cart-payment-option-card ${
                      paymentMethod === "Cash" ? "selected" : ""
                    }`}
                    onClick={() => setPaymentMethod("Cash")}
                  >
                    <div
                      className={`waiter-cart-payment-radio ${
                        paymentMethod === "Cash" ? "checked" : ""
                      }`}
                    >
                      {paymentMethod === "Cash" && (
                        <FaCheck className="waiter-cart-radio-check-icon" />
                      )}
                    </div>
                    <span className="waiter-cart-payment-label">
                      Cash (+16% Tax)
                    </span>
                  </div>
                </div>
              </div>

              {/* Summary Calculations */}
              <div className="waiter-cart-checkout-summary-list">
                {/* Total Row */}
                <div className="waiter-cart-summary-row">
                  <span className="waiter-cart-summary-label">Total</span>
                  <span className="waiter-cart-summary-val">
                    Rs. {Math.round(itemsTotal).toLocaleString()}
                  </span>
                </div>

                {/* Tax Row */}
                <div className="waiter-cart-summary-row">
                  <span className="waiter-cart-summary-label">{taxLabel}</span>
                  <span className="waiter-cart-summary-val">
                    Rs. {Math.round(taxAmount).toLocaleString()}
                  </span>
                </div>

                {/* Subtotal Row */}
                <div className="waiter-cart-summary-row waiter-cart-final-subtotal-row">
                  <span className="waiter-cart-summary-label">Subtotal</span>
                  <span className="waiter-cart-summary-val">
                    Rs. {Math.round(finalSubtotal).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Place Your Order Button */}
              <button
                className="waiter-cart-place-order-main-btn"
                onClick={handlePlaceOrder}
                disabled={cartItems.length === 0}
                style={{
                  opacity: cartItems.length === 0 ? 0.5 : 1,
                  cursor: cartItems.length === 0 ? "not-allowed" : "pointer",
                }}
              >
                <span>Place Your Order</span>
                <FaArrowRight className="waiter-cart-btn-arrow-icon" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaiterCart;
