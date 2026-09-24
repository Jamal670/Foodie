import React, { useState } from "react";
import "../../assets/css/auth/login.css";
import FoodieLogo from "../../components/common/FoodieLogo";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import AuthService from "../../services/auth.services";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { setUser } = useAuth();

  // Note: For future 'currentUser' query caching, set staleTime: 15 * 60 * 1000 (15 min) on that query.
  const loginMutation = useMutation({
    mutationFn: (credentials) => AuthService.login(credentials.email, credentials.password),
    onSuccess: (data) => {
      // Store user and permissions in localStorage and AuthContext
      try {
        localStorage.setItem("user", JSON.stringify(data));
        if (data?.permission) {
          localStorage.setItem("permissions", JSON.stringify(data.permission));
        }
        if (setUser) {
          setUser(data);
        }
      } catch (e) {
        console.error("Error saving login data to storage:", e);
      }

      // Navigate based on onboarding status and system role
      if (data.OnBoardingStatus === true) {
        const roleName = data.role?.role_name;
        const isSystemRole = data.role?.is_system_role;

        const systemRoles = ["waiter", "pos operator"];
        if (
          isSystemRole === true &&
          roleName &&
          systemRoles.includes(roleName.trim().toLowerCase())
        ) {
          navigate("/waiter/order-menu");
        } else {
          navigate("/");
        }
      } else {
        useAlertStore.getState().showAlert("Please complete your resturant info.");
        navigate("/signup?step=3");
      }
    },
    onError: (err) => {
      useAlertStore.getState().showAlert(err.message || "Login failed.");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
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
          <button
            type="submit"
            className="signin-btn"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? "Signing In..." : "Sign In"}
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
