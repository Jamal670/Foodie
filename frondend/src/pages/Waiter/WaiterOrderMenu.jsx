import React, { useState } from "react";
import { Container } from "react-bootstrap";
import WaiterNavbar from "../../components/waiter/navbar/WatierNavbar.nav";
import OrderServings from "../../components/waiter/OrderServings";
import { FaCashRegister } from "react-icons/fa";
import "../../assets/css/Waiter/WaiterOrderMenu.css";

const WaiterOrderMenu = () => {
  // Default to ORDERS tab as requested
  const [activeTab, setActiveTab] = useState("ORDERS");

  return (
    <div className="waiter-order-menu-page">
      <Container fluid className="waiter-order-menu-container">
        {/* Waiter Navbar Header & Tabs */}
        <WaiterNavbar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Tab Content Area */}
        <div className="wom-content-area">
          {activeTab === "ORDERS" ? (
            <OrderServings />
          ) : (
            <div className="wom-pos-placeholder">
              <div className="wom-pos-icon-wrapper">
                <FaCashRegister />
              </div>
              <h2 className="wom-pos-title">POS Terminal Coming Soon</h2>
              <p className="wom-pos-description">
                Point of Sale functionality is currently under active development.
                Switch to the <strong>ORDERS</strong> tab to view and manage live order servings.
              </p>
              <div className="wom-pos-badge">
                <span>Phase 2 Feature</span>
              </div>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
};

export default WaiterOrderMenu;
