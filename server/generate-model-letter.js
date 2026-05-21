import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Target candidate name
const candidateName = "Hannah Morales";
const fileName = "Hannah_Morales.pdf";

// Artifacts directory path (from prompt metadata)
const artifactDir = "C:\\Users\\shivaji\\.gemini\\antigravity\\brain\\2050b67c-4f14-407b-9811-0cd9556649f7";
const outputPath = path.join(artifactDir, fileName);

const doc = new PDFDocument({
  size: "LETTER",
  margins: {
    top: 54,
    bottom: 54,
    left: 54,
    right: 54
  }
});

const writeStream = fs.createWriteStream(outputPath);
doc.pipe(writeStream);

// ==========================================================
// 1. SIDE BORDERS
// ==========================================================
const leftBorderColor = "#DCFCE7"; // Light green mint border
doc.fillColor(leftBorderColor).rect(0, 0, 10, 792).fill();
doc.fillColor(leftBorderColor).rect(602, 0, 10, 792).fill();

// ==========================================================
// 2. GEOMETRIC BACKGROUND DECORATIONS (Top Right / Bottom Left)
// ==========================================================

// Top-Right corner overlapping shapes
doc.fillColor("#0A5C36").polygon([602, 110], [490, 0], [602, 0]).fill(); // Dark Green
doc.fillColor("#15803D").polygon([602, 80], [520, 0], [602, 0]).fill(); // Medium Green
doc.fillColor("#22C55E").polygon([602, 50], [550, 0], [602, 0]).fill(); // Light Green
doc.fillColor("#4ADE80").polygon([602, 30], [570, 0], [602, 0]).fill(); // Mint accent

// Bottom-Left corner overlapping geometric squares/polygons (slanted modern blocks)
doc.fillColor("#0A5C36").polygon([10, 680], [120, 792], [10, 792]).fill();
doc.fillColor("#15803D").polygon([10, 715], [85, 792], [10, 792]).fill();
doc.fillColor("#22C55E").polygon([10, 745], [55, 792], [10, 792]).fill();
doc.fillColor("#4ADE80").polygon([10, 765], [35, 792], [10, 792]).fill();

// Accent details on Bottom-Left (rotated lines)
doc.strokeColor("#DCFCE7").lineWidth(2)
   .moveTo(10, 660).lineTo(140, 790).stroke();

// ==========================================================
// 3. COMPANY LOGO & HEADER (Top-Left)
// ==========================================================

// Draw Slanted Growth Logo
doc.fillColor("#15803D");
// Bar 1 (Leftmost)
doc.polygon([40, 54], [48, 50], [48, 75], [40, 75]).fill();
// Bar 2 (Middle)
doc.polygon([51, 46], [59, 41], [59, 75], [51, 75]).fill();
// Bar 3 (Rightmost)
doc.polygon([62, 38], [70, 32], [70, 75], [62, 75]).fill();

// Header Text
doc.fillColor("#0A5C36").font("Helvetica-Bold").fontSize(18).text("WARNER & SPENCER, CO.", 82, 36);
doc.fillColor("#22C55E").font("Helvetica").fontSize(10).text("www.reallygreatsite.com", 82, 56);

// ==========================================================
// 4. "JOB OFFER LETTER" HEADER PANEL (Centered with drop shadow)
// ==========================================================

// Draw subtle drop shadow first
doc.fillColor("rgba(0, 0, 0, 0.05)")
   .roundedRect(149, 113, 314, 46, 6).fill();

// Draw primary light green box
doc.fillColor("#DCFCE7").strokeColor("#86EFAC").lineWidth(1)
   .roundedRect(146, 110, 314, 46, 6).fillAndStroke();

// Centered Title Text
doc.fillColor("#0A5C36").font("Helvetica-Bold").fontSize(22)
   .text("JOB OFFER LETTER", 146, 123, { align: "center", width: 314, characterSpacing: 1 });

// ==========================================================
// 5. TO AND DATE SECTION
// ==========================================================
doc.fillColor("#334155").font("Helvetica").fontSize(11).text("To:", 54, 185);
doc.fillColor("#0F172A").font("Helvetica-Bold").fontSize(11.5).text(candidateName, 54, 201);
doc.fillColor("#475569").font("Helvetica").fontSize(10.5)
   .text("123 Anywhere St., Any City ST 1234", 54, 217);

// Date on the right side
doc.fillColor("#334155").font("Helvetica").fontSize(10.5)
   .text(new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }), 400, 185, { align: "right", width: 158 });

// ==========================================================
// 6. SALUTATION & OPENING PARAGRAPH
// ==========================================================
doc.fillColor("#1E293B").font("Helvetica-Bold").fontSize(11.5)
   .text(`Dear ${candidateName},`, 54, 260);

const p1 = "We are pleased to offer you the position of Marketing Specialist at Warner & Spencer, Co. Your skills and experience will be a valuable addition to our team.";
doc.fillColor("#334155").font("Helvetica").fontSize(10.5);
doc.y = 282;
doc.text(p1, { width: 504, align: "left", lineGap: 5 });

// ==========================================================
// 7. DETAILS OF THE OFFER SECTION
// ==========================================================
doc.moveDown(1.5);
doc.fillColor("#1E293B").font("Helvetica-Bold").fontSize(11.5).text("Details of the Offer:", { lineGap: 6 });

const offerDetails = [
  { label: "Position", value: "Marketing Specialist" },
  { label: "Start Date", value: "March 15, 2026" },
  { label: "Work Location", value: "Main Office" },
  { label: "Salary", value: "Competitive package as per company standards" }
];

offerDetails.forEach(detail => {
  const currentY = doc.y;
  // Green bullet point
  doc.fillColor("#15803D").font("Helvetica-Bold").fontSize(11).text("•", 68, currentY);
  
  // Detail Label & Value
  doc.fillColor("#334155").font("Helvetica-Bold").fontSize(10.5).text(`${detail.label}: `, 80, currentY, { continued: true });
  doc.font("Helvetica").text(detail.value);
  doc.moveDown(0.4);
});

// ==========================================================
// 8. CLOSING & ACCEPTANCE INSTRUCTIONS
// ==========================================================
doc.moveDown(0.8);
const p2 = "We look forward to your contribution and growth with us. Please confirm your acceptance by replying to this letter before March 10, 2026.";
doc.fillColor("#334155").font("Helvetica").fontSize(10.5)
   .text(p2, { width: 504, align: "left", lineGap: 5 });

// ==========================================================
// 9. SIGNATURE BLOCK (Sincerely & Handwritten Signature)
// ==========================================================
const sigStartY = doc.y + 24;
doc.fillColor("#1E293B").font("Helvetica").fontSize(11).text("Sincerely,", 380, sigStartY);

// DRAW EXQUISITE VECTOR HANDWRITTEN SIGNATURE (Bezier curves representing realistic signature)
doc.strokeColor("#0A5C36").lineWidth(2.2).lineCap("round").lineJoin("round");
doc.moveTo(395, sigStartY + 45)
   .bezierCurveTo(385, sigStartY + 10, 410, sigStartY + 5, 400, sigStartY + 40) // Loop for 'T'
   .bezierCurveTo(390, sigStartY + 70, 375, sigStartY + 60, 435, sigStartY + 42) // Cross-line loop
   .bezierCurveTo(445, sigStartY + 35, 452, sigStartY + 35, 455, sigStartY + 50) // 'e' loop
   .bezierCurveTo(460, sigStartY + 40, 465, sigStartY + 42, 468, sigStartY + 50) // 'd' first bump
   .bezierCurveTo(472, sigStartY + 30, 480, sigStartY + 30, 477, sigStartY + 50) // 'd' second bump
   .bezierCurveTo(482, sigStartY + 40, 492, sigStartY + 40, 492, sigStartY + 52) // 'y' hump
   .bezierCurveTo(488, sigStartY + 75, 472, sigStartY + 72, 498, sigStartY + 45) // 'y' tail and connection
   .bezierCurveTo(506, sigStartY + 32, 520, sigStartY + 30, 514, sigStartY + 50) // 'Y' upper
   .bezierCurveTo(510, sigStartY + 70, 502, sigStartY + 72, 522, sigStartY + 46) // 'Y' loop to 'u'
   .bezierCurveTo(526, sigStartY + 38, 532, sigStartY + 40, 536, sigStartY + 48) // 'u' hump
   .bezierCurveTo(544, sigStartY + 38, 560, sigStartY + 38, 575, sigStartY + 50) // Sweep flourish end
   .stroke();

// Signatory details under signature
doc.fillColor("#0F172A").font("Helvetica-Bold").fontSize(11).text("Teddy Yu", 380, sigStartY + 68);
doc.fillColor("#475569").font("Helvetica").fontSize(10).text("HRD Warner & Spencer, Co.", 380, sigStartY + 82);

// ==========================================================
// 10. FOOTER (Soft waves and business contact info)
// ==========================================================

// Draw background decorative light-green waves
doc.strokeColor("#DCFCE7").lineWidth(1.2);
doc.moveTo(350, 792).bezierCurveTo(430, 760, 460, 720, 602, 710).stroke();
doc.moveTo(380, 792).bezierCurveTo(460, 750, 490, 700, 602, 685).stroke();
doc.moveTo(410, 792).bezierCurveTo(490, 740, 520, 680, 602, 660).stroke();

// Footer Address Details (Bottom-Right)
const footerY = 705;
doc.fillColor("#334155").font("Helvetica").fontSize(9.5)
   .text("+123-456-7890", 350, footerY, { align: "right", width: 232 });
doc.fillColor("#0A5C36").font("Helvetica-Bold")
   .text("hello@reallygreatsite.com", 350, footerY + 13, { align: "right", width: 232 });
doc.fillColor("#64748B").font("Helvetica")
   .text("123 Anywhere St., Any City", 350, footerY + 26, { align: "right", width: 232 });

doc.end();

writeStream.on("finish", () => {
  console.log(`PDF successfully generated at: ${outputPath}`);
});
writeStream.on("error", (err) => {
  console.error("Error writing PDF file:", err);
});
