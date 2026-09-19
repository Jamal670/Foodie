import React, { useState } from "react";
import { Container } from "react-bootstrap";
import WaiterNavbar from "../../components/waiter/navbar/WatierNavbar.nav";
import OrderServings from "../../components/waiter/OrderServings";
import POS from "../../components/waiter/POS";
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
          {activeTab === "ORDERS" ? <OrderServings /> : <POS />}
        </div>
      </Container>
    </div>
  );
};

export default WaiterOrderMenu;
