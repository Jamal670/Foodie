import React from "react";

const Confirm = ({
  show,
  onClose,
  title,
  message,
  confirmLabel = "Delete",
}) => {
  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
        animation: "fadeIn 0.2s ease-out",
      }}
      onClick={() => onClose(false)}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
      <div
        style={{
          backgroundColor: "#ffffff",
          width: "90%",
          maxWidth: "400px",
          borderRadius: "16px",
          padding: "24px",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
          animation: "slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <h3
          style={{
            margin: 0,
            fontSize: "20px",
            fontWeight: "600",
            color: "#1e1e1e",
          }}
        >
          {title || "Confirm Action"}
        </h3>

        {/* Message */}
        <p
          style={{
            margin: 0,
            fontSize: "15px",
            color: "#6b7280",
            lineHeight: "1.5",
            textAlign: "center",
          }}
        >
          {message || "Are you sure you want to proceed?"}
        </p>

        {/* Action Buttons */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
            marginTop: "8px",
          }}
        >
          <button
            style={{
              padding: "10px 18px",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              backgroundColor: "#ffffff",
              color: "#374151",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              transition: "background-color 0.2s",
            }}
            onClick={() => onClose(false)}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#f9fafb")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#ffffff")
            }
          >
            Cancel
          </button>
          <button
            style={{
              padding: "10px 18px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: "#ef4444",
              color: "#ffffff",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              transition: "background-color 0.2s",
            }}
            onClick={() => onClose(true)}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#dc2626")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#ef4444")
            }
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Confirm;
