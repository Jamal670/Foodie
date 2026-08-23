import React, { useState } from "react";
import "../../../assets/css/auth/signup.css";

const ForgetEmailForm = ({ onSubmit }) => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Pass email to parent component
    onSubmit(email);
  };

  return (
    <div className="forget-email-form-wrapper">
      <h1 className="signup-title forget-email-title">Forget Password</h1>

      {/* Subtitle */}
      <p className="forget-email-subtitle">
        Enter your email address and we'll send you a link to reset your password.
      </p>

      {/* Email Form */}
      <form className="signup-form forget-email-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="email"
            className="form-input"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* Submit Button */}
        <button type="submit" className="signup-btn forget-email-btn">
          Send Reset Link
        </button>
      </form>

      {/* Back to Sign In Link */}
      <div className="signin-link forget-back-link">
        <a href="/login" className="signin-link-text">
          Back to Sign In
        </a>
      </div>
    </div>
  );
};

export default ForgetEmailForm;

