import React, { useState, useEffect } from "react";
import { Container, Row, Col, Spinner } from "react-bootstrap";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import "../../assets/css/Customer/CustMen.css";
import { FaArrowRight } from "react-icons/fa";
import FoodieLogo from "../../components/common/FoodieLogo";
import {
  fetchMenuByQrToken,
  getLevel1Categories,
} from "../../services/customer/menu/showmenu.service";
import { useAlertStore } from "../../context/alertStore";

const CustMenu = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { qrToken: routeQrToken } = useParams();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Extract QR token dynamically from path params, search params, state, or session storage
  const searchParams = new URLSearchParams(location.search);
  const qrToken =
    routeQrToken ||
    searchParams.get("qrToken") ||
    location.state?.qrToken ||
    sessionStorage.getItem("customer_qrToken");

  // Save qrToken to sessionStorage for persistence across navigation/refreshes
  useEffect(() => {
    if (qrToken) {
      sessionStorage.setItem("customer_qrToken", qrToken);
    }
  }, [qrToken]);

  // Check if device is mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Single TanStack Query for complete QR menu data
  const {
    data: menuData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["customer-menu", qrToken],
    queryFn: () => fetchMenuByQrToken(qrToken),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    enabled: !!qrToken,
  });

  // Handle missing token or query error
  useEffect(() => {
    if (!qrToken) {
      useAlertStore
        .getState()
        .showAlert("No QR token found. Please scan a valid QR code.");
    } else if (isError && error) {
      useAlertStore
        .getState()
        .showAlert(
          error.message || "Failed to load menu. Please try scanning again."
        );
    }
  }, [qrToken, isError, error]);

  // Use service helper to extract ONLY Level 1 categories
  const level1Categories = getLevel1Categories(menuData);

  const handleCategoryClick = (categoryId, categoryName) => {
    const targetPath = qrToken
      ? `/customer/menu-list/t/${qrToken}/${categoryId}`
      : "/customer/menu-list";

    navigate(targetPath, {
      state: { selectedLevel1Id: categoryId, categoryName, qrToken },
    });
  };

  return (
    <div className="cust-menu-page">
      <Container fluid className="menu-container">
        <Row className="menu-header">
          <Col>
            <div className="header-content">
              <div className="header-row">
                <div className="brand-section">
                  <FoodieLogo className="foodie-logo" />
                  <h1 className="restaurant-title">
                    {menuData?.restaurant?.restName || "Restaurant"}
                  </h1>
                </div>

                <div className="cart-wrapper">
                  <img
                    src="/images/grocery-store.png"
                    alt="Shopping Cart"
                    className="cart-image"
                    onClick={() => navigate("/customer/menu-orders")}
                  />

                  <div className="cart-count">2</div>
                </div>
              </div>

              <h2 className="menu-title">Menu</h2>
            </div>
          </Col>
        </Row>

        {isLoading ? (
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ minHeight: "300px" }}
          >
            <Spinner animation="border" variant="primary" role="status">
              <span className="visually-hidden">Loading menu...</span>
            </Spinner>
          </div>
        ) : (
          <div className={`menu-categories ${isMobile ? "mobile-grid" : ""}`}>
            {level1Categories.map((category) => (
              <div
                key={category.id}
                className="category-cards"
                onClick={() =>
                  handleCategoryClick(category.id, category.name)
                }
              >
                <div className="category-image-container">
                  <img
                    src={category.imageUrl || "/images/breakfast.png"}
                    alt={category.name}
                    className="category-image"
                  />
                  <div className="category-overlays">
                    <span className="category-names">{category.name}</span>
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
        )}
      </Container>
    </div>
  );
};

export default CustMenu;
