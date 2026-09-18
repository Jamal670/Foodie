import React from "react";
import FoodieLogo from "../../common/FoodieLogo";
import { FaCashRegister, FaUtensils } from "react-icons/fa";

const WaiterNavbar = ({ activeTab, setActiveTab }) => {
  return (
    <>
      {/* Header Section */}
      <div className="wom-header">
        <div className="wom-header-top">
          <div className="wom-title-group">
            <FoodieLogo />
            <h1 className="wom-restaurant-title">Chayé Khana</h1>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="wom-tabs-bar" role="tablist">
        <button
          role="tab"
          aria-selected={activeTab === "POS"}
          className={`wom-tab-btn ${activeTab === "POS" ? "active" : ""}`}
          onClick={() => setActiveTab("POS")}
        >
          <FaCashRegister style={{ fontSize: "0.9rem" }} />
          <span>POS</span>
        </button>

        <button
          role="tab"
          aria-selected={activeTab === "ORDERS"}
          className={`wom-tab-btn ${activeTab === "ORDERS" ? "active" : ""}`}
          onClick={() => setActiveTab("ORDERS")}
        >
          <FaUtensils style={{ fontSize: "0.85rem" }} />
          <span>ORDERS</span>
        </button>
      </div>
    </>
  );
};

export default WaiterNavbar;
