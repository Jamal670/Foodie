import React, { useEffect, useRef } from "react";
import { Button } from "react-bootstrap";
import { FaShoppingCart, FaChartBar, FaQrcode, FaUsers, FaMoneyBill, FaCog, FaSignOutAlt, FaPen, FaTimes } from "react-icons/fa";
import { FaClockRotateLeft } from "react-icons/fa6";
import { useNavigate, useLocation } from 'react-router-dom';
import "../../assets/css/SubAdminSideBar.css";

function SubAdminSideBar({ isMobileOpen, setIsMobileOpen }) {
    const navigate = useNavigate();
    const location = useLocation();
    const sidebarRef = useRef(null);

    const isActive = (path) => {
        return location.pathname === path;
    };
    
    const closeSidebar = () => {
        if (setIsMobileOpen) {
            setIsMobileOpen(false);
        }
    };
    
    // Handle outside clicks
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sidebarRef.current && 
                !sidebarRef.current.contains(event.target) && 
                isMobileOpen) {
                closeSidebar();
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [isMobileOpen]);

    return (
        <div ref={sidebarRef} className={`sidebar ${isMobileOpen ? 'show' : ''}`}>
            <Button 
                variant="link" 
                className="close-sidebar-btn" 
                onClick={closeSidebar}
                aria-label="Close sidebar"
            >
                <FaTimes />
            </Button>
            <div className="brand">Foodie</div>
            <div className="restaurant-name">Chayè Khana</div>
            <div className="sidebar-links">
                <Button
                    variant="link"
                    className={isActive('/') || isActive('/subadmin/dashboard') ? 'active' : ''}
                    onClick={() => {
                        navigate('/subadmin/dashboard');
                        closeSidebar();
                    }}
                >
                    <FaShoppingCart /> Orders
                </Button>
                <Button variant="link" onClick={closeSidebar}><FaChartBar /> Insights</Button>
                <Button
                    variant="link"
                    className={isActive('/subadmin/edit-menu') ? 'active' : ''}
                    onClick={() => {
                        navigate('/subadmin/edit-menu');
                        closeSidebar();
                    }}
                >
                    <FaPen /> Edit Menu
                </Button>
                <Button
                    variant="link"
                    className={isActive('/subadmin/order-history') ? 'active' : ''}
                    onClick={() => {
                        navigate('/subadmin/order-history');
                        closeSidebar();
                    }}
                >
                    <FaClockRotateLeft /> Order History
                </Button>
                <Button
                    variant="link"
                    className={isActive('/subadmin/qr-code') ? 'active' : ''}
                    onClick={() => {
                        navigate('/subadmin/qr-code');
                        closeSidebar();
                    }}
                >
                    <FaQrcode /> QR Code
                </Button>
                <Button
                    variant="link"
                    className={isActive('/subadmin/customers') ? 'active' : ''}
                    onClick={() => {
                        navigate('/subadmin/customers');
                        closeSidebar();
                    }}
                >
                    <FaUsers /> Customers
                </Button>
                <Button variant="link" onClick={closeSidebar}><FaMoneyBill /> Foodie Payouts</Button>
                <Button
                    variant="link"
                    className={isActive('/subadmin/setting') ? 'active' : ''}
                    onClick={() => {
                        navigate('/subadmin/setting');
                        closeSidebar();
                    }}
                >
                    <FaCog /> Settings
                </Button>
            </div>
            <div className="logout" onClick={closeSidebar}><FaSignOutAlt /> Log Out</div>
        </div>
    );
}

export default SubAdminSideBar;