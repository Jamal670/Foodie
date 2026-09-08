import React, { useState } from "react";
import { Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "../../assets/css/Customer/CustOrder.css";
import OrderPlaced from "../../components/models/customer/orderPlaced";
import {
  FaArrowLeft,
  FaShoppingCart,
  FaPlus,
  FaMinus,
  FaChevronDown,
} from "react-icons/fa";
import { IoIosArrowBack } from "react-icons/io";

const CustOrder = () => {
  const navigate = useNavigate();
  const [orderType, setOrderType] = useState("Delivery");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [tableNo, setTableNo] = useState("4");
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [items, setItems] = useState([
    {
      id: 1,
      name: "Scrambled Egg",
      quantity: 1,
      price: 3899,
    },
    {
      id: 2,
      name: "Toasts",
      quantity: 2,
      price: 600,
    },
  ]);

  const deliveryCharges = orderType === "Delivery" ? 200 : 0;
  const orderTypes = ["Dine In", "Takeaway", "Delivery"];

  const handleQuantityChange = (itemId, change) => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === itemId) {
          const newQuantity = Math.max(1, item.quantity + change);
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const itemsTotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const subtotal = itemsTotal + deliveryCharges;

  const handlePlaceOrder = () => {
    setShowOrderModal(true);
    setTimeout(() => {
      setShowOrderModal(false);
      navigate("/customer/menu");
    }, 2000);
  };

  const activeTabClass = `active-tab-${orderType.toLowerCase().replace(" ", "-")}`;

  return (
    <div className="cust-order-page">
      <Container fluid className="cust-order-container">
        <div className="order-card-wrapper">
          {/* Top White Section: Back Button + My Order Title */}
          <div className="order-white-header">
            <button
              className="order-back-btn"
              onClick={() => navigate(-1)}
              aria-label="Go back"
            >
              <IoIosArrowBack size={20} />
            </button>
            <h1 className="order-main-title">My Order</h1>

            {/* Order Type Tabs */}
            <div className="order-tabs-row">
              {orderTypes.map((type) => (
                <button
                  key={type}
                  className={`order-tab-btn ${orderType === type ? "active" : ""
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

                {/* Details Section for Takeaway & Delivery */}
                {(orderType === "Takeaway" || orderType === "Delivery") && (
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
                  </div>
                )}

                {/* Dine In Specific Details */}
                {orderType === "Dine In" && (
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
                    <div className="order-form-group">
                      <label className="order-form-label">Table no</label>
                      <input
                        type="text"
                        className="dark-pill-select"
                        value={`Table ${tableNo}`}
                        readOnly
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Bill & Place Order Action Button */}
              <div className="order-right-col">
                {/* Bill Section */}
                <div className="order-bill-section">
                  <h3 className="order-section-title bill-heading">Bill</h3>

                  <div className="bill-items-list">
                    {items.map((item) => (
                      <div key={item.id} className="bill-item-row">
                        <span className="bill-item-name">{item.name}</span>

                        <div className="bill-item-right">
                          <div className="circle-qty-control">
                            <button
                              className="qty-btn"
                              onClick={() => handleQuantityChange(item.id, -1)}
                              aria-label="Decrease quantity"
                            >
                              <FaMinus />
                            </button>
                            <span className="qty-circle-value">
                              {String(item.quantity).padStart(2, "0")}
                            </span>
                            <button
                              className="qty-btn"
                              onClick={() => handleQuantityChange(item.id, 1)}
                              aria-label="Increase quantity"
                            >
                              <FaPlus />
                            </button>
                          </div>

                          <div className="purple-price-pill">
                            PKR {(item.price * item.quantity).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Delivery Charges */}
                    {orderType === "Delivery" && deliveryCharges > 0 && (
                      <div className="bill-item-row">
                        <span className="bill-item-name">Delivery Chareges</span>
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
                      PKR {subtotal.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Place Order Action Button */}
                <div className="place-order-wrapper">
                  <button className="place-order-btn" onClick={handlePlaceOrder}>
                    <span className="place-order-text">Place Order</span>
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
