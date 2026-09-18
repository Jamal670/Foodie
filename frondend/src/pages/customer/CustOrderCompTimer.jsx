import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import "../../assets/css/Customer/CustOrderCompTimer.css";
import FoodieLogo from "../../components/common/FoodieLogo";
import { fetchMenuByQrToken } from "../../services/customer/menu/showmenu.service";
import { getOrderStatus } from "../../services/customer/orders/createOrders.service";
import { FaArrowRight } from "react-icons/fa";

// Centralized status display mapping
const STATUS_DISPLAY_MAP = {
  PENDING: "PREPARING",
  CONFIRMED: "PREPARING",
  PREPARING: "PREPARING",
  READY: "READY",
  SERVED: "SERVED",
  COMPLETED: "SERVED",
  CANCELLED: "CANCELLED",
};

/**
 * Parse serving time string into total seconds.
 * Examples: "15 mins" -> 900, "15" -> 900, "15:00" -> 900, null -> 900 (default 15 mins)
 */
const parseServingTimeToSeconds = (servingTimeStr) => {
  if (!servingTimeStr) return 15 * 60; // Default: 15 minutes

  const str = String(servingTimeStr).trim();
  if (str.includes(":")) {
    const parts = str.split(":");
    const mins = parseInt(parts[0], 10) || 0;
    const secs = parseInt(parts[1], 10) || 0;
    return mins * 60 + secs;
  }

  const num = parseInt(str.replace(/[^0-9]/g, ""), 10);
  if (num && !isNaN(num)) {
    return num * 60;
  }

  return 15 * 60;
};

const CustOrderCompTimer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { qrToken: routeQrToken, orderId: routeOrderId } = useParams();

  // Extract params dynamically
  const searchParams = new URLSearchParams(location.search);
  const qrToken =
    routeQrToken ||
    searchParams.get("qrToken") ||
    location.state?.qrToken ||
    sessionStorage.getItem("customer_qrToken");

  const targetOrderId =
    routeOrderId ||
    searchParams.get("orderId") ||
    location.state?.order?.id;

  // Read restaurant info from customer-menu cache (no duplicate fetch)
  const { data: menuData } = useQuery({
    queryKey: ["customer-menu", qrToken],
    queryFn: () => fetchMenuByQrToken(qrToken),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    enabled: !!qrToken,
  });

  // Poll order status every 10s until terminal state (SERVED, COMPLETED, CANCELLED)
  const { data: orderData } = useQuery({
    queryKey: ["order-status", targetOrderId],
    queryFn: () => getOrderStatus(targetOrderId),
    enabled: !!targetOrderId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (
        status === "SERVED" ||
        status === "COMPLETED" ||
        status === "CANCELLED"
      ) {
        return false; // Stop polling on terminal states
      }
      return 10000; // Poll every 10 seconds
    },
  });

  // Calculate total duration in seconds from branch servingTime
  const servingTimeSeconds = parseServingTimeToSeconds(
    menuData?.branch?.servingTime
  );

  const [secondsLeft, setSecondsLeft] = useState(servingTimeSeconds);

  // Sync initial seconds when servingTime loads
  useEffect(() => {
    if (servingTimeSeconds) {
      setSecondsLeft(servingTimeSeconds);
    }
  }, [servingTimeSeconds]);

  // Countdown timer effect - stops at 00:00 without negative values
  useEffect(() => {
    if (secondsLeft <= 0) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft]);

  // SVG Circle Progress Math
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const progressRatio =
    servingTimeSeconds > 0 ? secondsLeft / servingTimeSeconds : 0;
  const strokeDashoffset = circumference - progressRatio * circumference;

  // Format seconds to MM:SS
  const formatTime = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Status label & CSS class mapping
  const rawStatus = orderData?.status || location.state?.order?.status || "PENDING";
  const displayStatusLabel = STATUS_DISPLAY_MAP[rawStatus] || "PREPARING";

  const getStatusBadgeClass = (statusStr) => {
    switch (statusStr) {
      case "READY":
        return "status-ready";
      case "SERVED":
        return "status-served";
      case "CANCELLED":
        return "status-cancelled";
      default:
        return "";
    }
  };

  const handleWantMoreItems = () => {
    const targetMenuPath = qrToken
      ? `/customer/menu/t/${qrToken}`
      : "/customer/menu";
    navigate(targetMenuPath);
  };

  return (
    <div className="cust-order-timer-page">
      {/* Header Section */}
      <div className="timer-header-brand">
        <FoodieLogo className="foodie-logo" />
        <h1 className="timer-restaurant-title">
          {menuData?.restaurant?.restName || "Restaurant"}
        </h1>
      </div>

      {/* Main Center Card */}
      <div className="timer-main-card">
        {/* Circular Countdown Timer */}
        <div className="timer-circular-container">
          <svg className="timer-svg-ring" viewBox="0 0 200 200">
            <defs>
              <linearGradient
                id="timerGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#8a2be2" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
            </defs>

            {/* Background Circle */}
            <circle
              className="timer-bg-circle"
              cx="100"
              cy="100"
              r={radius}
            />

            {/* Progress Circle */}
            <circle
              className="timer-progress-circle"
              cx="100"
              cy="100"
              r={radius}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
            />
          </svg>

          {/* Center Info Inside Timer */}
          <div className="timer-center-content">
            <div className="timer-digits-display">
              {formatTime(secondsLeft)}
            </div>
            <div
              className={`timer-status-badge ${getStatusBadgeClass(
                displayStatusLabel
              )}`}
            >
              {displayStatusLabel}
            </div>
          </div>
        </div>

        {/* Below Timer Info */}
        <h2 className="timer-order-placed-text">Your order is placed</h2>

        {orderData?.orderNumber && (
          <div className="timer-order-number-tag">
            Order #{orderData.orderNumber}
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="timer-cta-wrapper">
        <button className="want-more-items-btn" onClick={handleWantMoreItems}>
          <span>Want more Items</span>
          <FaArrowRight />
        </button>
      </div>
    </div>
  );
};

export default CustOrderCompTimer;
