import React, { useState, useMemo } from "react";
import { Container, Spinner } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";
import { FaShoppingCart } from "react-icons/fa";
import FoodieLogo from "../../components/common/FoodieLogo";
import "../../assets/css/Waiter/WaiterMenuList.css";
import breakfastImg from "/images/breakfast.png";
import { useWaiterPOSMenu } from "../../hooks/useWaiterPOS";

const WaiterMenuList = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const passedCategoryName = location.state?.selectedCategory || "";
  const passedCategoryId = location.state?.categoryId || null;

  const {
    categories = [],
    menuItems = [],
    isLoading,
    isError,
    hasPosViewPermission,
  } = useWaiterPOSMenu();

  // Find target parent category
  const targetCategory = useMemo(() => {
    if (passedCategoryId) {
      return categories.find((c) => Number(c.id) === Number(passedCategoryId));
    }
    if (passedCategoryName) {
      return categories.find(
        (c) => c.name.toLowerCase() === passedCategoryName.toLowerCase()
      );
    }
    return categories[0] || null;
  }, [categories, passedCategoryId, passedCategoryName]);

  // Extract subcategories (children of targetCategory or level 2 categories)
  const subCategories = useMemo(() => {
    let children = [];
    if (targetCategory && targetCategory.children) {
      children = targetCategory.children;
    } else if (targetCategory) {
      children = categories.filter(
        (c) => Number(c.parentCategoryId) === Number(targetCategory.id)
      );
    }
    return children;
  }, [categories, targetCategory]);

  // Tab list includes subcategory names + "All"
  const tabNames = useMemo(() => {
    const names = subCategories.map((c) => c.name);
    return names.length > 0 ? [...names, "All"] : ["All"];
  }, [subCategories]);

  const [activeTab, setActiveTab] = useState(tabNames[0] || "All");

  // Filter menu items by selected category / subcategory
  const filteredItems = useMemo(() => {
    if (!menuItems || menuItems.length === 0) return [];

    if (activeTab === "All") {
      if (!targetCategory) return menuItems;
      // Gather target category ID and all its child category IDs
      const allowedCategoryIds = new Set([
        Number(targetCategory.id),
        ...subCategories.map((sc) => Number(sc.id)),
      ]);
      return menuItems.filter((item) =>
        allowedCategoryIds.has(Number(item.categoryId))
      );
    }

    const matchedSubCat = subCategories.find(
      (sc) => sc.name.toLowerCase() === activeTab.toLowerCase()
    );

    if (matchedSubCat) {
      return menuItems.filter(
        (item) => Number(item.categoryId) === Number(matchedSubCat.id)
      );
    }

    return menuItems;
  }, [menuItems, activeTab, targetCategory, subCategories]);

  const handleItemClick = (item) => {
    navigate(`/waiter/order-details/${item.id}`, {
      state: { item, menuItemId: item.id },
    });
  };

  if (!hasPosViewPermission || isError) {
    return (
      <div className="wml-page">
        <Container
          fluid
          className="wml-container d-flex justify-content-center align-items-center"
          style={{ minHeight: "400px" }}
        >
          <h2 style={{ color: "#666", fontWeight: "700", fontSize: "1.8rem" }}>
            NO Found
          </h2>
        </Container>
      </div>
    );
  }

  return (
    <div className="wml-page">
      <Container fluid className="wml-container">
        {/* Header Navigation */}
        <div className="wml-header-nav">
          <button className="wml-back-btn" onClick={() => navigate(-1)}>
            <IoIosArrowBack size={18} />
            <span>Back</span>
          </button>
          <div className="d-flex align-items-center gap-2">
            <h1 className="wml-category-title">
              {targetCategory?.name || passedCategoryName || "Menu List"}
            </h1>
          </div>
          <div className="wod-cart-wrapper">
            <img
              src="/images/grocery-store.png"
              alt="Shopping Cart"
              className="wod-cart-image"
              onClick={() => navigate("/waiter/cart")}
            />
          </div>
        </div>

        {isLoading ? (
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ minHeight: "300px" }}
          >
            <Spinner animation="border" variant="primary" role="status">
              <span className="visually-hidden">Loading menu items...</span>
            </Spinner>
          </div>
        ) : (
          <>
            {/* Subcategory Pill Tabs */}
            {tabNames.length > 1 && (
              <div className="wml-tabs" role="tablist">
                {tabNames.map((catName) => (
                  <button
                    key={catName}
                    role="tab"
                    aria-selected={activeTab === catName}
                    className={`wml-tab ${activeTab === catName ? "active" : ""}`}
                    onClick={() => setActiveTab(catName)}
                  >
                    {catName}
                  </button>
                ))}
              </div>
            )}

            {/* Food Items Grid */}
            {filteredItems.length === 0 ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: "300px",
                  width: "100%",
                }}
              >
                <h2 style={{ color: "#666", fontWeight: "700", fontSize: "1.8rem" }}>
                  NO Found
                </h2>
              </div>
            ) : (
              <div className="wml-grid">
                {filteredItems.map((item) => {
                  const price =
                    item.discountedPrice || item.basePrice || item.price || 0;
                  const thumbnailImg =
                    item.images?.find((img) => img.isThumbnail)?.imageUrl ||
                    item.images?.[0]?.imageUrl ||
                    breakfastImg;

                  return (
                    <div
                      key={item.id}
                      className="wml-item-wrapper"
                      onClick={() => handleItemClick(item)}
                    >
                      <span className="wml-item-outside-name">{item.name}</span>

                      <div className="wml-card">
                        <img
                          src={thumbnailImg}
                          alt={item.name}
                          className="wml-card-image"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = breakfastImg;
                          }}
                        />
                        <div className="wml-card-overlay">
                          <span className="wml-card-price">
                            PKR {Number(price).toLocaleString()}
                          </span>
                          <button
                            className="wml-cart-btn"
                            aria-label={`Select ${item.name}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleItemClick(item);
                            }}
                          >
                            <FaShoppingCart size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </Container>
    </div>
  );
};

export default WaiterMenuList;
