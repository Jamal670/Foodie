import React, { useState, useEffect } from "react";
import { Container, Spinner } from "react-bootstrap";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import "../../assets/css/Customer/CustMenuList.css";
import { IoIosArrowBack } from "react-icons/io";
import { FaShoppingCart } from "react-icons/fa";
import { HiOutlineViewGrid, HiOutlineSwitchVertical } from "react-icons/hi";
import { PiListBold } from "react-icons/pi";
import {
  fetchMenuByQrToken,
  getCategoryById,
  getLevel2Children,
  filterMenuItemsByCategoryId,
  getThumbnailUrl,
} from "../../services/customer/menu/showmenu.service";
import { useAlertStore } from "../../context/alertStore";

const CustMenuList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { qrToken: routeQrToken, categoryId: routeCategoryId } = useParams();

  const [activeLevel2Id, setActiveLevel2Id] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "list"

  // Extract QR token dynamically
  const searchParams = new URLSearchParams(location.search);
  const qrToken =
    routeQrToken ||
    searchParams.get("qrToken") ||
    location.state?.qrToken ||
    sessionStorage.getItem("customer_qrToken");

  // Selected Level 1 category ID from URL parameter or navigation state
  const selectedCategoryId =
    routeCategoryId || location.state?.selectedLevel1Id;

  // Mobile resize listener
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Shared TanStack Query for menu data - consumes cache synchronously (0 API requests)
  const {
    data: menuData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["customer-menu", qrToken],
    queryFn: () => fetchMenuByQrToken(qrToken),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    enabled: !!qrToken,
  });

  // Handle errors / missing token
  useEffect(() => {
    if (!qrToken) {
      useAlertStore
        .getState()
        .showAlert("No QR token found. Please scan a valid QR code.");
    } else if (isError && error) {
      useAlertStore
        .getState()
        .showAlert(error.message || "Failed to load menu list.");
    }
  }, [qrToken, isError, error]);

  // Find selected category using service helper
  const selectedCategory =
    getCategoryById(menuData?.categories, selectedCategoryId) ||
    menuData?.categories?.[0];

  // Get Level 2 children of the selected category using service helper
  const level2Categories = getLevel2Children(selectedCategory);
  const hasLevel2Children = level2Categories.length > 0;

  // Manage active Level 2 tab ID if Level 2 children exist
  useEffect(() => {
    if (hasLevel2Children) {
      const exists = level2Categories.some((c) => c.id === activeLevel2Id);
      if (!exists) {
        setActiveLevel2Id(level2Categories[0].id);
      }
    } else {
      setActiveLevel2Id(null);
    }
  }, [hasLevel2Children, level2Categories, activeLevel2Id]);

  // Determine target category ID to filter menu items:
  // - If category has Level 2 children, filter by active Level 2 tab ID
  // - If category has NO children, filter directly by selected Level 1 category ID
  const targetCategoryIdForItems = hasLevel2Children
    ? activeLevel2Id
    : selectedCategory?.id || selectedCategoryId;

  // Filter items using service helper
  const foodItems = filterMenuItemsByCategoryId(
    menuData?.menuItems,
    targetCategoryIdForItems
  );

  const toggleViewMode = () => {
    setViewMode((prevMode) => (prevMode === "grid" ? "list" : "grid"));
  };

  const handleAddToCart = (item) => {
    const categoryName = hasLevel2Children
      ? level2Categories.find((c) => c.id === activeLevel2Id)?.name || ""
      : selectedCategory?.name || "";

    if (qrToken && item?.id) {
      navigate(`/customer/menu-details/t/${qrToken}/${item.id}`, {
        state: {
          item,
          category: categoryName,
        },
      });
    } else {
      navigate("/customer/menu-details", {
        state: {
          item,
          category: categoryName,
        },
      });
    }
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

            <div className="cart-count">2</div>
          </div>
        </div>

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
          <>
            {/* Category Tabs - Render ONLY if selected Level 1 category has Level 2 children */}
            {hasLevel2Children && (
              <div className="category-tabs">
                {level2Categories.map((cat) => (
                  <button
                    key={cat.id}
                    className={`category-tab ${
                      activeLevel2Id === cat.id ? "active" : ""
                    }`}
                    onClick={() => setActiveLevel2Id(cat.id)}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}

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
            {foodItems.length === 0 ? (
              <div
                className="text-center py-5 text-muted"
                style={{ fontSize: "1.1rem" }}
              >
                No menu items available in this category.
              </div>
            ) : viewMode === "grid" ? (
              <div
                className={`menu-categories ${isMobile ? "mobile-grid" : ""}`}
              >
                {foodItems.map((item) => (
                  <div
                    key={item.id}
                    className="category-cards"
                    onClick={() => handleAddToCart(item)}
                  >
                    <div>
                      <span className="category-name">{item.name}</span>
                    </div>
                    <div className="category-image-container">
                      <img
                        src={getThumbnailUrl(item.images)}
                        alt={item.name}
                        className="category-image"
                      />
                      <div className="category-overlayss">
                        <span className="category-price">
                          RS. {item.discountedPrice ?? item.basePrice}
                        </span>
                        <button
                          className="view-btn"
                          aria-label={`Add ${item.name} to cart`}
                        >
                          <span className="arrow-icon">
                            <FaShoppingCart size={15} />
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="food-items-list">
                {foodItems.map((item) => (
                  <div key={item.id} className="food-item-list-card">
                    <div className="food-item-image-wrapper">
                      <img
                        src={getThumbnailUrl(item.images)}
                        alt={item.name}
                        className="food-item-list-image"
                      />
                    </div>
                    <div className="food-item-content">
                      <h3 className="food-item-name">{item.name}</h3>
                      <div className="food-item-bottom-row">
                        <div className="food-item-price-badge">
                          RS. {item.discountedPrice ?? item.basePrice}
                        </div>
                        <button
                          className="food-item-add-btn"
                          onClick={() => handleAddToCart(item)}
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
          </>
        )}
      </Container>
    </div>
  );
};

export default CustMenuList;
