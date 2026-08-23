import React from "react";
import "../../assets/css/common/FoodieLogo.css";

const FoodieLogo = ({ className = "", variant = "default" }) => {
  const variantClass = variant === "text" ? "text-variant" : "";
  return (
    <div className={`foodie-logo ${variantClass} ${className}`}>Foodie</div>
  );
};

export default FoodieLogo;
