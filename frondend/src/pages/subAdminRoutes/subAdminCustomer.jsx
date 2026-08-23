import React, { useState } from "react";
import { Container, Row, Col, Card, Button, Table, Nav, Dropdown, Form } from "react-bootstrap";
import { FaChevronDown, FaChevronUp, FaMinusCircle, FaAngleDown, FaSearch, FaFilter, FaBars } from "react-icons/fa";
import { LuDownload } from "react-icons/lu";
import { TiFilter } from "react-icons/ti";
import SubAdminSideBar from "../../components/sidebar/SubAdminSideBar";
import "../../assets/css/subAdminCustomer.css";

function SubAdminCustomer() {
    const customers = [
        { id: 1, name: "Ahmed", phoneNo: "+92 300 0000000", email: "example@gmail.com", creationDate: "12 Feb, 2025", creationTime: "7:30 pm" },
        { id: 2, name: "Danial", phoneNo: "+92 300 0000000", email: "example@gmail.com", creationDate: "12 Feb, 2025", creationTime: "7:30 pm" },
        { id: 3, name: "Mohammed Ehsan", phoneNo: "+92 300 0000000", email: "example@gmail.com", creationDate: "12 Feb, 2025", creationTime: "7:30 pm" },
        { id: 4, name: "Bilal Arif", phoneNo: "+92 300 0000000", email: "example@gmail.com", creationDate: "12 Feb, 2025", creationTime: "7:30 pm" },
        { id: 5, name: "Azam Khan", phoneNo: "+92 300 0000000", email: "example@gmail.com", creationDate: "12 Feb, 2025", creationTime: "7:30 pm" },
        { id: 6, name: "Babar Awan", phoneNo: "+92 300 0000000", email: "example@gmail.com", creationDate: "12 Feb, 2025", creationTime: "7:30 pm" },
        { id: 7, name: "Rizwan Saleem", phoneNo: "+92 300 0000000", email: "example@gmail.com", creationDate: "12 Feb, 2025", creationTime: "7:30 pm" },
        { id: 8, name: "Saqib Saif", phoneNo: "+92 300 0000000", email: "example@gmail.com", creationDate: "12 Feb, 2025", creationTime: "7:30 pm" },
        { id: 9, name: "Mohammed Iqbal", phoneNo: "+92 300 0000000", email: "example@gmail.com", creationDate: "12 Feb, 2025", creationTime: "7:30 pm" },
        { id: 10, name: "Salman Khan", phoneNo: "+92 300 0000000", email: "example@gmail.com", creationDate: "12 Feb, 2025", creationTime: "7:30 pm" },
        { id: 11, name: "Shahrukh Afridi", phoneNo: "+92 300 0000000", email: "example@gmail.com", creationDate: "12 Feb, 2025", creationTime: "7:30 pm" },
        { id: 12, name: "Saeed Mughal", phoneNo: "+92 300 0000000", email: "example@gmail.com", creationDate: "12 Feb, 2025", creationTime: "7:30 pm" },
        { id: 13, name: "Fahad Mustafa", phoneNo: "+92 300 0000000", email: "example@gmail.com", creationDate: "12 Feb, 2025", creationTime: "7:30 pm" }
    ];

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTypes, setSelectedTypes] = useState([]);
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

    // Filter customers based on search term
    const filteredCustomers = customers.filter(customer => {
        return customer.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
               customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    });
    
    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentCustomers = filteredCustomers.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
    
    // Change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    
    // Handle search input change
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset to first page when searching
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
                    <h1 className="overview-title">Customers Data</h1>

                    
                </div>

                <div className="items-controls">
                    <div className="items-controls-left">
                        <div className="items-search">
                            <div className="search-input-container">
                                <FaSearch className="search-icon" />
                                <input 
                                    type="text" 
                                    placeholder="Search by name" 
                                    className="search-input" 
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                />
                            </div>
                        </div>
                        <button className="bulk-actions-btn">Bulk Actions <FaAngleDown /></button>
                        <button className="filter-btn">Filter Items <TiFilter  className="filter-icon" /></button>
                        <button className="export-btn">Export Data <LuDownload className="filter-icon" /></button>
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
                                <th>Name</th>
                                <th>Phone No</th>
                                <th>Email</th>
                                <th>Creation Date</th>
                                <th>Creation Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentCustomers.map((customer) => (
                                <tr key={customer.id}>
                                    <td className="text-secondary">{customer.id}</td>
                                    <td className="fw-semibold text-dark">{customer.name}</td>
                                    <td className="text-secondary">{customer.phoneNo}</td>
                                    <td className="text-secondary">{customer.email}</td>
                                    <td className="text-secondary">{customer.creationDate}</td>
                                    <td className="text-secondary">{customer.creationTime}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    
                    {/* Pagination */}
                    <div className="pagination-container d-flex justify-content-between align-items-center mt-4">
                        <div className="items-per-page">
                            <span className="me-2">Show:</span>
                            <select 
                                className="form-select form-select-sm d-inline-block w-auto"
                                value={itemsPerPage}
                                onChange={(e) => {
                                    setItemsPerPage(Number(e.target.value));
                                    setCurrentPage(1); // Reset to first page when changing items per page
                                }}
                            >
                                <option value="10">10</option>
                                <option value="20">20</option>
                                <option value="50">50</option>
                            </select>
                        </div>
                        
                        <div className="pagination-numbers d-flex">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                                <button 
                                    key={number} 
                                    className={`pagination-number ${currentPage === number ? 'active' : ''}`}
                                    onClick={() => paginate(number)}
                                >
                                    {number}
                                </button>
                            ))}
                            <button 
                                className="pagination-arrow"
                                onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                <span>→</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SubAdminCustomer;