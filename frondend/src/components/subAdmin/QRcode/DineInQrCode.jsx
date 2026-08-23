import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import { Button, Form, Spinner } from "react-bootstrap";
import { LuDownload } from "react-icons/lu";
import {
  getAllQrCodes,
  createDineInQrCodes,
  createOneMoreTable,
  deleteTableQr,
} from "../../../services/subAdmin/QR-Code/QRCode.service";
import { downloadQRCodePdf } from "../../../utils/pdfHelper";
import { useAlertStore } from "../../../context/alertStore";
import QRCodeDialog from "../../models/QRcode.dialog.jsx";
import Confirm from "../../models/Confirm.jsx";
import { LiaQrcodeSolid } from "react-icons/lia";
import { RxCross2 } from "react-icons/rx";

function DineInQrCode() {
  const [tableCount, setTableCount] = useState(5);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [qrCodes, setQrCodes] = useState([]);
  const [qrImages, setQrImages] = useState({});
  const [openDineInDialog, setOpenDineInDialog] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

  const fetchQrCodes = async () => {
    setLoading(true);
    try {
      const data = await getAllQrCodes();
      const dineIn = data.filter((qr) => qr.qrType === "DINE_IN");
      setQrCodes(dineIn);
    } catch (err) {
      useAlertStore
        .getState()
        .showAlert(err.message || "Failed to load QR codes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQrCodes();
  }, []);

  useEffect(() => {
    const generateQrs = async () => {
      const newImages = { ...qrImages };
      let updated = false;
      for (const qr of qrCodes) {
        if (!newImages[qr.qrToken]) {
          try {
            const frontendUrl = import.meta.env.VITE_API_URL;
            const qrUrl = `${frontendUrl}/customer/menu/t/${qr.qrToken}`;
            const dataUrl = await QRCode.toDataURL(qrUrl, {
              width: 256,
              margin: 1,
            });
            newImages[qr.qrToken] = dataUrl;
            updated = true;
          } catch (err) {
            console.error("Failed to generate QR for token:", qr.qrToken, err);
          }
        }
      }
      if (updated) {
        setQrImages(newImages);
      }
    };

    if (qrCodes.length > 0) {
      generateQrs();
    }
  }, [qrCodes]);

  const generateTables = async (count) => {
    setGenerating(true);
    try {
      const res = await createDineInQrCodes(count);
      if (res?.success) {
        useAlertStore
          .getState()
          .showAlert(res.message || "Tables QR Codes generated successfully.");
        await fetchQrCodes();
      }
    } catch (err) {
      useAlertStore
        .getState()
        .showAlert(err.message || "Failed to generate tables QR codes.");
    } finally {
      setGenerating(false);
    }
  };

  const handleAddOneMoreTable = async (e) => {
    if (e) e.preventDefault();
    setGenerating(true);
    try {
      const res = await createOneMoreTable();
      if (res?.success) {
        useAlertStore
          .getState()
          .showAlert(
            res.message || "New table QR code generated successfully.",
          );
        await fetchQrCodes();
      }
    } catch (err) {
      useAlertStore
        .getState()
        .showAlert(err.message || "Failed to add one more table.");
    } finally {
      setGenerating(false);
    }
  };

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
          .showAlert(res.message || "QR Code deleted successfully.");
        await fetchQrCodes();
      }
    } catch (err) {
      useAlertStore
        .getState()
        .showAlert(err.message || "Failed to delete QR code.");
    } finally {
      setLoading(false);
    }
  };

  const handleDineInConfirm = (count) => {
    setOpenDineInDialog(false);
    generateTables(count);
  };

  const handleDownload = (qrToken, tableNumber) => {
    const imgData = qrImages[qrToken];
    if (imgData) {
      downloadQRCodePdf(
        imgData,
        `Table ${tableNumber}`,
        `dinein-table-${tableNumber}.pdf`,
      );
    } else {
      useAlertStore
        .getState()
        .showAlert(
          "QR Code image is still generating. Please try again in a moment.",
        );
    }
  };

  const sortedQrCodes = [...qrCodes].sort(
    (a, b) => a.tableNumber - b.tableNumber,
  );

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
        Generating table QR codes...
      </div>
    );
  }

  if (qrCodes.length === 0) {
    return (
      <div className="empty-categories-containers">
        <p className="empty-categories-message">
          Generate QR Code for dine-in tables
        </p>
        <button
          onClick={() => setOpenDineInDialog(true)}
          className="add-category-btn-matchs"
        >
          Generate QR Codes <LiaQrcodeSolid />
        </button>

        <QRCodeDialog
          show={openDineInDialog}
          onClose={() => setOpenDineInDialog(false)}
          onConfirm={handleDineInConfirm}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-end">
        <Form
          onSubmit={handleAddOneMoreTable}
          className="d-flex align-items-end gap-2 mb-2"
        >
          <Button
            type="submit"
            disabled={generating}
            size="sm"
            className="add-table-btn"
          >
            {generating ? <Spinner size="sm" /> : "Add More Tables"}
          </Button>
        </Form>
      </div>

      <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
        {sortedQrCodes.map((qr) => {
          return (
            <div className="col" key={qr.id}>
              <div className="card h-100 border-0 rounded-4 shadow-sm p-4 text-center d-flex flex-column align-items-center">
                <div className="d-flex justify-content-between align-items-center w-100">
                  <p></p>
                  <p className="fw-bold mb-3 text-secondary">
                    Table {qr.tableNumber}
                  </p>
                  <p
                    className="text-danger"
                    style={{ cursor: "pointer" }}
                    onClick={() => setPendingDelete(qr)}
                  >
                    <RxCross2 />
                  </p>
                </div>

                <div
                  className="bg-light p-3 rounded-4 mb-2 d-flex align-items-center justify-content-center"
                  style={{ width: "160px", height: "160px" }}
                >
                  {qrImages[qr.qrToken] ? (
                    <img
                      src={qrImages[qr.qrToken]}
                      alt={`Table ${qr.tableNumber} QR`}
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
                <div
                  className="mb-4 text-secondary"
                  style={{ fontSize: "0.8rem" }}
                >
                  Scan the Qr Code to access your digital menu, Or Download the
                  Qr Code and Get it printed on your tables
                </div>

                <Button
                  onClick={() => handleDownload(qr.qrToken, qr.tableNumber)}
                  className="qr-download-button w-100"
                >
                  Download QR Code <LuDownload />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <QRCodeDialog
        show={openDineInDialog}
        onClose={() => setOpenDineInDialog(false)}
        onConfirm={handleDineInConfirm}
      />

      <Confirm
        show={Boolean(pendingDelete)}
        onClose={handleConfirmDelete}
        title="Confirm Deletion"
        message={
          pendingDelete
            ? `Are you sure you want to delete the QR code for Table ${pendingDelete.tableNumber}?`
            : ""
        }
        confirmLabel="Delete"
      />
    </div>
  );
}

export default DineInQrCode;
