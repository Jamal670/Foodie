import React, { useMemo } from "react";
import { Container } from "react-bootstrap";
import { useSearchParams } from "react-router-dom";
import WaiterNavbar from "../../components/waiter/navbar/WatierNavbar.nav";
import OrderServings from "../../components/waiter/OrderServings";
import POS from "../../components/waiter/POS";
import "../../assets/css/Waiter/WaiterOrderMenu.css";
import { hasPermission, PERMISSION_CODES } from "../../utils/permissionUtils";

const WaiterOrderMenu = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Permission checks for tab visibility
  const showOrdersTab = useMemo(
    () => hasPermission(PERMISSION_CODES.ORDERS_TAB),
    []
  );
  const showPosTab = useMemo(
    () => hasPermission(PERMISSION_CODES.POS_TAB),
    []
  );

  // Determine active tab based on query param & permissions
  const activeTab = useMemo(() => {
    if (searchParams.has("pos") && showPosTab) {
      return "POS";
    }
    if (searchParams.has("orders") && showOrdersTab) {
      return "ORDERS";
    }
    // Default to ORDERS if permitted, otherwise POS if permitted
    if (showOrdersTab) return "ORDERS";
    if (showPosTab) return "POS";
    return "ORDERS";
  }, [searchParams, showOrdersTab, showPosTab]);

  const handleTabChange = (newTab) => {
    if (newTab === "POS") {
      setSearchParams({ pos: "" });
    } else {
      setSearchParams({ orders: "" });
    }
  };

  return (
    <div className="waiter-order-menu-page">
      <Container fluid className="waiter-order-menu-container">
        {/* Waiter Navbar Header & Tabs */}
        <WaiterNavbar
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          showOrdersTab={showOrdersTab}
          showPosTab={showPosTab}
        />

        {/* Tab Content Area */}
        <div className="wom-content-area">
          {activeTab === "ORDERS" ? <OrderServings /> : <POS />}
        </div>
      </Container>
    </div>
  );
};

export default WaiterOrderMenu;
