import React, { useState } from "react";
import "../../../assets/css/auth/signup.css";
import { FcGoogle } from "react-icons/fc";
import AuthService from "../../../services/auth.services";
import { useAlertStore } from "../../../context/alertStore";

const SignupLayout = ({ onSignupComplete }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  // Password strength calculation
  const calculatePasswordStrength = (pwd) => {
    let strength = 0;

    if (pwd.length >= 8) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) strength++;

    return strength;
  };

  const passwordStrength = calculatePasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Pass all fields to the service layer for validation and execution
      const data = await AuthService.signup(
        email,
        password,
        repeatPassword,
        acceptedTerms,
      );
      console.log("Signup successful", data);
      onSignupComplete({ email, password });
    } catch (err) {
      console.error("Signup failed:", err);
      // Use global Zustand alert layout
      useAlertStore.getState().showAlert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    // Handle Google sign in
    console.log("Google sign in");
  };

  return (
    <div className="signup-card">
      <h1 className="signup-title">Sign Up</h1>

      {/* Social Sign-In Buttons - Horizontal */}
      <div className="social-buttons-horizontal"> 
        <button
          type="button"
          className="social-btn google-btn"
          onClick={handleGoogleSignIn}
        >
          <FcGoogle className="social-icon" />
          <span>Sign up with Google</span>
        </button>
      </div>

      {/* Divider */}
      <div className="signup-divider">
        <span className="divider-text">or with Email</span>
      </div>

      {/* Email/Password Form */}
      <form className="signup-form" onSubmit={handleSubmit}>
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

          {/* Password Strength Indicator */}
          {password && (
            <div className="password-strength">
              <div className="password-strength-label">Password Strength</div>
              <div className="password-strength-bars">
                <div
                  className={`strength-bar ${
                    passwordStrength >= 1 ? "active" : ""
                  }`}
                ></div>
                <div
                  className={`strength-bar ${
                    passwordStrength >= 2 ? "active" : ""
                  }`}
                ></div>
                <div
                  className={`strength-bar ${
                    passwordStrength >= 3 ? "active" : ""
                  }`}
                ></div>
                <div
                  className={`strength-bar ${
                    passwordStrength >= 4 ? "active" : ""
                  }`}
                ></div>
              </div>
            </div>
          )}

          {/* Password Hint */}
          <div className="password-hint">
            Use 8 or more characters with a mix of letter, symbols and numbers
          </div>
        </div>

        <div className="form-group">
          <input
            type="password"
            className="form-input"
            placeholder="Repeat Password"
            value={repeatPassword}
            onChange={(e) => setRepeatPassword(e.target.value)}
            required
          />
        </div>

        {/* Terms Checkbox */}
        <div className="terms-checkbox">
          <input
            type="checkbox"
            id="terms"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            required
          />
          <label htmlFor="terms" className="terms-label">
            I accept the the{" "}
            <a href="/terms-and-conditions" className="terms-link">
              terms and conditions
            </a>
          </label>
        </div>

        {/* Sign Up Button */}
        <button type="submit" className="signup-btn" disabled={loading}>
          {loading ? "Signing Up..." : "Sign Up"}
        </button>
      </form>

      {/* Sign In Link */}
      <div className="signin-link">
        <span className="signin-text">Already have an account? </span>
        <a href="/login" className="signin-link-text">
          Sign in
        </a>
      </div>
    </div>
  );
};

export default SignupLayout;
