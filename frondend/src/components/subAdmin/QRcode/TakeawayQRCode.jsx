import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import { Button, Spinner } from "react-bootstrap";
import { LuDownload } from "react-icons/lu";
import {
  getAllQrCodes,
  createTakeawayQrCode,
  deleteTableQr,
} from "../../../services/subAdmin/QR-Code/QRCode.service";
import { downloadQRCodePdf } from "../../../utils/pdfHelper";
import { useAlertStore } from "../../../context/alertStore";
import Confirm from "../../models/Confirm.jsx";
import { LiaQrcodeSolid } from "react-icons/lia";
import { RxCross2 } from "react-icons/rx";


function TakeawayQRCode() {
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [qrImage, setQrImage] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);

  const fetchTakeawayCode = async () => {
    setLoading(true);
    try {
      const data = await getAllQrCodes();
      const takeaway = data.find((qr) => qr.qrType === "TAKEAWAY");
      setQrCode(takeaway || null);
    } catch (err) {
      useAlertStore
        .getState()
        .showAlert(err.message || "Failed to load QR codes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTakeawayCode();
  }, []);

  useEffect(() => {
    const generateQr = async () => {
      if (qrCode) {
        try {
          const frontendUrl = import.meta.env.VITE_API_URL;
          const qrUrl = `${frontendUrl}/customer/menu/t/${qrCode.qrToken}`;
          const dataUrl = await QRCode.toDataURL(qrUrl, {
            width: 256,
            margin: 1,
          });
          setQrImage(dataUrl);
        } catch (err) {
          console.error("Failed to generate Takeaway QR:", err);
        }
      } else {
        setQrImage("");
      }
    };
    generateQr();
  }, [qrCode]);

  const handleConfirmDelete = async (confirmed) => {
    if (!confirmed || !pendingDelete) {
      setPendingDelete(null);
      return;
    }
    const targetId = pendingDelete.id;
    setPendingDelete(null);
    setLoading(true);
    try {
      const res = await deleteTableQr(targetId);
      if (res?.success) {
        useAlertStore
          .getState()
          .showAlert(res.message || "Takeaway QR Code deleted successfully.");
        await fetchTakeawayCode();
      }
    } catch (err) {
      useAlertStore
        .getState()
        .showAlert(err.message || "Failed to delete Takeaway QR Code.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await createTakeawayQrCode();
      if (res?.success) {
        useAlertStore
          .getState()
          .showAlert(res.message || "Takeaway QR Code generated successfully.");
        await fetchTakeawayCode();
      }
    } catch (err) {
      useAlertStore
        .getState()
        .showAlert(err.message || "Failed to generate takeaway QR code.");
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = () => {
    if (qrImage) {
      downloadQRCodePdf(qrImage, "Takeaway", "takeaway.pdf");
    } else {
      useAlertStore
        .getState()
        .showAlert("QR Code image is still generating. Please try again.");
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
        Loading QR codes...
      </div>
    );
  }

  if (generating) {
    return (
      <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
        Generating takeaway QR code...
      </div>
    );
  }

  if (!qrCode) {
    return (
      <div className="empty-categories-containers">
        <p className="empty-categories-message">
          Generate QR Code for takeaway orders
        </p>
        <Button
          onClick={handleGenerate}
          disabled={generating}
          className="add-category-btn-matchs"
        >
          Generate QR Code <LiaQrcodeSolid />
        </Button>
      </div>
    );
  }

  return (
    <div className="d-flex justify-content-center py-4">
      <div
        className="card border-0 rounded-4 shadow-sm p-4 text-center d-flex flex-column align-items-center"
        style={{ width: "100%", maxWidth: "520px" }}
      >
        <div className="d-flex justify-content-between align-items-center w-100">
          <p></p>
          <p className="fw-bold mb-3 text-secondary">Takeaway QR Code</p>
          <p
            className="text-danger"
            style={{ cursor: "pointer" }}
            onClick={() => setPendingDelete(qrCode)}
          >
            <RxCross2 />
          </p>
        </div>

        <div
          className="bg-light p-4 rounded-4 mb-2 d-flex align-items-center justify-content-center"
          style={{ width: "220px", height: "220px" }}
        >
          {qrImage ? (
            <img
              src={qrImage}
              alt="Takeaway QR"
              style={{
                height: "auto",
                maxWidth: "100%",
                width: "100%",
                objectFit: "contain",
              }}
            />
          ) : (
            <Spinner size="sm" />
          )}
        </div>

        <p className="small text-muted mb-4 px-2">
          Customers scanning this QR code will be placed directly in the
          takeaway ordering flow.
        </p>

        <Button
          onClick={handleDownload}
          className="qr-download-button w-100 py-2"
        >
          Download QR Code <LuDownload />
        </Button>
      </div>

      <Confirm
        show={Boolean(pendingDelete)}
        onClose={handleConfirmDelete}
        title="Confirm Deletion"
        message="Are you sure you want to delete this QR Code?"
        confirmLabel="Delete"
      />
    </div>
  );
}

export default TakeawayQRCode;
