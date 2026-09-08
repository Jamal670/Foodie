import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "../../assets/css/Customer/CustMenuList.css";
import { IoIosArrowBack } from "react-icons/io";
import { FaShoppingCart } from "react-icons/fa";
import { HiOutlineViewGrid, HiOutlineSwitchVertical } from "react-icons/hi";
import { PiListBold } from "react-icons/pi";
// Menu category images
import breakfastImg from "/images/breakfast.png";

const CustMenuList = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Eggs");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "list"

  // Check if device is mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Toggle view mode
  const toggleViewMode = () => {
    setViewMode(prevMode => prevMode === "grid" ? "list" : "grid");
  };

  // Category tabs
  const categoryTabs = ["Eggs", "Pancakes", "Parathas", "Pizza", "Burger"];

  // Food items data - example items for Eggs category
  const foodItems = [
    {
      id: 1,
      name: "Scrambled Eggs",
      image: breakfastImg,
      price: "RS. 3,899"
    },
    {
      id: 2,
      name: "Sunny Side Up",
      image: breakfastImg,
      price: "RS. 2,500"
    },
    {
      id: 3,
      name: "Plain Omelet",
      image: breakfastImg,
      price: "RS. 1,800"
    },
    {
      id: 4,
      name: "Spanish Omelet",
      image: breakfastImg,
      price: "RS. 3,200"
    },
    {
      id: 5,
      name: "Mushroom Omelet",
      image: breakfastImg,
      price: "RS. 2,900"
    },
    {
      id: 6,
      name: "Cheese Omelet",
      image: breakfastImg,
      price: "RS. 2,700"
    },
  ];

  const handleAddToCart = (itemId) => {
    // Find the selected item
    const selectedItem = foodItems.find(item => item.id === itemId);

    // Navigate to menu-details page with item data
    navigate("/customer/menu-details", {
      state: {
        item: selectedItem,
        category: activeTab
      }
    });
  };

  return (
    <div className="cust-menu-list-page">
      <Container fluid className="menu-list-container">
        <div className="menu-list-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <IoIosArrowBack />
            <span>Back</span>
          </button>

          <div className="cart-wrapper">
            <img
              src="/images/grocery-store.png"
              alt="Shopping Cart"
              className="cart-image"
              onClick={() => navigate("/customer/menu-orders")}
            />

            <div className="cart-count">
              2
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="category-tabs">
          {categoryTabs.map((tab) => (
            <button
              key={tab}
              className={`category-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Controls Section */}
        <div className="menu-controls">
          <button className="control-btn" onClick={toggleViewMode}>
            <span>View</span>
            {viewMode === "grid" ? <PiListBold /> : <HiOutlineViewGrid />}
          </button>
          <button className="control-btn">
            <span>Prices</span>
            <HiOutlineSwitchVertical />
          </button>
        </div>

        {/* Food Items - Grid or List View */}
        {viewMode === "grid" ? (
          <div className={`menu-categories ${isMobile ? 'mobile-grid' : ''}`}>
            {foodItems.map((item) => (
              <div
                key={item.id}
                className="category-cards"
                style={{ gridArea: isMobile ? 'auto' : 'auto' }}
                onClick={() => handleAddToCart(item.id)}
              >
                <div>
                  <span className="category-name">{item.name}</span>

                </div>
                <div className="category-image-container">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="category-image"
                  />
                  <div className="category-overlayss">
                    <span className="category-price">{item.price}</span>
                    <button
                      className="view-btn"
                      aria-label={`Add ${item.name} to cart`}
                    >
                      <span className="arrow-icon"><FaShoppingCart size={15} /></span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="food-items-list">
            {foodItems.map((item) => (
              <div
                key={item.id}
                className="food-item-list-card"
              >
                <div className="food-item-image-wrapper">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="food-item-list-image"
                  />
                </div>
                <div className="food-item-content">
                  <h3 className="food-item-name">{item.name}</h3>
                  <div className="food-item-bottom-row">
                    <div className="food-item-price-badge">{item.price}</div>
                    <button
                      className="food-item-add-btn"
                      onClick={() => handleAddToCart(item.id)}
                      aria-label={`Add ${item.name} to cart`}
                    >
                      <span>Add</span>
                      <FaShoppingCart />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
};

export default CustMenuList;
