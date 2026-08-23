import React, { useState } from "react";

const QRCodeDialog = ({ show, onClose, onConfirm }) => {
  const [tableCount, setTableCount] = useState();

  if (!show) return null;

  const handleGenerate = () => {
    const count = parseInt(tableCount, 10);
    if (count >= 1 && count <= 50) {
      onConfirm(count);
    }
  };

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
        boxSizing: "border-box",
      }}
      onClick={onClose}
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
          gap: "10px",
          color: "#1e1e1e",
          textAlign: "center",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
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
              padding: "4px 8px",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              backgroundColor: "#ffffff",
              color: "#374151",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              transition: "background-color 0.2s",
            }}
            onClick={onClose}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#f9fafb")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#ffffff")
            }
          >
            X
          </button>
        </div>
        <h3
          style={{
            margin: 0,
            fontSize: "20px",
            fontWeight: "600",
            color: "#1e1e1e",
            textAlign: "center",
          }}
        >
          Generate QR Codes
        </h3>

        {/* Message / Description */}
        <p
          style={{
            margin: 0,
            fontSize: "14px",
            color: "#6b7280",
            lineHeight: "1.5",  
            textAlign: "center",
          }}
        >
          How many tables would you like to generate QR codes for?
        </p>

        {/* Numeric Input */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            textAlign: "left",
          }}
        >
          <label
            style={{
              fontSize: "13px",
              fontWeight: "600",
              color: "#374151",
            }}
          >
            Number of Tables
          </label>
          <input
            type="number"
            min="1"
            max="50"
            value={tableCount}
            onChange={(e) => setTableCount(e.target.value)}
            placeholder="3"
            style={{
              padding: "10px 12px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              fontSize: "14px",
              outline: "none",
              width: "100%",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "12px",
            marginTop: "8px",
          }}
        >
          <button
            style={{
              padding: "10px 18px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: "#6a0dad",
              color: "#ffffff",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              transition: "background-color 0.2s",
              flex: 1,
            }}  
            onClick={handleGenerate}
            disabled={
              !tableCount ||
              parseInt(tableCount, 10) < 1 ||
              parseInt(tableCount, 10) > 50
            }
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#9146d8")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#6a0dad")
            }
          >
            Generate QR Codes
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRCodeDialog;
