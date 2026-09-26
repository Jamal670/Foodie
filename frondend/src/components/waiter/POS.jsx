import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import { Spinner } from "react-bootstrap";
import "../../assets/css/Waiter/WaiterOrderMenu.css";
import breakfastImg from "/images/breakfast.png";
import { useWaiterPOSMenu } from "../../hooks/useWaiterPOS";

const POS = () => {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState(null);

  const {
    categories = [],
    isLoading,
    isError,
    error,
    hasPosViewPermission,
  } = useWaiterPOSMenu();

  // Filter top level categories (level === 1 or parentCategoryId === null/undefined)
  const topCategories = categories.filter(
    (c) => c.level === 1 || !c.parentCategoryId
  );
  const displayCategories =
    topCategories.length > 0 ? topCategories : categories;

  const handleCardClick = (cat) => {
    setSelectedId(cat.id);
    navigate("/waiter/order-list", {
      state: { selectedCategory: cat.name, categoryId: cat.id, category: cat },
    });
  };

  // Permission error or query failure
  if (!hasPosViewPermission || isError) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "350px",
          width: "100%",
        }}
      >
        <h2 style={{ color: "#666", fontWeight: "700", fontSize: "1.8rem" }}>
          NO Found
        </h2>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "300px", width: "100%" }}
      >
        <Spinner animation="border" variant="primary" role="status">
          <span className="visually-hidden">Loading POS categories...</span>
        </Spinner>
      </div>
    );
  }

  if (!displayCategories || displayCategories.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "350px",
          width: "100%",
        }}
      >
        <h2 style={{ color: "#666", fontWeight: "700", fontSize: "1.8rem" }}>
          NO Found
        </h2>
      </div>
    );
  }

  return (
    <div className="pos-ref-grid">
      {displayCategories.map((item) => {
        const isSelected = selectedId === item.id;
        const imageUrl = item.imageUrl || breakfastImg;

        return (
          <div
            key={item.id}
            className={`pos-ref-card ${isSelected ? "active" : ""}`}
            onClick={() => handleCardClick(item)}
          >
            <img
              src={imageUrl}
              alt={item.name}
              className="pos-ref-image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = breakfastImg;
              }}
            />
            <div className="pos-ref-overlay">
              <div className="pos-ref-title-group">
                <span className="pos-ref-title">{item.name}</span>
              </div>
              <button
                className="pos-ref-circle-btn"
                aria-label={`Select ${item.name}`}
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
