import React, { useState } from "react";
import { Form, Row, Col } from "react-bootstrap";
import { FaPen, FaBars } from "react-icons/fa";
import SubAdminSideBar from "../../components/sidebar/SubAdminSideBar";
import "../../assets/css/SubAdminSetting.css";

function SubAdminSetting() {
    const [activeTab, setActiveTab] = useState('general');
    const [restaurantName, setRestaurantName] = useState('Chayé Khana');
    const [branches, setBranches] = useState('20');
    const [country, setCountry] = useState('Pakistan');
    const [city, setCity] = useState('Islamabad');

    const [contactName, setContactName] = useState('Asad Khan');
    const [contactDesignation, setContactDesignation] = useState('Ceo');
    const [contactPhone, setContactPhone] = useState('+92 344 5678912');
    const [contactEmail, setContactEmail] = useState('example@gmail.com');

    const [menuLanguage, setMenuLanguage] = useState('English');
    const [orderTypes, setOrderTypes] = useState({
        dineIn: true,
        takeaways: true,
        deliveries: true
    });
    const [deliveryCharge, setDeliveryCharge] = useState('200');
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const handleSave = () => {
        console.log('Settings saved');
        // Implement save functionality
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
                <div className="header d-flex justify-content-between align-items-center mb-4">
                    <h1 className="overview-title">Settings</h1>
                </div>

                {/* Settings Tabs */}
                <div className="settings-tabs">
                    <button
                        className={`settings-tab-btn ${activeTab === 'general' ? 'active' : ''}`}
                        onClick={() => setActiveTab('general')}
                    >
                        General Info Settings
                    </button>
                    <button
                        className={`settings-tab-btn ${activeTab === 'roles' ? 'active' : ''}`}
                        onClick={() => setActiveTab('roles')}
                    >
                        Roles & Permissions
                    </button>
                    <button
                        className={`settings-tab-btn ${activeTab === 'integrations' ? 'active' : ''}`}
                        onClick={() => setActiveTab('integrations')}
                    >
                        Integrations
                    </button>
                    <button
                        className={`settings-tab-btn ${activeTab === 'branches' ? 'active' : ''}`}
                        onClick={() => setActiveTab('branches')}
                    >
                        Branches
                    </button>
                </div>

                {/* Main Settings Container with White Background */}
                <div className="main-settings-container">
                    {/* Restaurant Info Section */}
                    <div className="inner-settings-section">
                        <div className="settings-section-header">
                            <h2 className="settings-section-title">Your Restaurant Info</h2>
                            <button className="edit-button"><FaPen /></button>
                        </div>

                        <Row className="settings-form-row">
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Restaurant Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={restaurantName}
                                        onChange={(e) => setRestaurantName(e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>No of branches</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={branches}
                                        onChange={(e) => setBranches(e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row className="settings-form-row">
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Country</Form.Label>
                                    <div className="custom-select-wrapper">
                                        <Form.Select
                                            value={country}
                                            onChange={(e) => setCountry(e.target.value)}
                                        >
                                            <option value="Pakistan">Pakistan</option>
                                            <option value="India">India</option>
                                            <option value="USA">USA</option>
                                        </Form.Select>
                                    </div>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>City</Form.Label>
                                    <div className="custom-select-wrapper">
                                        <Form.Select
                                            value={city}
                                            onChange={(e) => setCity(e.target.value)}
                                        >
                                            <option value="Islamabad">Islamabad</option>
                                            <option value="Lahore">Lahore</option>
                                            <option value="Karachi">Karachi</option>
                                        </Form.Select>
                                    </div>
                                </Form.Group>
                            </Col>
                        </Row>
                    </div>

                    {/* Contact Person Info Section */}
                    <div className="inner-settings-section">
                        <div className="settings-section-header">
                            <h2 className="settings-section-title">Contact Person Info</h2>
                            <button className="edit-button"><FaPen /></button>
                        </div>

                        <Row className="settings-form-row">
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Contact Person Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={contactName}
                                        onChange={(e) => setContactName(e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Contact Person Designation</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={contactDesignation}
                                        onChange={(e) => setContactDesignation(e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row className="settings-form-row">
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Contact Person Phone no</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={contactPhone}
                                        onChange={(e) => setContactPhone(e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Contact Person Email (Optional)</Form.Label>
                                    <Form.Control
                                        type="email"
                                        value={contactEmail}
                                        onChange={(e) => setContactEmail(e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </div>

                    {/* Menu Options Section */}
                    <div className="inner-settings-section">
                        <div className="settings-section-header">
                            <h2 className="settings-section-title">Menu Options</h2>
                            <button className="edit-button"><FaPen /></button>
                        </div>

                        <div className="menu-options-content">
                            <div className="menu-options-left">
                                <div className="menu-option-group">
                                    <div className="menu-option-label">Menu Language</div>
                                    <div className="menu-option-value">
                                        <div className="custom-select-wrapper">
                                            <Form.Select
                                                value={menuLanguage}
                                                onChange={(e) => setMenuLanguage(e.target.value)}
                                            >
                                                <option value="English">English</option>
                                                <option value="Urdu">Urdu</option>
                                                <option value="Arabic">Arabic</option>
                                            </Form.Select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="menu-options-right">
                                <div className="menu-option-label">Order Types</div>
                                <div className="order-types-list">
                                    <div className="order-type-item">
                                        <div className="order-type-icon home-icon"></div>
                                        <div className="order-type-label">Dine In</div>
                                        <div className="order-type-toggle">
                                            <div className="circle-checkbox">
                                                <Form.Check
                                                    type="checkbox"
                                                    checked={orderTypes.dineIn}
                                                    onChange={() => setOrderTypes({ ...orderTypes, dineIn: !orderTypes.dineIn })}
                                                    className="custom-circle-checkbox"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="order-type-item">
                                        <div className="order-type-icon bag-icon"></div>
                                        <div className="order-type-label">Takeaways</div>
                                        <div className="order-type-toggle">
                                            <div className="circle-checkbox">
                                                <Form.Check
                                                    type="checkbox"
                                                    checked={orderTypes.takeaways}
                                                    onChange={() => setOrderTypes({ ...orderTypes, takeaways: !orderTypes.takeaways })}
                                                    className="custom-circle-checkbox"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="order-type-item delivery-item">
                                        <div className="order-type-main">
                                            <div className="order-type-icon delivery-icon"></div>
                                            <div className="order-type-label">Deliveries</div>
                                            <div className="order-type-toggle">
                                                <div className="circle-checkbox">
                                                    <Form.Check
                                                        type="checkbox"
                                                        checked={orderTypes.deliveries}
                                                        onChange={() => setOrderTypes({ ...orderTypes, deliveries: !orderTypes.deliveries })}
                                                        className="custom-circle-checkbox"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {orderTypes.deliveries && (
                                            <div className="delivery-charge">
                                                <div className="delivery-charge-label">Charges</div>
                                                
                                                <div style={{display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#f0f0f0', borderRadius: '8px', padding: '8px 12px', width: '100%'}}>

                                                <div className="delivery-charge-currency">PKR</div>
                                                <div className="delivery-charge-value">{deliveryCharge}</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>


                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="settings-save-container">
                        <button className="settings-save-btn" onClick={handleSave}>
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SubAdminSetting;