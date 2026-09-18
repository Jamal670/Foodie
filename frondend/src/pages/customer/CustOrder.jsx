import React, { useState, useEffect } from "react";
import { Container } from "react-bootstrap";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import "../../assets/css/Customer/CustOrder.css";
import OrderPlaced from "../../components/models/customer/orderPlaced";
import { FaShoppingCart } from "react-icons/fa";
import { IoIosArrowBack } from "react-icons/io";
import { fetchMenuByQrToken } from "../../services/customer/menu/showmenu.service";
import { fetchMyCart } from "../../services/customer/carts/cart.service";
import { createOrder } from "../../services/customer/orders/createOrders.service";
import { useAlertStore } from "../../context/alertStore";
import { setCartCount } from "../../utils/cartStorage";

const CustOrder = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { qrToken: routeQrToken } = useParams();
  const queryClient = useQueryClient();

  // Extract QR token dynamically
  const searchParams = new URLSearchParams(location.search);
  const qrToken =
    routeQrToken ||
    searchParams.get("qrToken") ||
    location.state?.qrToken ||
    sessionStorage.getItem("customer_qrToken");

  // Read customer-menu from React Query cache (0 duplicate API requests)
  const { data: menuData } = useQuery({
    queryKey: ["customer-menu", qrToken],
    queryFn: () => fetchMenuByQrToken(qrToken),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    enabled: !!qrToken,
  });

  // Re-use ["my-cart"] React Query cache
  const { data: cartData, isLoading: isCartLoading } = useQuery({
    queryKey: ["my-cart"],
    queryFn: fetchMyCart,
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  // Payment method passed from CustCart.jsx (defaults to CARD)
  const paymentMethod = location.state?.paymentMethod || "CARD";

  const [orderType, setOrderType] = useState("Dine In");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [tableNo, setTableNo] = useState("");
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Default to "Dine In" if table qrType is DINE_IN and set tableNo
  useEffect(() => {
    if (menuData?.table?.qrType === "DINE_IN") {
      setOrderType("Dine In");
    }
    if (menuData?.table?.tableNumber) {
      setTableNo(String(menuData.table.tableNumber));
    }
  }, [menuData]);

  const cartItems = cartData?.items || [];

  // Display-only line calculations from cartData
  const itemsTotal = cartItems.reduce(
    (sum, item) => sum + Number(item.price || 0),
    0
  );
  const deliveryCharges = orderType === "Delivery" ? 200 : 0;
  const subtotal = itemsTotal + deliveryCharges;
  const orderTypes = ["Dine In", "Takeaway", "Delivery"];

  // Place Order Mutation
  const placeOrderMutation = useMutation({
    mutationFn: (dto) => createOrder(dto),
    onSuccess: (savedOrder) => {
      setSubmitError("");
      setShowOrderModal(true);

      // Reset cart count in storage and invalidate cart query
      setCartCount(0);
      queryClient.invalidateQueries({ queryKey: ["my-cart"] });

      setTimeout(() => {
        setShowOrderModal(false);
        const targetTimerPath = qrToken
          ? `/customer/order-timer/t/${qrToken}/${savedOrder.id}`
          : `/customer/order-timer/${savedOrder.id}`;

        // Navigation with history replacement
        navigate(targetTimerPath, {
          replace: true,
          state: { order: savedOrder, qrToken },
        });
      }, 1500);
    },
    onError: (err) => {
      const errorMsg =
        err.message || "Failed to place order. Please try again.";
      setSubmitError(errorMsg);
      useAlertStore.getState().showAlert(errorMsg);
    },
  });

  const handlePlaceOrder = () => {
    if (cartItems.length === 0) {
      const msg = "Your cart is empty. Please add items before placing an order.";
      setSubmitError(msg);
      useAlertStore.getState().showAlert(msg);
      return;
    }

    setSubmitError("");

    // Map UI orderType to backend OrderType Enum
    const mappedOrderType =
      orderType === "Dine In"
        ? "DINE_IN"
        : orderType === "Takeaway"
        ? "TAKEAWAY"
        : "DELIVERY";

    const payload = {
      orderType: mappedOrderType,
      paymentMethod,
      name: name.trim() || undefined,
      phoneNo: phone.trim() || undefined,
      email: email.trim() || undefined,
    };

    placeOrderMutation.mutate(payload);
  };

  const activeTabClass = `active-tab-${orderType.toLowerCase().replace(" ", "-")}`;

  return (
    <div className="cust-order-page">
      <Container fluid className="cust-order-container">
        <div className="order-card-wrapper">
          {/* Top White Section: Back Button + My Order Title */}
          <div className="order-white-header">
            <div
              className="order-header-nav-row"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
              }}
            >
              <button
                className="cart-back-btn"
                onClick={() => navigate(-1)}
                aria-label="Go Back"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "none",
                  border: "none",
                  color: "#666",
                  fontSize: "14px",
                  fontWeight: 500,
                  cursor: "pointer",
                  padding: "4px 0",
                }}
              >
                <IoIosArrowBack size={15} />
                <span>Back</span>
              </button>
              <h1
                className="cart-header-title"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "#111111",
                  margin: 0,
                }}
              >
                My Order
              </h1>
              <div></div>
            </div>

            {/* Order Type Tabs */}
            <div className="order-tabs-row">
              {orderTypes.map((type) => (
                <button
                  key={type}
                  className={`order-tab-btn ${
                    orderType === type ? "active" : ""
                  }`}
                  onClick={() => setOrderType(type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Dark Content Section */}
          <div className={`order-dark-body ${activeTabClass}`}>
            {submitError && (
              <div
                className="order-error-banner"
                style={{
                  background: "rgba(220, 53, 69, 0.15)",
                  border: "1px solid #dc3545",
                  color: "#ff6b6b",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  marginBottom: "20px",
                  fontSize: "14px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>{submitError}</span>
                {submitError.toLowerCase().includes("cart") && (
                  <button
                    onClick={() =>
                      navigate(
                        qrToken ? `/customer/menu/t/${qrToken}` : "/customer/menu"
                      )
                    }
                    style={{
                      background: "#dc3545",
                      color: "#fff",
                      border: "none",
                      padding: "4px 10px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      cursor: "pointer",
                    }}
                  >
                    Return to Menu
                  </button>
                )}
              </div>
            )}

            <div className="order-content-grid">
              {/* Left Column: Note & Details */}
              <div className="order-left-col">
                {/* Note Section */}
                <div className="order-form-group">
                  <label className="order-form-label">Add note (Optional)</label>
                  <textarea
                    className="dark-textarea"
                    placeholder="Add note (Optional)"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows="4"
                  />
                </div>

                {/* Details Section */}
                <div className="order-details-section">
                  <h3 className="order-section-title">Details</h3>
                  <div className="order-form-group">
                    <input
                      type="text"
                      className="dark-pill-input"
                      placeholder="Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="order-form-group">
                    <input
                      type="tel"
                      className="dark-pill-input"
                      placeholder="Phone no"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <div className="order-form-group">
                    <input
                      type="email"
                      className="dark-pill-input"
                      placeholder="Email (Optional)"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  {orderType === "Dine In" && tableNo && (
                    <div className="order-form-group">
                      <label className="order-form-label">Table no</label>
                      <input
                        type="text"
                        className="dark-pill-select"
                        value={`Table ${tableNo}`}
                        readOnly
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Bill & Place Order Action Button */}
              <div className="order-right-col">
                {/* Bill Section */}
                <div className="order-bill-section">
                  <h3 className="order-section-title bill-heading">Bill</h3>

                  <div className="bill-items-list">
                    {isCartLoading ? (
                      <p style={{ color: "#aaa", fontSize: "14px" }}>
                        Loading order summary...
                      </p>
                    ) : cartItems.length > 0 ? (
                      cartItems.map((item) => (
                        <div key={item.id} className="bill-item-row">
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                            }}
                          >
                            <span className="bill-item-name">
                              {item.menuItemName}
                            </span>
                            {(item.itemVariationName ||
                              item.itemCustomizationName) && (
                              <span
                                style={{
                                  fontSize: "11px",
                                  color: "#888",
                                  marginTop: "2px",
                                }}
                              >
                                {[
                                  item.itemVariationName,
                                  item.itemCustomizationName,
                                ]
                                  .filter(Boolean)
                                  .join(" • ")}
                              </span>
                            )}
                          </div>

                          <div className="bill-item-right">
                            {/* Quantity display-only (no + / - controls) */}
                            <span
                              className="qty-circle-value"
                              style={{
                                display: "inline-block",
                                textAlign: "center",
                                minWidth: "28px",
                                color: "#fff",
                                fontWeight: 600,
                              }}
                            >
                              x{item.quantity}
                            </span>

                            <div className="purple-price-pill">
                              PKR {Number(item.price || 0).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p style={{ color: "#aaa", fontSize: "14px" }}>
                        No items in cart.
                      </p>
                    )}

                    {/* Delivery Charges */}
                    {orderType === "Delivery" && deliveryCharges > 0 && (
                      <div className="bill-item-row">
                        <span className="bill-item-name">Delivery Charges</span>
                        <div className="bill-item-right">
                          <div className="purple-price-pill">
                            PKR {deliveryCharges.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bill-divider"></div>

                  {/* Subtotal Row */}
                  <div className="bill-subtotal-row">
                    <span className="subtotal-label">Subtotal</span>
                    <div className="white-subtotal-badge">
                      PKR {Math.round(subtotal).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Place Order Action Button */}
                <div className="place-order-wrapper">
                  <button
                    className="place-order-btn"
                    onClick={handlePlaceOrder}
                    disabled={placeOrderMutation.isPending || cartItems.length === 0}
                    style={{
                      opacity:
                        placeOrderMutation.isPending || cartItems.length === 0
                          ? 0.6
                          : 1,
                      cursor:
                        placeOrderMutation.isPending || cartItems.length === 0
                          ? "not-allowed"
                          : "pointer",
                    }}
                  >
                    <span className="place-order-text">
                      {placeOrderMutation.isPending
                        ? "Placing Order..."
                        : "Place Order"}
                    </span>
                    <div className="black-cart-circle">
                      <FaShoppingCart />
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
      <OrderPlaced show={showOrderModal} />
    </div>
  );
};

export default CustOrder;
