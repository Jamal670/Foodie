import React, { useState } from "react";
import { Container } from "react-bootstrap";
import "../../assets/css/Customer/CustOrder.css";
import {
  FaArrowLeft,
  FaShoppingCart,
  FaPlus,
  FaMinus,
  FaChevronDown,
} from "react-icons/fa";

// Import images
import breakfastImg from "/images/breakfast.png";

const CustOrder = () => {
  const [orderType, setOrderType] = useState("Dine In");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [tableNo, setTableNo] = useState("4");
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
    // Handle place order functionality
    console.log("Place order:", {
      orderType,
      name,
      note,
      tableNo,
      items,
      subtotal,
    });
  };

  return (
    <div className="order-page">
      {/* White Header Bar */}
      <div className="order-header-bar">
        <button className="back-btn-header">
          <FaArrowLeft />
          <span className="back-text">Back</span>
        </button>
        <h1 className="order-title-header">My Order</h1>
      </div>

      {/* White Top Section with Tabs */}
      <div className="order-top-section">
        <Container fluid className="order-container">
          {/* Order Type Selection */}
          <div className="order-type-tabs">
            {orderTypes.map((type) => (
              <button
                key={type}
                className={`order-type-tab ${
                  orderType === type ? "active" : ""
                } ${type === "Delivery" ? "delivery" : ""}`}
                onClick={() => setOrderType(type)}
              >
                {type}
              </button>
            ))}
          </div>
        </Container>
      </div>

      {/* Dark Content Section */}
      <Container
        fluid
        className={`order-container order-content-section ${
          orderType === orderTypes[0] ? "first-tab-active" : ""
        }`}
      >
        {/* Input Fields - Conditional based on order type */}
        <div className="order-inputs">
          {/* Dine In Fields */}
          {orderType === "Dine In" && (
            <>
              <div className="input-group">
                <input
                  type="text"
                  className="order-input"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="input-group">
                <label className="input-label">Add note (Optional)</label>
                <textarea
                  className="order-textarea"
                  placeholder="Add note (Optional)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows="3"
                />
              </div>
              <div className="input-group">
                <label className="input-label">Table no</label>
                <div className="dropdown-wrapper">
                  <select
                    className="order-select"
                    value={tableNo}
                    onChange={(e) => setTableNo(e.target.value)}
                  >
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                  </select>
                  <FaChevronDown className="dropdown-icon" />
                </div>
              </div>
            </>
          )}

          {/* Takeaway and Delivery Fields */}
          {(orderType === "Takeaway" || orderType === "Delivery") && (
            <>
              <div className="input-group">
                <label className="input-label">Add note (Optional)</label>
                <textarea
                  className="order-textarea"
                  placeholder="Add note (Optional)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows="3"
                />
              </div>
              <div className="details-section">
                <h3 className="details-title">Details</h3>
                <div className="input-group">
                  <input
                    type="text"
                    className="order-input"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="input-group">
                  <input
                    type="tel"
                    className="order-input"
                    placeholder="Phone no"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="input-group">
                  <input
                    type="email"
                    className="order-input"
                    placeholder="Email (Optional)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Bill Section */}
        <div className="bill-section">
          <h2 className="bill-title">Bill</h2>

          {items.map((item) => (
            <div key={item.id} className="bill-item">
              <div className="bill-item-name">{item.name}</div>
              <div className="bill-item-controls">
                <div className="quantity-controls">
                  <button
                    className="quantity-btn"
                    onClick={() => handleQuantityChange(item.id, -1)}
                  >
                    <FaMinus />
                  </button>
                  <span className="quantity-value">
                    {String(item.quantity).padStart(2, "0")}
                  </span>
                  <button
                    className="quantity-btn"
                    onClick={() => handleQuantityChange(item.id, 1)}
                  >
                    <FaPlus />
                  </button>
                </div>
                <div className="item-price-badge">
                  PKR {(item.price * item.quantity).toLocaleString()}
                </div>
              </div>
            </div>
          ))}

          {/* Delivery Charges - Only for Delivery */}
          {orderType === "Delivery" && deliveryCharges > 0 && (
            <div className="bill-item">
              <div className="bill-item-name">Delivery Charges</div>
              <div className="bill-item-controls">
                <div className="item-price-badge">
                  PKR {deliveryCharges.toLocaleString()}
                </div>
              </div>
            </div>
          )}

          <div className="bill-divider"></div>

          <div className="bill-subtotal">
            <div className="subtotal-label">Subtotal</div>
            <div className="subtotal-price-badge">
              PKR {subtotal.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Place Order Button */}
        <div className="place-order-section">
          <button className="place-order-btn" onClick={handlePlaceOrder}>
            <span className="place-order-text">Place Order</span>
            <div className="place-order-icon">
              <FaShoppingCart />
            </div>
          </button>
        </div>
      </Container>
    </div>
  );
};

export default CustOrder;
