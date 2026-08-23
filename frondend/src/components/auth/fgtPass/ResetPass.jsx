import React from "react";
import "../../../assets/css/auth/signup.css";
import { FaCheckCircle } from "react-icons/fa";

const ResetPass = ({ email }) => {
  return (
    <div className="reset-pass-confirmation">
      {/* Success Icon */}
      <div className="confirmation-icon">
        <FaCheckCircle />
      </div>

      {/* Title */}
      <h1 className="signup-title confirmation-title">Check your email</h1>

      {/* Message */}
      <p className="confirmation-message">
        We have sent a link to reset your password to:
      </p>

      {/* Email Display */}
      <p className="confirmation-email">{email}</p>

      {/* Additional Info */}
      <p className="confirmation-info">
        Didn't receive the email? Check your spam folder or{" "}
        <a href="/forget-pass" className="resend-link">
          try again
        </a>
      </p>

      {/* Back to Sign In Button */}
      <a href="/login" className="signup-btn confirmation-btn">
        Back to Sign In
      </a>
    </div>
  );
};

export default ResetPass;

