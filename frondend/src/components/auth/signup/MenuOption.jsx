import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../../assets/css/auth/signup.css";
import "../../../assets/css/auth/menuOption.css";
import {
  FaHome,
  FaShoppingBag,
  FaMotorcycle,
  FaAngleDown,
} from "react-icons/fa";
import { createOrderTypeService } from "../../../services/onBoardingResturant/createResturant.serive";
import { useAlertStore } from "../../../context/alertStore";

const MenuOption = ({ onFinish, onBack }) => {
  const navigate = useNavigate();
  const alertStore = useAlertStore();

  const [menuLanguage, setMenuLanguage] = useState("English");
  const [orderTypes, setOrderTypes] = useState({
    dineIn: true,
    takeaways: true,
    deliveries: true,
  });
  const [deliveryCharges, setDeliveryCharges] = useState("200");
  const [currency, setCurrency] = useState("PKR");

  const handleOrderTypeToggle = (type) => {
    setOrderTypes((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare data for backend mapping
    const payload = {
      dineIn: orderTypes.dineIn,
      delivery: orderTypes.deliveries,
      takeaway: orderTypes.takeaways,
      deliveryCharges: orderTypes.deliveries ? parseFloat(deliveryCharges) : 0,
    };

    try {
      console.log("Submitting order types:", payload);
      await createOrderTypeService(payload);

      // Show success alert
      alertStore.showAlert("Successfully created your resturant info");

      // Call onFinish if provided (e.g. for potential local state updates in parent)
      if (onFinish) {
        onFinish(payload);
      }

      // Navigate to home route
      navigate("/");
    } catch (error) {
      console.error("Error creating order types:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to create restaurant info";
      alertStore.showAlert(errorMessage);
    }
  };

  return (
    <div className="signup-card menu-option-card">
      {/* Progress Dots */}
      <div className="progress-dots">
        <span className="progress-dot"></span>
        <span className="progress-dot"></span>
        <span className="progress-dot active"></span>
      </div>

      <h1 className="signup-title menu-option-title">
        Menu <span className="highlight-text">Options</span>
      </h1>

      {/* Menu Options Form */}
      <form className="signup-form menu-option-form" onSubmit={handleSubmit}>
        {/* Menu Language */}
        <div className="form-group">
          <label className="form-label">Menu Language</label>
          <div className="language-select-wrapper">
            <select
              className="form-input language-select"
              value={menuLanguage}
              onChange={(e) => setMenuLanguage(e.target.value)}
              required
            >
              <option value="English">English</option>
              <option value="Urdu">Urdu</option>
              <option value="Arabic">Arabic</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
            </select>
            <FaAngleDown className="dropdown-icon" />
          </div>
        </div>

        {/* Order Types */}
        <div className="form-group">
          <label className="form-label">Order Types</label>
          <div className="order-types-container">
            {/* Dine In */}
            <div
              className={`order-type-item ${orderTypes.dineIn ? "active" : ""}`}
              onClick={() => handleOrderTypeToggle("dineIn")}
            >
              <div className="order-type-content">
                <FaHome className="order-type-icon" />
                <span className="order-type-label">Dine In</span>
              </div>
              <div
                className={`order-type-checkbox ${orderTypes.dineIn ? "checked" : ""}`}
              >
                {orderTypes.dineIn && <span className="checkmark">✓</span>}
              </div>
            </div>

            {/* Takeaways */}
            <div
              className={`order-type-item ${orderTypes.takeaways ? "active" : ""}`}
              onClick={() => handleOrderTypeToggle("takeaways")}
            >
              <div className="order-type-content">
                <FaShoppingBag className="order-type-icon" />
                <span className="order-type-label">Takeaways</span>
              </div>
              <div
                className={`order-type-checkbox ${orderTypes.takeaways ? "checked" : ""}`}
              >
                {orderTypes.takeaways && <span className="checkmark">✓</span>}
              </div>
            </div>

            {/* Deliveries */}
            <div
              className={`order-type-item deliveries-item ${orderTypes.deliveries ? "active" : ""}`}
            >
              <div
                className="order-type-header"
                onClick={() => handleOrderTypeToggle("deliveries")}
              >
                <div className="order-type-content">
                  <FaMotorcycle className="order-type-icon" />
                  <span className="order-type-label">Deliveries</span>
                </div>
                <div
                  className={`order-type-checkbox ${orderTypes.deliveries ? "checked" : ""}`}
                >
                  {orderTypes.deliveries && (
                    <span className="checkmark">✓</span>
                  )}
                </div>
              </div>

              {/* Delivery Charges - Show when deliveries is active */}
              {orderTypes.deliveries && (
                <div className="delivery-charges-section">
                  <span className="delivery-charges-label">
                    Delivery Charges
                  </span>
                  <div className="delivery-charges-input-wrapper">
                    <select
                      className="currency-select"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <option value="PKR">PKR</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                    </select>
                    <FaAngleDown className="currency-dropdown-icon" />
                    <input
                      type="number"
                      className="delivery-charges-input"
                      value={deliveryCharges}
                      onChange={(e) => setDeliveryCharges(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      min="0"
                      placeholder="200"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="menu-option-actions">
          <button
            type="button"
            className="signup-btn menu-previous-btn"
            onClick={onBack}
          >
            Previous
          </button>
          <button type="submit" className="signup-btn menu-finish-btn">
            Finish
          </button>
        </div>
      </form>
    </div>
  );
};

export default MenuOption;
