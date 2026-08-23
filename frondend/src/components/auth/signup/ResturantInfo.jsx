import React, { useState } from "react";
import "../../../assets/css/auth/signup.css";
import "../../../assets/css/auth/restaurantInfo.css";
import { createResturantService } from "../../../services/onBoardingResturant/createResturant.serive";
import { useAlertStore } from "../../../context/alertStore";

const ResturantInfo = ({ onNext, onBack }) => {
  const [restaurantName, setRestaurantName] = useState("");
  const [branches, setBranches] = useState("");
  const [country, setCountry] = useState("Pakistan");
  const [city, setCity] = useState("Islamabad");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        restName: restaurantName,
        totalBranch: parseInt(branches, 10),
      };

      const response = await createResturantService(data);

      onNext({ ...response, country, city });
    } catch (err) {
      useAlertStore
        .getState()
        .showAlert(
          err.response?.data?.message ||
            err.message ||
            "Failed to create restaurant.",
        );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-card restaurant-info-card">
      {/* Progress Dots */}
      <div className="progress-dots">
        <span className="progress-dot active"></span>
        <span className="progress-dot"></span>
        <span className="progress-dot"></span>
      </div>

      <h1 className="signup-title restaurant-info-title">
        Your Restaurant Info
      </h1>

      {/* Restaurant Info Form */}
      <form
        className="signup-form restaurant-info-form"
        onSubmit={handleSubmit}
      >
        {/* Restaurant Name */}
        <div className="form-group">
          <label className="form-label">Restaurant Name</label>
          <input
            type="text"
            className="form-input"
            placeholder="Chaye Khana"
            value={restaurantName}
            onChange={(e) => setRestaurantName(e.target.value)}
            required
          />
        </div>

        {/* No of branches */}
        <div className="form-group">
          <label className="form-label">No of branches</label>
          <input
            type="number"
            className="form-input"
            placeholder="20"
            value={branches}
            onChange={(e) => setBranches(e.target.value)}
            required
            min="1"
          />
        </div>

        {/* Country Dropdown */}
        <div className="form-group">
          <label className="form-label">Country</label>
          <select
            className="form-input form-select"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            required
          >
            <option value="Pakistan">Pakistan</option>
            <option value="India">India</option>
            <option value="Bangladesh">Bangladesh</option>
            <option value="USA">USA</option>
            <option value="UK">UK</option>
          </select>
        </div>

        {/* City Dropdown */}
        <div className="form-group">
          <label className="form-label">City</label>
          <select
            className="form-input form-select"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
          >
            <option value="Islamabad">Islamabad</option>
            <option value="Karachi">Karachi</option>
            <option value="Lahore">Lahore</option>
            <option value="Rawalpindi">Rawalpindi</option>
            <option value="Faisalabad">Faisalabad</option>
          </select>
        </div>

        {/* Next Button */}
        <button
          type="submit"
          className="signup-btn restaurant-next-btn"
          disabled={loading}
        >
          {loading ? "Creating..." : "Next"}
        </button>
      </form>
    </div>
  );
};

export default ResturantInfo;
