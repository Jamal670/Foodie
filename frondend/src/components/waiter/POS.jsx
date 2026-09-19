import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import "../../assets/css/Waiter/WaiterOrderMenu.css";
import breakfastImg from "/images/breakfast.png";

// Sample POS items data - matching visual reference image layout
const samplePOSItems = [
  {
    id: 8976,
    title: "Breakfast",
    pendingAmount: 3088,
    image: breakfastImg,
  },
  {
    id: 8946,
    title: "Coffees",
    pendingAmount: 2152,
    image: breakfastImg,
  },
  {
    id: 8376,
    title: "Burgers",
    pendingAmount: 1890,
    image: breakfastImg,
    active: true, // Selected card highlight matching image
  },
  {
    id: 8210,
    title: "Desserts",
    pendingAmount: 2450,
    image: breakfastImg,
  },
  {
    id: 8195,
    title: "Pastas",
    pendingAmount: 1750,
    image: breakfastImg,
  },
  {
    id: 8042,
    title: "Beverages",
    pendingAmount: 1200,
    image: breakfastImg,
  },
];

const POS = () => {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState(8376);

  const handleCardClick = (item) => {
    setSelectedId(item.id);
    navigate("/waiter/order-list", {
      state: { selectedCategory: item.title, categoryId: item.id },
    });
  };

  return (
    <div className="pos-ref-grid">
      {samplePOSItems.map((item) => {
        const isSelected = selectedId === item.id;

        return (
          <div
            key={item.id}
            className={`pos-ref-card ${isSelected ? "active" : ""}`}
            onClick={() => handleCardClick(item)}
          >
            <img
              src={item.image || breakfastImg}
              alt={item.title}
              className="pos-ref-image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = breakfastImg;
              }}
            />
            <div className="pos-ref-overlay">
              <div className="pos-ref-title-group">
                <span className="pos-ref-title">{item.title}</span>
              </div>
              <button
                className="pos-ref-circle-btn"
                aria-label={`Select ${item.title}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCardClick(item);
                }}
              >
                <FaArrowRight size={13} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default POS;
export { POS as PendingPayments };
