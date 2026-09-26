import React, { useState } from "react";
import { Container, Spinner } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { IoIosArrowBack } from "react-icons/io";
import { FaShoppingCart, FaChevronDown } from "react-icons/fa";
import OrderPlaced from "../../components/models/customer/orderPlaced";
import "../../assets/css/Waiter/WaiterOrders.css";
import { useAvailableTables, useCreatePosOrder } from "../../hooks/useWaiterPOS";
import { getWaiterCartItems, clearWaiterCart } from "../../utils/waiterCartData";
import {
  hasPermission,
  PERMISSION_CODES,
  PERMISSION_KEYS,
} from "../../utils/permissionUtils";
import { useAlertStore } from "../../context/alertStore";

const WaiterOrders = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  // Pure UI Interaction & Form States
  const [selectedTableId, setSelectedTableId] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Permission verification
  const hasCreateOrderPermission = hasPermission(
    PERMISSION_CODES.POS_CREATE_ORDER,
    PERMISSION_KEYS.POS_CREATE_ORDER
  );

  // Read items from localStorage waiter cart helper
  const orderItems = getWaiterCartItems();

  // Fetch available tables via React Query
  const { tables, isLoading: tablesLoading } = useAvailableTables();

  // Create POS Order mutation
  const createPosOrderMutation = useCreatePosOrder();

  // Subtotal Calculation
  const subtotal = orderItems.reduce(
    (sum, item) => sum + Number(item.price || 0),
    0
  );

  const handlePlaceOrder = () => {
    if (isSubmitting) return;

    if (!hasCreateOrderPermission) {
      useAlertStore
        .getState()
        .showAlert("Permission denied: You do not have permission to create POS orders.");
      return;
    }

    if (!orderItems || orderItems.length === 0) {
      useAlertStore.getState().showAlert("Your cart is empty. Please add items first.");
      return;
    }

    if (!selectedTableId) {
      useAlertStore.getState().showAlert("Please select a table to place the order.");
      return;
    }

    // Map cart items to backend CreatePosOrderDto structure
    const formattedItems = orderItems.map((item) => {
      const mapped = {
        menuItemId: Number(item.menuItemId),
        quantity: Number(item.quantity || 1),
      };
      if (item.variationId) mapped.variationId = Number(item.variationId);
      if (item.itemVariationName) mapped.itemVariationName = item.itemVariationName;
      if (item.customizationId) mapped.customizationId = Number(item.customizationId);
      if (item.itemCustomizationName) mapped.itemCustomizationName = item.itemCustomizationName;
      return mapped;
    });

    const rawPayment = location.state?.paymentMethod || "CASH";
    const paymentMethodFormatted =
      rawPayment === "Card" || rawPayment === "CARD" ? "CARD" : "CASH";

    const payload = {
      tableId: Number(selectedTableId),
      orderType: "DINE_IN",
      paymentMethod: paymentMethodFormatted,
      name: name.trim() || "Walk-in Guest",
      phoneNo: phone.trim() || "+923001234567",
      email: email.trim() || "walkin@example.com",
      items: formattedItems,
    };

    setIsSubmitting(true);

    createPosOrderMutation.mutate(payload, {
      onSuccess: (res) => {
        if (res === true) {
          // Clear localStorage cart on successful order
          clearWaiterCart();

          // Reset relevant queries
          queryClient.invalidateQueries({ queryKey: ["available-tables"] });
          queryClient.invalidateQueries({ queryKey: ["waiter-pos-menu"] });

          setShowOrderModal(true);
          setTimeout(() => {
            setShowOrderModal(false);
            setIsSubmitting(false);
            navigate("/waiter/order-menu", { replace: true });
          }, 1500);
        } else {
          setIsSubmitting(false);
          useAlertStore
            .getState()
            .showAlert("Failed to create order. Please try again.");
        }
      },
      onError: (err) => {
        setIsSubmitting(false);
        useAlertStore
          .getState()
          .showAlert(err.message || "Failed to create order.");
      },
    });
  };

  return (
    <div className="wo-order-page">
      <Container fluid className="wo-order-container">
        <div className="wo-card-wrapper">
          {/* Top White Section: Back Button, Header Title & Dine In Badge */}
          <div className="wo-white-header">
            <div className="wo-header-nav-row">
              <button
                className="wo-back-btn"
                onClick={() => navigate(-1)}
                aria-label="Go Back"
              >
                <IoIosArrowBack size={16} />
                <span>Back</span>
              </button>
              <div className="d-flex align-items-center gap-2">
                <h1 className="wod-category-title">
                  Order <span style={{ fontSize: '14px', color: '#A8A0A6' }}>(Dine In)</span>
                </h1>
              </div>
              <div></div>
            </div>
          </div>

          {/* Dark Content Section */}
          <div className="wo-dark-body">
            {orderItems.length === 0 ? (
              <div className="text-center py-5">
                <h2 style={{ color: "#fff", marginBottom: "8px" }}>Oops!</h2>
                <p style={{ color: "#A8A0A6", marginBottom: "20px" }}>
                  Your cart is empty.
                </p>
                <button
                  className="wo-place-order-btn"
                  style={{ margin: "0 auto", width: "auto", padding: "10px 24px" }}
                  onClick={() => navigate("/waiter/order-menu")}
                >
                  Browse Menu
                </button>
              </div>
            ) : (
              <div className="wo-content-grid">
                {/* Left Column: Note & Customer / Table Details */}
                <div className="wo-left-col">
                  {/* Note Section */}
                  <div className="wo-form-group">
                    <label className="wo-form-label">Add note (Optional)</label>
                    <textarea
                      className="wo-dark-textarea"
                      placeholder="Add special instructions or note..."
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows="4"
                    />
                  </div>

                  {/* Details Section with Interactive Table Selection */}
                  <div className="wo-details-section">
                    <h3 className="wo-section-title">Order Details</h3>
                    <div className="wo-form-group">
                      <input
                        type="text"
                        className="wo-dark-pill-input"
                        placeholder="Customer Name (Optional)"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    <div className="wo-form-group">
                      <input
                        type="tel"
                        className="wo-dark-pill-input"
                        placeholder="Phone no (Optional)"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                    <div className="wo-form-group">
                      <input
                        type="email"
                        className="wo-dark-pill-input"
                        placeholder="Email (Optional)"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Clean Responsive Table Selection Dropdown */}
                  <div className="wo-form-group">
                    <label className="wo-form-label">Select Table *</label>
                    <div className="wo-dark-select-wrapper">
                      <select
                        className="wo-dark-pill-select"
                        value={selectedTableId}
                        onChange={(e) => setSelectedTableId(e.target.value)}
                      >
                        <option value="">Select a Table</option>
                        {tablesLoading ? (
                          <option value="" disabled>
                            Loading available tables...
                          </option>
                        ) : tables && tables.length > 0 ? (
                          tables.map((table) => (
                            <option key={table.id} value={table.id}>
                              Table {table.tableNumber} ({table.status || "Available"})
                            </option>
                          ))
                        ) : (
                          <option value="" disabled>
                            No available tables found
                          </option>
                        )}
                      </select>
                      <FaChevronDown className="wo-select-arrow-icon" />
                    </div>
                  </div>
                </div>

                {/* Right Column: Bill & Place Order Action Button */}
                <div className="wo-right-col">
                  {/* Bill Section */}
                  <div className="wo-bill-section">
                    <h3 className="wo-section-title wo-bill-heading">Bill Summary</h3>

                    <div className="wo-bill-items-list">
                      {orderItems.map((item) => (
                        <div key={item.id} className="wo-bill-item-row">
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                            }}
                          >
                            <span className="wo-bill-item-name">
                              {item.menuItemName}
                            </span>
                            {(item.itemVariationName ||
                              item.itemCustomizationName) && (
                              <span
                                style={{
                                  fontSize: "11px",
                                  color: "#A8A0A6",
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

                          <div className="wo-bill-item-right">
                            <span className="wo-qty-circle-value">
                              x{item.quantity}
                            </span>

                            <div className="wo-purple-price-pill">
                              PKR {Number(item.price || 0).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="wo-bill-divider"></div>

                    {/* Subtotal Row */}
                    <div className="wo-bill-subtotal-row">
                      <span className="wo-subtotal-label">Subtotal</span>
                      <div className="wo-white-subtotal-badge">
                        PKR {Math.round(subtotal).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Place Order Action Button */}
                  <div className="wo-place-order-wrapper">
                    <button
                      className="wo-place-order-btn"
                      onClick={handlePlaceOrder}
                      disabled={isSubmitting || !selectedTableId}
                      style={{
                        opacity: isSubmitting || !selectedTableId ? 0.6 : 1,
                        cursor: isSubmitting || !selectedTableId ? "not-allowed" : "pointer",
                      }}
                    >
                      <span className="wo-place-order-text">
                        {isSubmitting ? "Placing Order..." : "Place Order"}
                      </span>
                      <div className="wo-black-cart-circle">
                        {isSubmitting ? (
                          <Spinner animation="border" size="sm" variant="light" />
                        ) : (
                          <FaShoppingCart />
                        )}
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Container>

      {/* Order Placed Success Modal */}
      <OrderPlaced show={showOrderModal} />
    </div>
  );
};

export default WaiterOrders;
