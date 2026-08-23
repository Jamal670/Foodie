import React, { useState } from "react";
import "../../assets/css/auth/signup.css";
import "../../assets/css/auth/ForgetPass.css";
import FoodieLogo from "../../components/common/FoodieLogo";
import ForgetEmailForm from "../../components/auth/fgtPass/ForgetEmailForm";
import ResetPass from "../../components/auth/fgtPass/ResetPass";
import AuthService from "../../services/auth.services";
import { useAlertStore } from "../../context/alertStore";

const ForgetPass = () => {
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const alertStore = useAlertStore();

  const handleEmailSubmit = async (email) => {
    try {
      console.log("Password reset requested for:", email);

      const response = await AuthService.forgetPassword(email);
      alertStore.showAlert(response.message || "Reset link sent successfully!");

      // Store the email and show confirmation
      setSubmittedEmail(email);
      setEmailSubmitted(true);
    } catch (error) {
      console.error("Forgot password error:", error);
      alertStore.showAlert(error.message || "Failed to send reset link.");
    }
  };

  return (
    <div className="signup-container">
      {/* Foodie Logo - Top Left */}
      <div className="signup-logo">
        <FoodieLogo />
      </div>

      {/* Forget Password Card */}
      <div className="signup-card forget-pass-card">
        {/* Show email form or confirmation based on state */}
        {!emailSubmitted ? (
          <ForgetEmailForm onSubmit={handleEmailSubmit} />
        ) : (
          <ResetPass email={submittedEmail} />
        )}
      </div>
    </div>
  );
};

export default ForgetPass;
