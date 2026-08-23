import api from "../api/axios";
import { ENDPOINTS_AUTH } from "../api/endpoints/Auth";

//------------------------------> signup <------------------------------
const AuthService = {
  signup: async (email, password, repeatPassword, acceptedTerms) => {
    // 1. Validation Logic
    if (password !== repeatPassword) {
      throw new Error("Passwords do not match!");
    }
    if (!acceptedTerms) {
      throw new Error("Please accept the terms!");
    }

    // 2. API Call
    try {
      const response = await api.post(ENDPOINTS_AUTH.SIGNUP, {
        email,
        password,
      });
      return response.data;
    } catch (err) {
      // Re-throw API errors cleanly
      const errorMessage = err.response?.data?.message;
      throw new Error(
        Array.isArray(errorMessage)
          ? errorMessage.join(", ")
          : errorMessage || "An error occurred during sign up.",
      );
    }
  },

  //------------------------------> verify email <------------------------------
  verifyEmail: async (token) => {
    try {
      const response = await api.get(ENDPOINTS_AUTH.VERIFY_EMAIL, {
        params: { token },
      });
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message;
      throw new Error(
        Array.isArray(errorMessage)
          ? errorMessage.join(", ")
          : errorMessage || "An error occurred during email verification.",
      );
    }
  },

  //------------------------------> resend verification email <------------------------------
  resendVerificationEmail: async (email) => {
    try {
      const response = await api.post(
        ENDPOINTS_AUTH.RESEND_VERIFICATION_EMAIL,
        {
          email,
        },
      );
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message;
      throw new Error(
        Array.isArray(errorMessage)
          ? errorMessage.join(", ")
          : errorMessage || "An error occurred during email verification.",
      );
    }
  },

  //------------------------------> login <------------------------------
  login: async (email, password) => {
    try {
      const response = await api.post(ENDPOINTS_AUTH.LOGIN, {
        email,
        password,
      });
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message;
      throw new Error(
        Array.isArray(errorMessage)
          ? errorMessage.join(", ")
          : errorMessage || "An error occurred during login.",
      );
    }
  },

  //------------------------------> forget password <------------------------------
  forgetPassword: async (email) => {
    try {
      const response = await api.post(ENDPOINTS_AUTH.FGT_PASSWORD, {
        email,
      });
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message;
      throw new Error(
        Array.isArray(errorMessage)
          ? errorMessage.join(", ")
          : errorMessage || "An error occurred during forget password.",
      );
    }
  },

  //------------------------------> reset password <------------------------------
  resetPassword: async (password, confirmPassword, token) => {
    try {
      const response = await api.post(ENDPOINTS_AUTH.RESET_PASSWORD, {
        password,
        confirmPassword,
        token,
      });
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message;
      throw new Error(
        Array.isArray(errorMessage)
          ? errorMessage.join(", ")
          : errorMessage || "An error occurred during reset password.",
      );
    }
  },
};

export default AuthService;
