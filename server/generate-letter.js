import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Target candidate name
const candidateName = "Alex Morgan";
const fileName = "Alex_Morgan.pdf";

// Artifacts directory path (from prompt metadata)
const artifactDir = "C:\\Users\\shivaji\\.gemini\\antigravity\\brain\\2050b67c-4f14-407b-9811-0cd9556649f7";
const outputPath = path.join(artifactDir, fileName);

const doc = new PDFDocument({
  size: "LETTER",
  margins: {
    top: 54,
    bottom: 54,
    left: 72,
    right: 72
  }
});

const writeStream = fs.createWriteStream(outputPath);
doc.pipe(writeStream);

// ----------------------------------------------------
// 1. TOP HEADER (Decorative colored stripe)
// ----------------------------------------------------
doc.rect(0, 0, 612, 10).fill("#1E293B"); // Deep slate/navy top border

// ----------------------------------------------------
// 2. COMPANY LETTERHEAD
// ----------------------------------------------------
doc.fillColor("#0F172A").font("Helvetica-Bold").fontSize(22).text("NexaTech Industries", 72, 45);
doc.fillColor("#0D9488").font("Helvetica-Bold").fontSize(8).text("INNOVATION • TECHNOLOGY • GROWTH", 72, 70);

doc.fillColor("#64748B").font("Helvetica").fontSize(9)
   .text("100 Innovation Way, Suite 400\nTech City, CA 94016\nwww.nexatech.com", 350, 48, { align: "right", width: 190 });

// Horizontal line divider
doc.strokeColor("#E2E8F0").lineWidth(1.5).moveTo(72, 95).lineTo(540, 95).stroke();

// ----------------------------------------------------
// 3. DATE AND CANDIDATE ADDRESS
// ----------------------------------------------------
doc.fillColor("#475569").font("Helvetica").fontSize(10).text("Date: May 21, 2026", 72, 115);

doc.fillColor("#0F172A").font("Helvetica-Bold").fontSize(10).text("To,", 72, 140);
doc.font("Helvetica-Bold").fontSize(11).text(candidateName, 72, 154);
doc.font("Helvetica").fontSize(10).fillColor("#475569")
   .text("456 Oak Avenue, Apt 2B\nSan Francisco, CA 94102", 72, 168, { lineGap: 2 });

// ----------------------------------------------------
// 4. SUBJECT LINE WITH STYLISH BACKPLATE
// ----------------------------------------------------
doc.fillColor("#F8FAFC").roundedRect(72, 205, 468, 28, 4).fill();
doc.fillColor("#0D9488").roundedRect(72, 205, 4, 28, 4).fill(); // Accent bar
doc.fillColor("#0F172A").font("Helvetica-Bold").fontSize(11).text("Subject: Employment Offer – Senior Software Engineer", 86, 214);

// ----------------------------------------------------
// 5. GREETING & INTRODUCTORY PARAGRAPH
// ----------------------------------------------------
doc.fillColor("#334155").font("Helvetica").fontSize(10.5).text(`Dear ${candidateName},`, 72, 250);

const p1 = "On behalf of NexaTech Industries, we are absolutely delighted to offer you the position of Senior Software Engineer. We were incredibly impressed by your technical expertise, leadership skills, and alignment with our core values during the interview process. We believe your contributions will be key to our continued growth and innovation.";
doc.y = 270;
doc.text(p1, { width: 468, align: "justify", lineGap: 4 });

// ----------------------------------------------------
// 6. JOB DETAILS SECTION WITH SHADOW PANEL
// ----------------------------------------------------
doc.moveDown(1.5);
const boxStartY = doc.y;

// Let's define the details
const details = [
  { label: "Position", value: "Senior Software Engineer" },
  { label: "Start Date", value: "July 1, 2026" },
  { label: "Location", value: "San Francisco Office (Hybrid)" },
  { label: "Salary", value: "$135,000 per annum" },
  { label: "Benefits", value: "Comprehensive health insurance (medical, dental, vision), 401(k) matching up to 4%, 20 days of Paid Time Off (PTO) annually, and a monthly wellness stipend." }
];

const boxWidth = 468;
const padding = 16;
const labelWidth = 100;
const valueWidth = boxWidth - (padding * 2) - labelWidth - 10;

// Calculate required box height dynamically
let tempY = boxStartY + padding;
details.forEach(item => {
  const valueHeight = doc.heightOfString(item.value, { width: valueWidth, lineGap: 3 });
  const rowHeight = Math.max(16, valueHeight);
  tempY += rowHeight + 10;
});
const boxHeight = tempY - boxStartY + padding - 10; // Adjust padding

// Draw box background and outline
doc.fillColor("#F8FAFC").roundedRect(72, boxStartY, boxWidth, boxHeight, 6).fill();
doc.strokeColor("#E2E8F0").lineWidth(1).roundedRect(72, boxStartY, boxWidth, boxHeight, 6).stroke();

// Render details inside the box
let currentY = boxStartY + padding;
details.forEach(item => {
  // Label (Bold, slate)
  doc.fillColor("#475569").font("Helvetica-Bold").fontSize(9.5).text(item.label, 88, currentY, { width: labelWidth });
  
  // Value (Regular, dark slate)
  doc.fillColor("#0F172A").font("Helvetica").fontSize(9.5).text(item.value, 88 + labelWidth + 10, currentY, { width: valueWidth, lineGap: 3 });
  
  const valueHeight = doc.heightOfString(item.value, { width: valueWidth, lineGap: 3 });
  const rowHeight = Math.max(16, valueHeight);
  currentY += rowHeight + 10;
});

// Update document cursor below the details box
doc.y = boxStartY + boxHeight + 18;

// ----------------------------------------------------
// 7. INSTRUCTIONS & ACCEPTANCE DEADLINE
// ----------------------------------------------------
const p2 = "To accept this offer, please sign, date, and return this letter to us by June 1, 2026. This offer is contingent upon the successful completion of standard background verification checks.";
doc.fillColor("#334155").font("Helvetica").fontSize(10.5).text(p2, { width: 468, align: "justify", lineGap: 4 });

doc.moveDown(1);

const p3 = "We are thrilled about the prospect of you joining our team and look forward to welcoming you to NexaTech Industries!";
doc.text(p3, { width: 468, align: "justify", lineGap: 4 });

doc.moveDown(1.5);

// ----------------------------------------------------
// 8. CLOSING & SIGNATURE BLOCK
// ----------------------------------------------------
doc.text("Sincerely,", { lineGap: 4 });
doc.moveDown(1.5); // Space for actual signature image or manual signing

// Authorised Signatory details
doc.fillColor("#0F172A").font("Helvetica-Bold").fontSize(10.5).text("Sarah Jenkins");
doc.fillColor("#475569").font("Helvetica").fontSize(9.5).text("Vice President, Human Resources");
doc.fillColor("#0F172A").font("Helvetica-Bold").fontSize(9.5).text("NexaTech Industries");

// ----------------------------------------------------
// 9. FOOTER (Decorative accent line and page details)
// ----------------------------------------------------
doc.strokeColor("#E2E8F0").lineWidth(1).moveTo(72, 730).lineTo(540, 730).stroke();
doc.fillColor("#94A3B8").font("Helvetica").fontSize(8)
   .text("NexaTech Industries is an equal opportunity employer.", 72, 742, { align: "center", width: 468 });

doc.end();

writeStream.on("finish", () => {
  console.log(`PDF successfully generated at: ${outputPath}`);
});
writeStream.on("error", (err) => {
  console.error("Error writing PDF file:", err);
});
