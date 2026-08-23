import React, { useState } from "react";
import "../../../assets/css/auth/signup.css";
import "../../../assets/css/auth/contactInfo.css";
import { FaAngleDown } from "react-icons/fa";
import { createBranchService } from "../../../services/onBoardingResturant/createResturant.serive";
import { useAlertStore } from "../../../context/alertStore";

const ContantInfo = ({ onNext, onBack, restaurantData }) => {
  const [contactName, setContactName] = useState("");
  const [contactDesignation, setContactDesignation] = useState("");
  const [countryCode, setCountryCode] = useState("+92");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // Phone formatting logic: 300 00 00 000
  const handlePhoneChange = (e) => {
    const input = e.target.value;
    // Only allow digits and spaces (though we'll re-format anyway)
    const digits = input.replace(/\D/g, "").slice(0, 10);

    let formatted = "";
    if (digits.length > 0) formatted += digits.slice(0, 3);
    if (digits.length > 3) formatted += " " + digits.slice(3, 5);
    if (digits.length > 5) formatted += " " + digits.slice(5, 7);
    if (digits.length > 7) formatted += " " + digits.slice(7, 10);

    setPhoneNumber(formatted);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Validate Required Fields
    if (!contactName.trim()) {
      useAlertStore.getState().showAlert("Contact Person Name is required.");
      return;
    }

    const digitCount = phoneNumber.replace(/\s/g, "").length;
    if (digitCount !== 10) {
      useAlertStore
        .getState()
        .showAlert("Phone number must contain exactly 10 digits.");
      return;
    }

    if (!restaurantData?.country || !restaurantData?.city) {
      useAlertStore
        .getState()
        .showAlert("Restaurant location data (Country/City) is missing.");
      return;
    }

    setLoading(true);

    try {
      // 2. Prepare Payload
      const payload = {
        country: restaurantData.country,
        city: restaurantData.city,
        contactPersonName: contactName,
        contactPersonDesignation: contactDesignation || undefined,
        contactPersonPhone: `${countryCode}${phoneNumber.replace(/\s/g, "")}`,
        contactPersonEmail: email || undefined,
      };

      // 3. Call API
      const response = await createBranchService(payload);
      console.log("Branch created successfully", response);

      // 4. Navigate on success
      onNext({
        contactName,
        contactDesignation,
        countryCode,
        phoneNumber,
        email,
      });
    } catch (error) {
      console.error("Error creating branch:", error);
      useAlertStore
        .getState()
        .showAlert(
          error.response?.data?.message ||
            error.message ||
            "Failed to create branch. Please try again.",
        );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-card contact-info-card">
      {/* Progress Dots */}
      <div className="progress-dots">
        <span className="progress-dot"></span>
        <span className="progress-dot active"></span>
        <span className="progress-dot"></span>
      </div>

      <h1 className="signup-title contact-info-title">
        Contact Person <span className="highlight-text">Info</span>
      </h1>

      {/* Contact Info Form */}
      <form className="signup-form contact-info-form" onSubmit={handleSubmit}>
        {/* Contact Person Name */}
        <div className="form-group">
          <label className="form-label">Contact Person Name</label>
          <input
            type="text"
            className="form-input"
            placeholder="Abid Khan"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            required
          />
        </div>

        {/* Contact Person Designation (Optional) */}
        <div className="form-group">
          <label className="form-label">
            Contact Person Designation (Optional)
          </label>
          <input
            type="text"
            className="form-input"
            placeholder="Marketing Manager"
            value={contactDesignation}
            onChange={(e) => setContactDesignation(e.target.value)}
          />
        </div>

        {/* Contact Person Phone no */}
        <div className="form-group">
          <label className="form-label">Contact Person Phone no</label>
          <div className="phone-input-group">
            <div className="country-code-wrapper">
              <select
                className="form-input country-code-select"
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                required
              >
                <option value="+92">+92</option>
                <option value="+1">+1</option>
                <option value="+44">+44</option>
                <option value="+91">+91</option>
                <option value="+971">+971</option>
                <option value="+966">+966</option>
              </select>
              <FaAngleDown className="dropdown-icon" />
            </div>
            <input
              type="tel"
              className="form-input phone-number-input"
              placeholder="300 00 00 000"
              value={phoneNumber}
              onChange={handlePhoneChange}
              required
            />
          </div>
        </div>

        {/* Contact Person Email (Optional) */}
        <div className="form-group">
          <label className="form-label">Contact Person Email (Optional)</label>
          <input
            type="email"
            className="form-input"
            placeholder="example@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Action Buttons */}
        <div className="contact-info-actions">
          <button
            type="button"
            className="signup-btn contact-previous-btn"
            onClick={onBack}
          >
            Previous
          </button>
          <button
            type="submit"
            className="signup-btn contact-next-btn"
            disabled={loading}
          >
            {loading ? "Creating..." : "Next"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContantInfo;
