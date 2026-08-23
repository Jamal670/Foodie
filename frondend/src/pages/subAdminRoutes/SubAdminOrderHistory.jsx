import React, { useState } from "react";
import { Container, Row, Col, Card, Button, Table, Nav, Dropdown, Form } from "react-bootstrap";
import { FaChevronDown, FaChevronUp, FaMinusCircle, FaAngleDown, FaSearch, FaFilter, FaBars } from "react-icons/fa";
import SubAdminSideBar from "../../components/sidebar/SubAdminSideBar";
import "../../assets/css/SubAdminOrderHistory.css";

function SubAdminOrderHistory() {
    const orders = Array.from({ length: 10 }).map((_, i) => ({
        id: i + 1,
        item: "×2 Hamburgers, fries & more",
        name: "Ahmed",
        amount: "PKR 2500",
        orderType: "Delivery",
        orderTime: `${23 - i} mins ago`,
        status: "Preparing",
    }));

    const [selectedTypes, setSelectedTypes] = useState([]);
    const [expandedRow, setExpandedRow] = useState(null);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    
    const orderTypes = ["All", "Dine In", "Takeaway", "Delivery"];
    
    const handleAddItem = () => {
        // Add your item addition logic here
        console.log("Add new item clicked");
    };

    const handleTypeChange = (type) => {
        if (type === "All") {
            setSelectedTypes(["All"]);
        } else {
            setSelectedTypes(prev => {
                const filtered = prev.filter(t => t !== "All");
                if (filtered.includes(type)) {
                    return filtered.filter(t => t !== type);
                } else {
                    return [...filtered, type];
                }
            });
        }
    };

    const getSelectedTypesText = () => {
        if (selectedTypes.length === 0 || selectedTypes.includes("All")) {
            return "All";
        }
        return selectedTypes.join(" / ");
    };

    const toggleRow = (orderId) => {
        setExpandedRow(expandedRow === orderId ? null : orderId);
    };

    return (
        <div className="dashboard d-flex">
            {/* Sidebar Component */}
            <SubAdminSideBar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />
            
            {/* Mobile Menu Toggle Button */}
            <button 
                className={`menu-toggle ${isMobileOpen ? 'hidden' : ''}`}
                onClick={() => setIsMobileOpen(true)}
                aria-label="Toggle menu"
            >
                <FaBars />
            </button>

            {/* Main Content */}
            <div className="main-content">
                <div className="header d-flex justify-content-between align-items-center mb-3">
                    <h1 className="overview-title">Order History</h1>

                    
                </div>

                <div className="items-controls">
                    <div className="items-controls-left">
                        <div className="items-search">
                            <div className="search-input-container">
                                <FaSearch className="search-icon" />
                                <input type="text" placeholder="Search by name and items" className="search-input" />
                            </div>
                        </div>
                        <button className="bulk-actions-btn">Bulk Actions <FaAngleDown /></button>
                        <button className="filter-btn">Filter Items <FaFilter className="filter-icon" /></button>
                    </div>
                    <div className="items-controls-right">
                        <button className="date-button" onClick={handleAddItem}>
                            Today <FaAngleDown />
                        </button>
                    </div>
                </div>

                {/* Order Type Filter Box */}
                {selectedTypes.length > 0 && !selectedTypes.includes("All") && (
                    <div className="selected-types-box mb-2 order-info">
                        {getSelectedTypesText()}
                    </div>
                )}

                {/* Table */}
                <div className="orders-table">
                    <Table hover responsive borderless>
                        <thead>
                            <tr>
                                <th>Sr</th>
                                <th>Ordered Items</th>
                                <th>Name</th>
                                <th>Amount</th>
                                <th>
                                    <Dropdown>
                                        <Dropdown.Toggle variant="link" className="order-type-toggle">
                                            Order Type <FaChevronDown />
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu>
                                            {orderTypes.map((type) => (
                                                <div key={type} className="dropdown-item-checkbox">
                                                    <Form.Check
                                                        type="checkbox"
                                                        label={type}
                                                        checked={selectedTypes.includes(type)}
                                                        onChange={() => handleTypeChange(type)}
                                                    />
                                                </div>
                                            ))}
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </th>
                                <th>Order Time</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <React.Fragment key={order.id}>
                                    {expandedRow !== order.id && (
                                        <tr>
                                            <td className="text-secondary">{order.id}</td>
                                            <td className="fw-semibold text-dark">{order.item}</td>
                                            <td className="text-secondary">{order.name}</td>
                                            <td className="text-secondary">{order.amount}</td>
                                            <td className="text-secondary">{order.orderType}</td>
                                            <td className="text-secondary">{order.orderTime}</td>
                                            <td><span className="status preparing">{order.status}</span></td>
                                            <td>
                                                <div className="action-buttons">
                                                    <Button className="btnn">Done</Button>
                                                    <Button
                                                        size="sm"
                                                        variant="link"
                                                        className="more-actions-btn"
                                                        onClick={() => toggleRow(order.id)}
                                                    >
                                                        <FaChevronDown />
                                                    </Button>
                                                </div>
                                            </td>

                                        </tr>
                                    )}

                                    {expandedRow === order.id && (
                                        <tr className="expanded-row">
                                            <td colSpan="8">
                                                <div className="expanded-content">
                                                    {/* Header with + and - Buttons */}
                                                    <div className="expand-header">
                                                        <button
                                                            className="expand-btn minus"
                                                            onClick={() => toggleRow(order.id)}
                                                            aria-label="collapse"
                                                        >
                                                            <FaMinusCircle />
                                                        </button>
                                                        <div className="order-info-boxes">
                                                            <div className="info-box">
                                                                <span className="info-label">Order #</span>
                                                                <span className="info-value">{String(order.id).padStart(6, "0")}</span>
                                                            </div>
                                                            <div className="info-box">
                                                                <span className="info-label">Order Type</span>
                                                                <span className="info-value">{order.orderType}</span>
                                                            </div>
                                                            <div className="info-box">
                                                                <span className="info-label">Table #</span>
                                                                <span className="info-value">{order.table ?? "05"}</span>
                                                            </div>
                                                            <div className="info-box">
                                                                <span className="info-label">Date</span>
                                                                <span className="info-value">{order.date ?? "12 Feb, 2025"}</span>
                                                            </div>
                                                            <div className="info-box">
                                                                <span className="info-label">Time</span>
                                                                <span className="info-value">{order.orderTime}</span>
                                                            </div>
                                                            <div className="info-box">
                                                                <span className="info-label">Customer</span>
                                                                <span className="info-value">{order.name}</span>
                                                            </div>
                                                        </div>
                                                        <button
                                                            className="expand-btn plus"
                                                            onClick={() => toggleRow(order.id)}
                                                            aria-label="collapse"
                                                        >
                                                            <FaChevronUp />
                                                        </button>
                                                    </div>
                                                    {/* Items Table */}
                                                    <Table responsive borderless className="inner-table">
                                                        <thead>
                                                            <tr>
                                                                <th>Sr</th>
                                                                <th>Items</th>
                                                                <th>Quantity</th>
                                                                <th>Customizations</th>
                                                                <th>Varication</th>
                                                                <th>Unit Price</th>
                                                                <th>Total</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr>
                                                                <td>1</td>
                                                                <td>Cheeseburger</td>
                                                                <td>02</td>
                                                                <td>Extra Fry</td>
                                                                <td>small</td>
                                                                <td>500 PKR</td>
                                                                <td>1000 PKR</td>
                                                            </tr>
                                                            <tr>
                                                                <td>1</td>
                                                                <td>Cheeseburger</td>
                                                                <td>02</td>
                                                                <td>Extra Fry</td>
                                                                <td>small</td>
                                                                <td>500 PKR</td>
                                                                <td>1000 PKR</td>
                                                            </tr>
                                                            <tr>
                                                                <td>1</td>
                                                                <td>Cheeseburger</td>
                                                                <td>02</td>
                                                                <td>Extra Fry</td>
                                                                <td>small</td>
                                                                <td>500 PKR</td>
                                                                <td>1000 PKR</td>
                                                            </tr>
                                                        </tbody>
                                                    </Table>

                                                    {/* Summary Section - Moved outside table */}
                                                    <hr className="summary-divider" />
                                                    <div className="table-summary">
                                                        <div className="summary-row">
                                                            <span className="summary-label">Subtotal</span>
                                                            <span className="summary-value">PKR 2152.5</span>
                                                        </div>

                                                        <div className="summary-row">
                                                            <span className="summary-label">Final Total +Tax (05%)</span>
                                                            <span className="summary-value final-total">PKR 2255</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </Table>
                </div>
            </div>
        </div>
    );
}

export default SubAdminOrderHistory;