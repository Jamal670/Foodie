import React from "react";
import "../../assets/css/Waiter/WaiterOrderHistory.css";
import breakfastImg from "/images/breakfast.png";

// Sample pending payments data
const samplePendingPayments = [
  {
    id: 8976,
    image: breakfastImg,
    pendingAmount: 3088,
  },
  {
    id: 8946,
    image: breakfastImg,
    pendingAmount: 2152,
  },
  {
    id: 8376,
    image: breakfastImg,
    pendingAmount: 1890,
  },
];

const PendingPayments = () => {
  return (
    <div className="woh-orders-container">
      {samplePendingPayments.map((payment) => {
        return (
          <div key={payment.id} className="woh-payment-card">
            <div className="woh-payment-card-content">
              {/* Left Section: Circular Image */}
              <div className="woh-payment-image-container">
                <div className="woh-payment-image">
                  <img src={payment.image} alt="Order" />
                </div>
              </div>

              {/* Right Section: Payment Info */}
              <div className="woh-payment-content-area">
                {/* Row 1: Order Number and Paid Button */}
                <div className="woh-payment-row-1">
                  <div className="woh-payment-order-id">
                    Order # {payment.id}
                  </div>
                  <button
                    className="woh-paid-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log(`Payment ${payment.id} marked as paid`);
                    }}
                  >
                    Paid
                  </button>
                </div>

                {/* Row 2: Pending Amount Section */}
                <div className="woh-payment-row-2">
                  <div className="woh-payment-amount-section">
                    <span className="woh-pending-label">Pending Amount</span>
                    <span className="woh-pending-amount">Rs {payment.pendingAmount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PendingPayments;

