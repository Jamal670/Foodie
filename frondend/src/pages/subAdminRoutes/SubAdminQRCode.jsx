import React, { useState } from "react";
import { FaBars } from "react-icons/fa";
import SubAdminSideBar from "../../components/sidebar/SubAdminSideBar";
import "../../assets/css/SubAdminQRCode.css";
import "../../assets/css/SubAdminEditMenu.css"; // Reuse tab styles
import DineInQrCode from "../../components/subAdmin/QRcode/DineInQrCode";
import TakeawayQRCode from "../../components/subAdmin/QRcode/TakeawayQRCode";
import { useSearchParams } from "react-router-dom";

function SubAdminQRCode() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "dineIn";

  const setActiveTab = (tab) => {
    setSearchParams({ tab });
  };

  return (
    <div className="dashboard d-flex">
      {/* Sidebar Component */}
      <SubAdminSideBar
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Mobile Menu Toggle Button */}
      <button
        className={`menu-toggle ${isMobileOpen ? "hidden" : ""}`}
        onClick={() => setIsMobileOpen(true)}
        aria-label="Toggle menu"
      >
        <FaBars />
      </button>

      {/* Main Content */}
      <div className="main-content">
        <div className="header d-flex justify-content-between align-items-center mb-3">
          <h1 className="overview-title">Digital Menu QR Codes</h1>
        </div>

        {/* Custom Navigation Tabs */}
        <div className="menu-tabs mb-4">
          <button
            className={`menu-tab-btn ${activeTab === "dineIn" ? "active" : ""}`}
            onClick={() => setActiveTab("dineIn")}
          >
            Dine In
          </button>
          <button
            className={`menu-tab-btn ${activeTab === "takeaway" ? "active" : ""}`}
            onClick={() => setActiveTab("takeaway")}
          >
            Takeaway
          </button>
        </div>

        <div className="qr-container-body">
          {activeTab === "dineIn" && <DineInQrCode />}
          {activeTab === "takeaway" && <TakeawayQRCode />}
        </div>
      </div>
    </div>
  );
}

export default SubAdminQRCode;
