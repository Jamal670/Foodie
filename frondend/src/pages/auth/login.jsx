import React, { useState } from "react";
import "../../assets/css/auth/login.css";
import FoodieLogo from "../../components/common/FoodieLogo";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import AuthService from "../../services/auth.services";
import { useAlertStore } from "../../context/alertStore";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await AuthService.login(email, password);

      // Navigate based on onboarding status
      if (data.OnBoardingStatus === true) {
        navigate("/");
      } else {
        useAlertStore.getState().showAlert("Please complete your resturant info.");
        navigate("/signup?step=3");
      }
    } catch (err) {
      useAlertStore.getState().showAlert(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    console.log("Google sign in");
  };

  return (
    <div className="login-container">
      {/* Foodie Logo - Top Left */}
      <div className="login-logo">
        <FoodieLogo />
      </div>

      {/* Main Login Card */}
      <div className="login-card">
        <h1 className="login-title">Sign In</h1>

        {/* Social Sign-In Buttons */}
        <div className="social-buttons">
          <button
            type="button"
            className="social-btn google-btn"
            onClick={handleGoogleSignIn}
          >
            <FcGoogle className="social-icon" />
            <span>Sign in with Google</span>
          </button>
        </div>

        {/* Divider */}
        <div className="login-divider">
          <span className="divider-text">or with Email</span>
        </div>

        {/* Email/Password Form */}
        <form className="login-form" onSubmit={handleSubmit}>
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
          <div className="form-group">
            <input
              type="password"
              className="form-input"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Forgot Password Link */}
          <div className="forgot-password">
            <a href="/forget-pass" className="forgot-link">
              Forgot Password?
            </a>
          </div>

          {/* Sign In Button */}
          <button type="submit" className="signin-btn" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        {/* Sign Up Link */}
        <div className="signup-link">
          <span className="signup-text">Don't have an account yet? </span>
          <a href="/signup" className="signup-link-text">
            Sign up
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
