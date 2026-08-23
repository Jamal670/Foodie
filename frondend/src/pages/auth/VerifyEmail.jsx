import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import AuthService from "../../services/auth.services";
import "../../assets/css/auth/signup.css";
import FoodieLogo from "../../components/common/FoodieLogo";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) return;

    const verify = async () => {
      try {
        const result = await AuthService.verifyEmail(token);
        console.log(result);
        navigate("/signup?step=3");
      } catch (error) {
        alert(error.message);
        navigate("/signup");
      }
    };

    verify();
  }, [searchParams, navigate]);

  return (
    <div className="signup-container">
      <div className="signup-logo">
        <FoodieLogo />
      </div>
      <div
        className="signup-card"
        style={{ textAlign: "center", margin: "auto" }}
      >
        <h2 className="signup-title" style={{ margin: "40px 0" }}>
          Verifying your email...
        </h2>
      </div>
    </div>
  );
};

export default VerifyEmail;
