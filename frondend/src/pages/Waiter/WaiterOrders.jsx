import React, { useState } from "react";
import { Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";
import { FaShoppingCart, FaChevronDown, FaUtensils } from "react-icons/fa";
import OrderPlaced from "../../components/models/customer/orderPlaced";
import "../../assets/css/Waiter/WaiterOrders.css";

/**
 * TEMPORARY / PLACEHOLDER DINE-IN MOCK ORDER ITEMS (UI ONLY)
 * Represents active cart items for Dine In order display without backend queries.
 */
const MOCK_DINE_IN_ORDER_ITEMS = [
  {
    id: 1,
    menuItemName: "Scrambled Eggs Special",
    itemVariationName: "Double Egg",
    itemCustomizationName: "Extra Cheese, Low Salt",
    quantity: 2,
    price: 950,
  },
  {
    id: 2,
    menuItemName: "Club Sandwich with Fries",
    itemVariationName: "Chicken",
    itemCustomizationName: "No Mayonnaise",
    quantity: 1,
    price: 1200,
  },
  {
    id: 3,
    menuItemName: "Fresh Mango Smoothie",
    itemVariationName: "Large (500ml)",
    itemCustomizationName: "Less Ice",
    quantity: 2,
    price: 800,
  },
];

const WaiterOrders = () => {
  const navigate = useNavigate();

  // Pure UI Interaction States
  const [selectedTable, setSelectedTable] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [showOrderModal, setShowOrderModal] = useState(false);

  const orderItems = MOCK_DINE_IN_ORDER_ITEMS;

  // Total Calculations
  const subtotal = orderItems.reduce(
    (sum, item) => sum + Number(item.price || 0),
    0
  );

  const handlePlaceOrder = () => {
    setShowOrderModal(true);
    setTimeout(() => {
      setShowOrderModal(false);
      navigate("/waiter/order-menu", { replace: true });
    }, 1500);
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
                  <label className="wo-form-label">Select Table</label>
                  <div className="wo-dark-select-wrapper">
                    <select
                      className="wo-dark-pill-select"
                      value={selectedTable}
                      onChange={(e) => setSelectedTable(e.target.value)}
                    >
                      <option value="">Select a Table</option>
                      <option value="1">Table 1</option>
                      <option value="2">Table 2</option>
                      <option value="3">Table 3</option>
                      <option value="4">Table 4</option>
                      <option value="5">Table 5</option>
                      <option value="6">Table 6</option>
                      <option value="7">Table 7</option>
                      <option value="8">Table 8</option>
                      <option value="9">Table 9</option>
                      <option value="10">Table 10</option>
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
                  >
                    <span className="wo-place-order-text">Place Order</span>
                    <div className="wo-black-cart-circle">
                      <FaShoppingCart />
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* Order Placed Success Modal */}
      <OrderPlaced show={showOrderModal} />
    </div>
  );
};

export default WaiterOrders;
