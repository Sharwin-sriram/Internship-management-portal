import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generatePDF = async (content, fileName) => {
  return new Promise((resolve, reject) => {
    try {
      const uploadDir = path.join(__dirname, "../../uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filePath = path.join(uploadDir, fileName);
      const pdfDoc = new PDFDocument();
      const writeStream = fs.createWriteStream(filePath);

      pdfDoc.pipe(writeStream);

      // Parse HTML-like content (simple version - remove tags)
      const plainText = content.replace(/<[^>]*>/g, "");

      pdfDoc.fontSize(11).text(plainText, {
        align: "left",
        width: 500,
        wrap: true,
      });

      pdfDoc.end();

      writeStream.on("finish", () => {
        resolve(`/uploads/${fileName}`);
      });

      writeStream.on("error", (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
};

export const generateOfferLetterPDF = async (offerData) => {
  return new Promise((resolve, reject) => {
    try {
      const uploadDir = path.join(__dirname, "../../uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const fileName = `offer-letter-${offerData.application}_${Date.now()}.pdf`;
      const filePath = path.join(uploadDir, fileName);
      const pdfDoc = new PDFDocument();
      const writeStream = fs.createWriteStream(filePath);

      pdfDoc.pipe(writeStream);

      // Header
      pdfDoc
        .fontSize(20)
        .text("OFFER LETTER", { align: "center" })
        .moveDown(0.5);

      // Company name
      pdfDoc
        .fontSize(12)
        .text(`${offerData.companyName}`, { align: "center" })
        .moveDown(1);

      // Date
      pdfDoc
        .fontSize(10)
        .text(`Date: ${new Date().toLocaleDateString()}`)
        .moveDown(1);

      // Student details
      pdfDoc.text(`To,`).text(`${offerData.studentName}`).moveDown(0.5);

      // Body
      pdfDoc
        .fontSize(11)
        .text("Dear " + offerData.studentName + ",", { align: "left" })
        .moveDown(0.5);

      pdfDoc.text(
        "We are pleased to offer you a position for the internship program at " +
          offerData.companyName +
          ".",
      );
      pdfDoc.moveDown(0.5);

      // Details
      pdfDoc
        .fontSize(10)
        .text(`Position: ${offerData.position}`)
        .text(`Duration: ${offerData.duration} weeks`)
        .text(`Location: ${offerData.location}`)
        .text(`Stipend: ₹${offerData.salary} per month`)
        .text(
          `Start Date: ${new Date(offerData.startDate).toLocaleDateString()}`,
        )
        .moveDown(0.5);

      // Responsibilities
      pdfDoc.text("Key Responsibilities:", { underline: true }).moveDown(0.3);
      offerData.responsibilities.forEach((resp) => {
        pdfDoc.text(`• ${resp}`);
      });
      pdfDoc.moveDown(0.5);

      // Benefits
      pdfDoc.text("Benefits:", { underline: true }).moveDown(0.3);
      offerData.benefits.forEach((benefit) => {
        pdfDoc.text(`• ${benefit}`);
      });
      pdfDoc.moveDown(1);

      // Closing
      pdfDoc.text(
        "Please confirm your acceptance of this offer by signing and returning this letter within 5 business days.",
      );
      pdfDoc.moveDown(1);

      pdfDoc.text("Regards,");
      pdfDoc.moveDown(2);
      pdfDoc.text("____________________");
      pdfDoc.text("Company Representative");

      pdfDoc.end();

      writeStream.on("finish", () => {
        resolve(`/uploads/${fileName}`);
      });

      writeStream.on("error", (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
};

export const generateContractPDF = async (contractData) => {
  return new Promise((resolve, reject) => {
    try {
      const uploadDir = path.join(__dirname, "../../uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const fileName = `contract-${contractData.application}_${Date.now()}.pdf`;
      const filePath = path.join(uploadDir, fileName);
      const pdfDoc = new PDFDocument();
      const writeStream = fs.createWriteStream(filePath);

      pdfDoc.pipe(writeStream);

      // Header
      pdfDoc
        .fontSize(18)
        .text("INTERNSHIP AGREEMENT", { align: "center" })
        .moveDown(0.5);

      pdfDoc
        .fontSize(10)
        .text(`Date: ${new Date().toLocaleDateString()}`)
        .moveDown(1);

      // Parties
      pdfDoc
        .fontSize(11)
        .text("BETWEEN:", { underline: true })
        .moveDown(0.3)
        .text(
          `${contractData.companyName} (hereinafter referred to as "Company")`,
        )
        .moveDown(0.5)
        .text("AND")
        .moveDown(0.5)
        .text(
          `${contractData.studentName} (hereinafter referred to as "Intern")`,
        )
        .moveDown(1);

      // Terms
      pdfDoc
        .text("TERMS AND CONDITIONS:", { underline: true })
        .moveDown(0.3)
        .text(`1. Position: ${contractData.position}`)
        .text(`2. Location: ${contractData.location}`)
        .text(
          `3. Duration: ${new Date(contractData.startDate).toLocaleDateString()} to ${new Date(contractData.endDate).toLocaleDateString()}`,
        )
        .text(`4. Stipend: ₹${contractData.stipend} per month`)
        .text(`5. Reporting To: ${contractData.reportingTo}`)
        .moveDown(0.5);

      // Responsibilities
      pdfDoc
        .text("6. Responsibilities of the Intern:", { underline: true })
        .moveDown(0.2);
      contractData.responsibilities.forEach((resp) => {
        pdfDoc.text(`   • ${resp}`);
      });

      pdfDoc.moveDown(1);

      // Confidentiality
      pdfDoc.text(
        "7. The Intern agrees to maintain confidentiality of all proprietary information and trade secrets of the Company.",
      );
      pdfDoc.moveDown(1);

      // Signatures
      pdfDoc.moveDown(1);
      pdfDoc.text("SIGNATURES:");
      pdfDoc.moveDown(0.5);

      pdfDoc.text("For the Intern:");
      pdfDoc.moveDown(1.5);
      pdfDoc.text("_________________________");
      pdfDoc.text("Signature and Date");
      pdfDoc.moveDown(1);

      pdfDoc.text("For the Company:");
      pdfDoc.moveDown(1.5);
      pdfDoc.text("_________________________");
      pdfDoc.text("Signature and Date");

      pdfDoc.end();

      writeStream.on("finish", () => {
        resolve(`/uploads/${fileName}`);
      });

      writeStream.on("error", (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
};

export default {
  generatePDF,
  generateOfferLetterPDF,
  generateContractPDF,
};
