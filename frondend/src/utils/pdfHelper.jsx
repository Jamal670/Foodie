import React from "react";
import {
  pdf,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
  },
  card: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 16,
    padding: 40,
    width: 320,
    backgroundColor: "#ffffff",
  },
  logoContainer: {
    marginBottom: 20,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    backgroundColor: "#9146d8",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 12,
    textAlign: "center",
  },
  instructions: {
    fontSize: 12,
    color: "#4b5563",
    textAlign: "center",
    marginBottom: 24,
    width: 220,
    lineHeight: 1.4,
  },
  qrContainer: {
    width: 180,
    height: 180,
    marginBottom: 24,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  qrImage: {
    width: "100%",
    height: "100%",
  },
  footerText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
    textAlign: "center",
  },
});

const QrCodePdfDocument = ({ qrImage, title }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.card}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>Foodie</Text>
        </View>
        <Text style={styles.instructions}>
          Scan the QR Code below to access your digital menu
        </Text>
        <View style={styles.qrContainer}>
          <Image src={qrImage} style={styles.qrImage} />
        </View>
        <Text style={styles.footerText}>{title}</Text>
      </View>
    </Page>
  </Document>
);

export const downloadQRCodePdf = async (qrImage, title, filename) => {
  try {
    if (!qrImage) {
      throw new Error("Invalid or empty QR Code image data");
    }

    const doc = <QrCodePdfDocument qrImage={qrImage} title={title} />;
    const blob = await pdf(doc).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to download PDF:", error);
    alert("Could not generate PDF. Please try again.");
  }
};
