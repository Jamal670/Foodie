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
      { sr: 1, name: "Cheeseburger", quantity: 2, customization: "Extra Cheese, No Onion", variation: "Large", unitPrice: 500, total: 1000 },
      { sr: 2, name: "Large Fries", quantity: 1, customization: "Extra Dip", variation: "Regular", unitPrice: 300, total: 300 },
      { sr: 3, name: "Chicken Wrap", quantity: 1, customization: "-", variation: "Spicy", unitPrice: 450, total: 450 },
      { sr: 4, name: "Cold Drinks", quantity: 2, customization: "Chilled, No Ice", variation: "500ml", unitPrice: 150, total: 300 },
    ],
    tax: 5,
  },
  {
    id: 8946,
    image: breakfastImg,
    orderType: "Takeaway",
    tableNo: "07",
    customerName: "Ali Ahmed",
    date: "12 Feb, 2025",
    time: "7:45 pm",
    items: [
      { sr: 1, name: "Cheeseburger", quantity: 2, customization: "No Mayo", variation: "Medium", unitPrice: 500, total: 1000 },
      { sr: 2, name: "Large Fries", quantity: 1, customization: "-", variation: "Large", unitPrice: 300, total: 300 },
      { sr: 3, name: "Chicken Wrap", quantity: 1, customization: "Extra Sauce", variation: "Mild", unitPrice: 450, total: 450 },
      { sr: 4, name: "Cold Drinks", quantity: 2, customization: "-", variation: "250ml", unitPrice: 150, total: 300 },
    ],
    tax: 5,
  },
  {
    id: 8376,
    image: breakfastImg,
    orderType: "Delivery",
    tableNo: "07",
    customerName: "Ghori town, phase 07..",
    date: "12 Feb, 2025",
    time: "8:00 pm",
    items: [
      { sr: 1, name: "Cheeseburger", quantity: 2, customization: "Double Patty", variation: "Large", unitPrice: 500, total: 1000 },
      { sr: 2, name: "Large Fries", quantity: 1, customization: "Salted", variation: "Large", unitPrice: 300, total: 300 },
      { sr: 3, name: "Chicken Wrap", quantity: 1, customization: "-", variation: "Spicy", unitPrice: 450, total: 450 },
      { sr: 4, name: "Cold Drinks", quantity: 2, customization: "Less Ice", variation: "1.5L", unitPrice: 150, total: 300 },
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
                    className="woh-done-btns"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log(`Order ${order.id} marked as done`);
                    }}
                  >
                    Done
                  </button>
                </div>

                {/* Row 2: Order Type and Table Info */}
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
                      <span className="woh-table-badge">{order.customerName}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Expanded Order Details */}
            {isExpanded && (
              <div className="woh-order-details">
                {/* Items Table - Single line rows, horizontally scrollable */}
                <div className="woh-table-container">
                  <table className="woh-items-table">
                    <thead>
                      <tr>
                        <th>Sr</th>
                        <th>Item</th>
                        <th>Customization</th>
                        <th>Variation</th>
                        <th>Quantity</th>
                        <th>Unit Price</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item) => (
                        <tr key={item.sr}>
                          <td>{item.sr}</td>
                          <td className="woh-cell-item-name">{item.name}</td>
                          <td>{item.customization || "-"}</td>
                          <td>{item.variation || "-"}</td>
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
                    RS. {total.toFixed(1)}
                  </div>
                </div>

                {/* Customer Info - Single Horizontal Scrollable Row */}
                <div className="woh-customer-info-single-row">
                  <span className="woh-info-badge">
                    <span className="woh-info-label">Name:</span> {order.customerName}
                  </span>
                  <span className="woh-info-badge">
                    <span className="woh-info-label">Date:</span> {order.date}
                  </span>
                  <span className="woh-info-badge">
                    <span className="woh-info-label">Time:</span> {order.time}
                  </span>
                  
                </div>

                {/* Action Buttons Row Immediately Below Customer Info */}
                <div className="woh-action-buttons-row">
                  <button
                    className="woh-action-btn woh-btn-add-items"
                    onClick={() => console.log(`Add Items to order ${order.id}`)}
                  >
                    Add Items
                  </button>
                  <button
                    className="woh-action-btn woh-btn-confirmed"
                    onClick={() => console.log(`Order ${order.id} confirmed`)}
                  >
                    Confirmed
                  </button>
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
