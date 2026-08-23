import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "../../assets/css/Customer/CustMen.css";
import { FaArrowRight } from "react-icons/fa";
import FoodieLogo from "../../components/common/FoodieLogo";

// Menu category images
import breakfastImg from "/images/breakfast.png";
import coffeesImg from "/images/coffees.png";
import burgersImg from "/images/burgers.png";
import dessertsImg from "/images/desserts.png";
import pastasImg from "/images/pastas.png";
import soupsImg from "/images/soups.png";

const CustMenu = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Check if device is mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Menu categories data
  const menuCategories = [
    {
      id: 1,
      name: "Breakfast",
      image: breakfastImg,
      gridArea: "breakfast",
    },
    {
      id: 2,
      name: "Coffees",
      image: coffeesImg,
      gridArea: "coffees",
    },
    {
      id: 3,
      name: "Burgers",
      image: burgersImg,
      gridArea: "burgers",
    },
    {
      id: 4,
      name: "Desserts",
      image: dessertsImg,
      gridArea: "desserts",
    },
    {
      id: 5,
      name: "Pastas",
      image: pastasImg,
      gridArea: "pastas",
    },
    {
      id: 6,
      name: "Soups",
      image: soupsImg,
      gridArea: "soups",
    },
  ];

  const handleCategoryClick = (categoryId, categoryName) => {
    setActiveCategory(categoryId);
    // Navigate to menu-list page with category info
    navigate("/customer/menu-list", {
      state: { categoryId, categoryName }
    });
  };

  return (
    <div className="cust-menu-page">
      <Container fluid className="menu-container">
        <Row className="menu-header">
          <Col>
            <div className="header-content">
              <div className="header-row">
                <FoodieLogo style={{ marginBottom: "10px" }} />
                <h1 className="restaurant-title">Chayé Khana</h1>
              </div>
              <h2 className="menu-title">Menu</h2>
            </div>
          </Col>
        </Row>

        <div className={`menu-categories ${isMobile ? "mobile-grid" : ""}`}>
          {menuCategories.map((category) => (
            <div
              key={category.id}
              className="category-card"
              style={{ gridArea: isMobile ? "auto" : category.gridArea }}
              onClick={() => handleCategoryClick(category.id, category.name)}
            >
              <div className="category-image-container">
                <img
                  src={category.image}
                  alt={category.name}
                  className="category-image"
                />
                <div className="category-overlay">
                  <span className="category-name">{category.name}</span>
                  <button
                    className="view-btn"
                    aria-label={`View ${category.name}`}
                  >
                    <span className="arrow-icon">
                      <FaArrowRight size={15} />
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
};

export default CustMenu;
