import React from "react";
import { FaCheck } from "react-icons/fa";
import "./OrderPlaced.css";

const OrderPlaced = ({ show }) => {
  if (!show) return null;

  return (
    <div className="order-placed-overlay">
      <div className="order-placed-modal">
        <span className="order-placed-subtitle">Success</span>
        <h2 className="order-placed-title">Order Placed!</h2>
        <div className="order-placed-icon-box">
          <FaCheck className="order-placed-check-icon" />
        </div>
      </div>
    </div>
  );
};

export default OrderPlaced;
