import React, { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import "../../assets/css/Waiter/WaiterOrderHistory.css";
import breakfastImg from "/images/breakfast.png";

// Sample data - replace with actual API data
const sampleOrders = [
  {
    id: 8976,
    image: breakfastImg,
    orderType: "Dine In",
    tableNo: "07",
    customerName: "Ahmed",
    date: "12 Feb, 2025",
    time: "7:30 pm",
    items: [
      { sr: 1, name: "Cheeseburger", quantity: 2, unitPrice: 500, total: 1000 },
      { sr: 2, name: "Large Fries", quantity: 1, unitPrice: 300, total: 300 },
      { sr: 3, name: "Chicken Wrap", quantity: 1, unitPrice: 450, total: 450 },
      { sr: 4, name: "Cold Drinks", quantity: 2, unitPrice: 150, total: 300 },
    ],
    tax: 5,
  },
  {
    id: 8946,
    image: breakfastImg,
    orderType: "Dine In",
    tableNo: "07",
    customerName: "Ahmed",
    date: "12 Feb, 2025",
    time: "7:30 pm",
    items: [
      { sr: 1, name: "Cheeseburger", quantity: 2, unitPrice: 500, total: 1000 },
      { sr: 2, name: "Large Fries", quantity: 1, unitPrice: 300, total: 300 },
      { sr: 3, name: "Chicken Wrap", quantity: 1, unitPrice: 450, total: 450 },
      { sr: 4, name: "Cold Drinks", quantity: 2, unitPrice: 150, total: 300 },
    ],
    tax: 5,
  },
  {
    id: 8376,
    image: breakfastImg,
    orderType: "Dine In",
    tableNo: "07",
    customerName: "Ahmed",
    date: "12 Feb, 2025",
    time: "7:30 pm",
    items: [
      { sr: 1, name: "Cheeseburger", quantity: 2, unitPrice: 500, total: 1000 },
      { sr: 2, name: "Large Fries", quantity: 1, unitPrice: 300, total: 300 },
      { sr: 3, name: "Chicken Wrap", quantity: 1, unitPrice: 450, total: 450 },
      { sr: 4, name: "Cold Drinks", quantity: 2, unitPrice: 150, total: 300 },
    ],
    tax: 5,
  },
];

const OrderServings = () => {
  const [expandedOrder, setExpandedOrder] = useState(null);

  const toggleOrder = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const calculateTotal = (items, tax) => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const taxAmount = (subtotal * tax) / 100;
    return subtotal + taxAmount;
  };

  return (
    <div className="woh-orders-container">
      {sampleOrders.map((order) => {
        const isExpanded = expandedOrder === order.id;
        const total = calculateTotal(order.items, order.tax);
        const subtotal = order.items.reduce(
          (sum, item) => sum + item.total,
          0
        );
        const taxAmount = (subtotal * order.tax) / 100;

        return (
          <div key={order.id} className="woh-order-card">
            <div className="woh-order-card-content">
              {/* Left Section: Circular Image */}
              <div className="woh-order-image-container">
                <div className="woh-order-image">
                  <img src={order.image} alt="Order" />
                </div>
              </div>

              {/* Right Section: Content Area */}
              <div className="woh-order-content-area">
                {/* Row 1: Order ID and Done Button */}
                <div className="woh-content-row-1">
                  <div
                    className="woh-order-id"
                    onClick={() => toggleOrder(order.id)}
                  >
                    Order # {order.id}
                    {isExpanded ? (
                      <FaChevronUp className="woh-chevron" />
                    ) : (
                      <FaChevronDown className="woh-chevron" />
                    )}
                  </div>

                  <button
                    className="woh-done-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle done action here
                      console.log(`Order ${order.id} marked as done`);
                    }}
                  >
                    Done
                  </button>
                </div>

                {/* Row 2: Order Type and Table Info (Left Side with Borders) */}
                <div
                  className="woh-content-row-2"
                  onClick={() => toggleOrder(order.id)}
                >
                  <div className="woh-order-info-left">
                    <span className="woh-order-type-badge">{order.orderType}</span>
                    {order.orderType === "Dine In" && (
                      <span className="woh-table-badge">Table # {order.tableNo}</span>
                    )}
                    {order.orderType === "Takeaway" && (
                      <span className="woh-table-badge">{order.customerName}</span>
                    )}
                    {order.orderType === "Delivery" && (
                      <span className="woh-table-badge">{order.address}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Expanded Order Details */}
            {isExpanded && (
              <div className="woh-order-details">
                {/* Items Table */}
                <div className="woh-table-container">
                  <table className="woh-items-table">
                    <thead>
                      <tr>
                        <th>Sr</th>
                        <th>Items</th>
                        <th>Quantity</th>
                        <th>Unit Price</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item) => (
                        <tr key={item.sr}>
                          <td>{item.sr}</td>
                          <td>{item.name}</td>
                          <td>{String(item.quantity).padStart(2, "0")}</td>
                          <td>{item.unitPrice} pkr</td>
                          <td>{item.total} pkr</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Total Summary */}
                <div className="woh-total-summary">
                  <div className="woh-total-label">
                    <span className="woh-total-label-text">Total</span>
                    <span className="woh-total-label-tax">+Tax ({order.tax}%)</span>
                  </div>
                  <div className="woh-total-amount">
                    {total.toFixed(1)} pkr
                  </div>
                </div>

                {/* Customer Info */}
                <div className="woh-customer-info">
                  {/* First Row: Customer Name and Date */}
                  <div className="woh-customer-row">
                    <div className="woh-info-row">
                      <span className="woh-info-value">
                        <span className="woh-info-label">Name:</span> {order.customerName}
                      </span>
                      <span className="woh-info-value">
                        <span className="woh-info-label">Date:</span> {order.date}
                      </span>
                    </div>
                  </div>
                  {/* Second Row: Time */}
                  <div className="woh-customer-row">
                    <div className="woh-info-row">
                      <span className="woh-info-value">
                        <span className="woh-info-label">Time:</span> {order.time}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default OrderServings;

