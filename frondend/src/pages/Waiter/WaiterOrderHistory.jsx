import React, { useState } from "react";
import "../../assets/css/Waiter/WaiterOrderHistory.css";
import FoodieLogo from "../../components/common/FoodieLogo";
import OrderServings from "../../components/waiter/OrderServings";
import PendingPayments from "../../components/waiter/PendingPayments";

const WaiterOrderHistory = () => {
  const [activeTab, setActiveTab] = useState("orderServings");

  return (
    <div className="waiter-order-history">
      {/* Header */}
      <div className="woh-header">
        <div className="woh-header-row">
          <FoodieLogo style={{ marginBottom: "10px" }} />
          <h1 className="woh-title">Chayé Khana</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="woh-tabs">
        <button
          className={`woh-tab ${activeTab === "orderServings" ? "active" : ""}`}
          onClick={() => setActiveTab("orderServings")}
        >
          Order Servings
          <span className="woh-badge">03</span>
        </button>
        <button
          className={`woh-tab ${
            activeTab === "pendingPayments" ? "active" : ""
          }`}
          onClick={() => setActiveTab("pendingPayments")}
        >
          Pending Payments
          <span className="woh-badge">12</span>
        </button>
      </div>

      {/* Orders Container */}
      {activeTab === "orderServings" ? (
        <OrderServings />
      ) : (
        <PendingPayments />
      )}
    </div>
  );
};

export default WaiterOrderHistory;
