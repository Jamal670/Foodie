import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "../../assets/css/auth/signup.css";
import FoodieLogo from "../../components/common/FoodieLogo";
import SignupLayout from "../../components/auth/signup/SignupLayout";
import ResturantInfo from "../../components/auth/signup/ResturantInfo";
import ContantInfo from "../../components/auth/signup/ContantInfo";
import MenuOption from "../../components/auth/signup/MenuOption";
import AuthService from "../../services/auth.services";
import { useAlertStore } from "../../context/alertStore";

const Signup = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const stepParam = parseInt(searchParams.get("step") || "1", 10);
  const currentStep = isNaN(stepParam) ? 1 : stepParam;

  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [hasResent, setHasResent] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    let interval;
    if (currentStep === 2 && resendTimer > 0 && !canResend && !hasResent) {
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentStep, resendTimer, canResend, hasResent]);

  const handleResendVerification = async () => {
    if (!canResend || hasResent || isResending) return;

    setIsResending(true);
    try {
      await AuthService.resendVerificationEmail(signupData.email);
      setHasResent(true);
      setCanResend(false);
      useAlertStore
        .getState()
        .showAlert("Verification email resent successfully!");
    } catch (error) {
      useAlertStore
        .getState()
        .showAlert(error.message || "Failed to resend email.");
    } finally {
      setIsResending(false);
    }
  };

  const getSafeStorage = (key) => {
    const saved = localStorage.getItem(key);
    if (!saved || saved === "undefined" || saved === "null") return {};
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error(`Error parsing localStorage key "${key}":`, e);
      return {};
    }
  };

  const [signupData, setSignupData] = useState(() =>
    getSafeStorage("signupData"),
  );
  const [restaurantData, setRestaurantData] = useState(() =>
    getSafeStorage("restaurantData"),
  );
  const [contactData, setContactData] = useState(() =>
    getSafeStorage("contactData"),
  );
  const [menuData, setMenuData] = useState(() => getSafeStorage("menuData"));

  useEffect(() => {
    localStorage.setItem("signupData", JSON.stringify(signupData));
  }, [signupData]);

  useEffect(() => {
    localStorage.setItem("restaurantData", JSON.stringify(restaurantData));
  }, [restaurantData]);

  useEffect(() => {
    localStorage.setItem("contactData", JSON.stringify(contactData));
  }, [contactData]);

  useEffect(() => {
    localStorage.setItem("menuData", JSON.stringify(menuData));
  }, [menuData]);

  useEffect(() => {
    if (currentStep > 1 && (!signupData || !signupData.email)) {
      navigate("/signup?step=1", { replace: true });
    } else if (currentStep > 3 && Object.keys(restaurantData).length === 0) {
      navigate("/signup?step=3", { replace: true });
    } else if (currentStep > 4 && Object.keys(contactData).length === 0) {
      navigate("/signup?step=4", { replace: true });
    } else if (currentStep > 5 && Object.keys(menuData).length === 0) {
      navigate("/signup?step=5", { replace: true });
    }
  }, [
    currentStep,
    signupData,
    restaurantData,
    contactData,
    menuData,
    navigate,
  ]);

  const handleSignupComplete = (data) => {
    setSignupData(data);
    navigate("/signup?step=2");
  };

  const handleRestaurantNext = (data) => {
    setRestaurantData(data);
    navigate("/signup?step=4");
  };

  const handleContactNext = (data) => {
    setContactData(data);
    navigate("/signup?step=5");
  };

  const handleMenuFinish = (data) => {
    setMenuData(data);
    const allData = {
      ...signupData,
      ...restaurantData,
      ...contactData,
      ...data,
    };
    console.log("All signup data collected:", allData);

    // Clear localStorage after completion
    localStorage.removeItem("signupData");
    localStorage.removeItem("restaurantData");
    localStorage.removeItem("contactData");
    localStorage.removeItem("menuData");
  };

  const handleBack = () => {
    if (currentStep > 1) {
      navigate(`/signup?step=${currentStep - 1}`);
    }
  };

  return (
    <div className="signup-container">
      {/* Foodie Logo - Top Left */}
      <div className="signup-logo">
        <FoodieLogo />
      </div>

      {/* Conditional Rendering Based on Step */}
      {currentStep === 1 && (
        <SignupLayout onSignupComplete={handleSignupComplete} />
      )}

      {currentStep === 2 && (
        <div className="signup-card">
          <h1 className="signup-title">Verify Your Email</h1>
          <div
            style={{
              textAlign: "center",
              marginTop: "20px",
              marginBottom: "30px",
            }}
          >
            <div style={{ fontSize: "48px", marginBottom: "20px" }}>✉️</div>
            <p
              style={{ color: "#666", marginBottom: "15px", lineHeight: "1.5" }}
            >
              We've sent a verification email to:
              <br />
              <strong>{signupData.email}</strong>
            </p>
            <p style={{ color: "#666", fontSize: "14px", lineHeight: "1.5" }}>
              Please check your inbox and click the verification link to
              activate your account. Once verified, click the button below to
              continue setting up your restaurant profile.
            </p>
          </div>

          <div className="signin-link" style={{ marginTop: "20px" }}>
            <span className="signin-text">Didn't receive an email? </span>
            {hasResent ? (
              <span
                className="signin-link-text"
                style={{ color: "#999", cursor: "not-allowed" }}
              >
                Email Resent
              </span>
            ) : !canResend ? (
              <span
                className="signin-link-text"
                style={{ color: "#666", cursor: "default" }}
              >
                Resend in {resendTimer}s
              </span>
            ) : (
              <button
                type="button"
                className="signin-link-text"
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: isResending ? "not-allowed" : "pointer",
                  opacity: isResending ? 0.7 : 1,
                }}
                disabled={isResending}
                onClick={handleResendVerification}
              >
                {isResending ? "Resending..." : "Click to resend"}
              </button>
            )}
          </div>
        </div>
      )}

      {currentStep === 3 && (
        <ResturantInfo onNext={handleRestaurantNext} onBack={handleBack} />
      )}

      {currentStep === 4 && (
        <ContantInfo
          onNext={handleContactNext}
          onBack={handleBack}
          restaurantData={restaurantData}
        />
      )}

      {currentStep === 5 && (
        <MenuOption onFinish={handleMenuFinish} onBack={handleBack} />
      )}

      {currentStep === 6 && (
        <div className="signup-card">
          <h1 className="signup-title">Registration Complete!</h1>
          <p style={{ textAlign: "center", color: "#666", marginTop: "20px" }}>
            Thank you for signing up. Your account has been created
            successfully.
          </p>
        </div>
      )}
    </div>
  );
};

export default Signup;
