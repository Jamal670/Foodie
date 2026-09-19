import React, { useState } from "react";
import { Container } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";
import { FaShoppingCart } from "react-icons/fa";
import FoodieLogo from "../../components/common/FoodieLogo";
import "../../assets/css/Waiter/WaiterMenuList.css";
import breakfastImg from "/images/breakfast.png";

// Sample food items matching the reference image layout and titles
const sampleFoodItems = [
    { id: 101, name: "Scrambled Eggs", category: "Eggs", price: "PKR 3,899", image: breakfastImg },
    { id: 102, name: "Sunny Side Up", category: "Eggs", price: "PKR 3,899", image: breakfastImg },
    { id: 103, name: "Plain Omelet", category: "Eggs", price: "PKR 3,899", image: breakfastImg },
    { id: 104, name: "Spanish Omelet", category: "Eggs", price: "PKR 3,899", image: breakfastImg },
    { id: 105, name: "Mushroom Omelet", category: "Eggs", price: "PKR 3,899", image: breakfastImg },
    { id: 106, name: "Pastas", category: "Pastas", price: "PKR 2,450", image: breakfastImg },
    { id: 107, name: "Pancakes with Syrup", category: "Pancakes", price: "PKR 1,890", image: breakfastImg },
    { id: 108, name: "Aloo Paratha", category: "Parathas", price: "PKR 1,200", image: breakfastImg },
];

const subCategories = ["Eggs", "Pancakes", "Parathas", "Pastas", "All"];

const WaiterMenuList = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Selected category passed via navigation state or default "Eggs"
    const passedCategory = location.state?.selectedCategory || "Eggs";
    const [activeTab, setActiveTab] = useState(
        subCategories.includes(passedCategory) ? passedCategory : "Eggs"
    );

    // Filter items based on active subcategory tab
    const filteredItems =
        activeTab === "All"
            ? sampleFoodItems
            : sampleFoodItems.filter(
                (item) => item.category.toLowerCase() === activeTab.toLowerCase()
            );

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
                            Menu List
                        </h1>
                    </div>
                    <div></div>
                </div>

                {/* Subcategory Tabs (Level 2 Tabs) - Pill Tabs matching Reference Image */}
                <div className="wml-tabs" role="tablist">
                    {subCategories.map((cat) => (
                        <button
                            key={cat}
                            role="tab"
                            aria-selected={activeTab === cat}
                            className={`wml-tab ${activeTab === cat ? "active" : ""}`}
                            onClick={() => setActiveTab(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Food Items Grid View - Staggered 2-column mobile layout matching reference image */}
                <div className="wml-grid">
                    {filteredItems.map((item) => (
                        <div key={item.id} className="wml-item-wrapper">
                            {/* Item Title rendered OUTSIDE and ABOVE the card image */}
                            <span className="wml-item-outside-name">{item.name}</span>

                            <div
                                className="wml-card"
                                onClick={() => console.log(`Selected item: ${item.name}`)}
                            >
                                <img
                                    src={item.image || breakfastImg}
                                    alt={item.name}
                                    className="wml-card-image"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = breakfastImg;
                                    }}
                                />
                                <div className="wml-card-overlay">
                                    <span className="wml-card-price">{item.price}</span>
                                    <button
                                        className="wml-cart-btn"
                                        aria-label={`Add ${item.name} to cart`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            console.log(`Add ${item.name} to cart`);
                                        }}
                                    >
                                        <FaShoppingCart size={13} />
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

export default WaiterMenuList;
