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
      
      const doc = new PDFDocument({
        size: "LETTER",
        margins: {
          top: 54,
          bottom: 54,
          left: 54,
          right: 54
        }
      });
      
      const writeStream = fs.createWriteStream(filePath);
      doc.pipe(writeStream);

      // Side borders
      const leftBorderColor = "#DCFCE7";
      doc.fillColor(leftBorderColor).rect(0, 0, 10, 792).fill();
      doc.fillColor(leftBorderColor).rect(602, 0, 10, 792).fill();

      // Geometric top-right corners
      doc.fillColor("#0A5C36").polygon([602, 110], [490, 0], [602, 0]).fill();
      doc.fillColor("#15803D").polygon([602, 80], [520, 0], [602, 0]).fill();
      doc.fillColor("#22C55E").polygon([602, 50], [550, 0], [602, 0]).fill();
      doc.fillColor("#4ADE80").polygon([602, 30], [570, 0], [602, 0]).fill();

      // Bottom-Left corner overlapping geometric squares/polygons
      doc.fillColor("#0A5C36").polygon([10, 680], [120, 792], [10, 792]).fill();
      doc.fillColor("#15803D").polygon([10, 715], [85, 792], [10, 792]).fill();
      doc.fillColor("#22C55E").polygon([10, 745], [55, 792], [10, 792]).fill();
      doc.fillColor("#4ADE80").polygon([10, 765], [35, 792], [10, 792]).fill();

      // Accent line
      doc.strokeColor("#DCFCE7").lineWidth(2).moveTo(10, 660).lineTo(140, 790).stroke();

      // Logo slanted growth
      doc.fillColor("#15803D");
      doc.polygon([40, 54], [48, 50], [48, 75], [40, 75]).fill();
      doc.polygon([51, 46], [59, 41], [59, 75], [51, 75]).fill();
      doc.polygon([62, 38], [70, 32], [70, 75], [62, 75]).fill();

      // Header Text
      const compName = (offerData.companyName || "WARNER & SPENCER, CO.").toUpperCase();
      doc.fillColor("#0A5C36").font("Helvetica-Bold").fontSize(18).text(compName, 82, 36);
      doc.fillColor("#22C55E").font("Helvetica").fontSize(10).text("www.reallygreatsite.com", 82, 56);

      // Job offer letter header panel
      doc.fillColor("rgba(0, 0, 0, 0.05)").roundedRect(149, 113, 314, 46, 6).fill();
      doc.fillColor("#DCFCE7").strokeColor("#86EFAC").lineWidth(1).roundedRect(146, 110, 314, 46, 6).fillAndStroke();
      doc.fillColor("#0A5C36").font("Helvetica-Bold").fontSize(22).text("JOB OFFER LETTER", 146, 123, { align: "center", width: 314, characterSpacing: 1 });

      // To and Date
      const dateStr = offerData.date || new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
      doc.fillColor("#334155").font("Helvetica").fontSize(11).text("To:", 54, 185);
      doc.fillColor("#0F172A").font("Helvetica-Bold").fontSize(11.5).text(offerData.studentName, 54, 201);
      doc.fillColor("#475569").font("Helvetica").fontSize(10.5).text(offerData.studentAddress || "123 Anywhere St., Any City ST 1234", 54, 217);
      doc.fillColor("#334155").font("Helvetica").fontSize(10.5).text(dateStr, 400, 185, { align: "right", width: 158 });

      // Salutation
      doc.fillColor("#1E293B").font("Helvetica-Bold").fontSize(11.5).text(`Dear ${offerData.studentName},`, 54, 260);

      // Body
      const p1 = `We are pleased to offer you the position of ${offerData.position} at ${offerData.companyName}. Your skills and experience will be a valuable addition to our team.`;
      doc.fillColor("#334155").font("Helvetica").fontSize(10.5);
      doc.y = 282;
      doc.text(p1, { width: 504, align: "left", lineGap: 5 });

      // Details of the Offer
      doc.moveDown(1.5);
      doc.fillColor("#1E293B").font("Helvetica-Bold").fontSize(11.5).text("Details of the Offer:", { lineGap: 6 });

      const startDateFormatted = new Date(offerData.startDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
      const salaryFormatted = offerData.salary ? `₹${offerData.salary}/mo` : "Competitive package";

      const details = [
        { label: "Position", value: offerData.position },
        { label: "Start Date", value: startDateFormatted },
        { label: "Work Location", value: offerData.location },
        { label: "Salary", value: salaryFormatted }
      ];

      details.forEach(detail => {
        const currentY = doc.y;
        doc.fillColor("#15803D").font("Helvetica-Bold").fontSize(11).text("•", 68, currentY);
        doc.fillColor("#334155").font("Helvetica-Bold").fontSize(10.5).text(`${detail.label}: `, 80, currentY, { continued: true });
        doc.font("Helvetica").text(detail.value);
        doc.moveDown(0.4);
      });

      // Closing
      doc.moveDown(0.8);
      const formattedExpDate = offerData.expirationDate ? new Date(offerData.expirationDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "N/A";
      const p2 = `We look forward to your contribution and growth with us. Please confirm your acceptance by replying to this letter before ${formattedExpDate}.`;
      doc.fillColor("#334155").font("Helvetica").fontSize(10.5).text(p2, { width: 504, align: "left", lineGap: 5 });

      // Signature
      const sigStartY = doc.y + 24;
      doc.fillColor("#1E293B").font("Helvetica").fontSize(11).text("Sincerely,", 380, sigStartY);

      const signatureImage = offerData.signatureImage;

      if (signatureImage) {
        try {
          const base64Data = signatureImage.replace(/^data:image\/\w+;base64,/, "");
          const imageBuffer = Buffer.from(base64Data, "base64");
          doc.image(imageBuffer, 380, sigStartY + 10, { width: 120, height: 45 });
        } catch (err) {
          console.error("Error drawing signature image:", err);
        }
      }

      // HR contact details splitting
      const hrRaw = offerData.hrContact || "Teddy Yu, HRD";
      const hrParts = hrRaw.split(",");
      const hrName = hrParts[0].trim();
      const hrTitle = hrParts[1] ? hrParts[1].trim() : "HRD";

      doc.fillColor("#0F172A").font("Helvetica-Bold").fontSize(11).text(hrName, 380, sigStartY + 68);
      doc.fillColor("#475569").font("Helvetica").fontSize(10).text(`${hrTitle}, ${offerData.companyName}`, 380, sigStartY + 82);

      // Footer Waves
      doc.strokeColor("#DCFCE7").lineWidth(1.2);
      doc.moveTo(350, 792).bezierCurveTo(430, 760, 460, 720, 602, 710).stroke();
      doc.moveTo(380, 792).bezierCurveTo(460, 750, 490, 700, 602, 685).stroke();
      doc.moveTo(410, 792).bezierCurveTo(490, 740, 520, 680, 602, 660).stroke();

      // Footer Details
      const footerY = 705;
      doc.fillColor("#334155").font("Helvetica").fontSize(9.5).text(offerData.companyPhone || "+123-456-7890", 350, footerY, { align: "right", width: 232 });
      doc.fillColor("#0A5C36").font("Helvetica-Bold").text(offerData.companyEmail || "hello@reallygreatsite.com", 350, footerY + 13, { align: "right", width: 232 });
      doc.fillColor("#64748B").font("Helvetica").text(offerData.companyAddress || "123 Anywhere St., Any City", 350, footerY + 26, { align: "right", width: 232 });

      doc.end();

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
