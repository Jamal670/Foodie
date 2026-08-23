import { useEffect } from "react";
import { useAlertStore } from "../../context/alertStore";

const Alert = () => {
  const { message, visible } = useAlertStore();

  useEffect(() => {
    console.log("Alert Component Rendered:", {
      visible,
      message,
    });
  }, [visible, message]);

  return (
    <div
      style={{
        position: "fixed",
        top: visible ? "20px" : "-100px",
        left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: "#f8f8f8",
        color: "#5b5b5b",
        padding: "16px 24px",
        borderRadius: "10px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        border: "1px solid #e5e5e5",
        transition: "top 0.5s ease-in-out",
        zIndex: 9999,
        fontWeight: "500",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: visible ? "auto" : "none",
        minWidth: "300px",
      }}
    >
      {message}
    </div>
  );
};

export default Alert;