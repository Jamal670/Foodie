import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "../../../assets/css/auth/signup.css";
import FoodieLogo from "../../common/FoodieLogo";
import AuthService from "../../../services/auth.services";
import { useAlertStore } from "../../../context/alertStore";

const CreateNewFgtPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const alertStore = useAlertStore();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const token = searchParams.get("token");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Validation: Ensure token exists
    if (!token) {
      alertStore.showAlert("Invalid or missing reset token.");
      return;
    }

    // 2. Validation: Passwords must match
    if (password !== confirmPassword) {
      alertStore.showAlert("Passwords do not match.");
      return;
    }

    // 3. Validation: Minimum length (as per backend but good to have here too)
    if (password.length < 8) {
      alertStore.showAlert("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    try {
      const response = await AuthService.resetPassword(
        password,
        confirmPassword,
        token,
      );
      alertStore.showAlert(response.message || "Password reset successfully!");

      // Success redirection
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error("Reset password error:", error);
      alertStore.showAlert(error.message || "Failed to reset password.");
    } finally {
      setLoading(true); // Keep loading true during redirection or reset it if stay on page
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      {/* Foodie Logo - Top Left */}
      <div className="signup-logo">
        <FoodieLogo />
      </div>

      <div className="signup-card forget-pass-card">
        <div className="forget-email-form-wrapper">
          <h1 className="signup-title forget-email-title">
            Create New <span className="highlight-text">Password</span>
          </h1>
          <p className="forget-email-subtitle">
            Enter your new password below.
          </p>

          <form className="signup-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="password"
                className="form-input"
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>

            <div className="form-group">
              <input
                type="password"
                className="form-input"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>

            <button type="submit" className="signup-btn" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>

          <div className="signin-link forget-back-link">
            <a href="/login" className="signin-link-text">
              Back to Sign In
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateNewFgtPassword;
