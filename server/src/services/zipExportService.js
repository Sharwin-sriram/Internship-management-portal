import { createRequire } from "module";
const require = createRequire(import.meta.url);
const archiver = require("archiver");
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Document from "../models/Document.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createDocumentZipExport = async (filters) => {
  return new Promise(async (resolve, reject) => {
    try {
      const uploadDir = path.join(__dirname, "../../uploads");
      const exportsDir = path.join(__dirname, "../../exports");

      // Create exports directory if it doesn't exist
      if (!fs.existsSync(exportsDir)) {
        fs.mkdirSync(exportsDir, { recursive: true });
      }

      // Build query
      const query = {};
      if (filters.batch) query.batch_id = filters.batch;
      if (filters.department) query.department = filters.department;
      if (filters.doc_type) query.doc_type = filters.doc_type;
      if (filters.is_verified !== undefined)
        query.is_verified = filters.is_verified;

      // Fetch documents matching filters
      const documents = await Document.find(query).populate(
        "user",
        "name email role",
      );

      if (documents.length === 0) {
        return reject(new Error("No documents found matching the criteria"));
      }

      // Create archive
      const zipFileName = `documents-export-${Date.now()}.zip`;
      const zipFilePath = path.join(exportsDir, zipFileName);
      const output = fs.createWriteStream(zipFilePath);
      const archive = archiver("zip", { zlib: { level: 9 } });

      output.on("close", () => {
        resolve({
          filename: zipFileName,
          filepath: zipFilePath,
          url: `/exports/${zipFileName}`,
          size: archive.pointer(),
          documentCount: documents.length,
        });
      });

      output.on("error", (err) => {
        reject(err);
      });

      archive.on("error", (err) => {
        reject(err);
      });

      archive.pipe(output);

      // Add documents to zip
      for (const doc of documents) {
        if (doc.file_data && doc.original_name) {
          const ext = path.extname(doc.original_name) || '.pdf';
          const fileName = `${doc.user.name}_${doc.doc_type}_v${doc.version}${ext}`;
          archive.append(doc.file_data, { name: fileName });
        }
      }

      // Finalize archive
      await archive.finalize();
    } catch (error) {
      reject(error);
    }
  });
};

export const cleanupOldExports = async (retentionDays = 7) => {
  try {
    const exportsDir = path.join(__dirname, "../../exports");

    if (!fs.existsSync(exportsDir)) {
      return;
    }

    const files = fs.readdirSync(exportsDir);
    const now = Date.now();

    for (const file of files) {
      const filePath = path.join(exportsDir, file);
      const stats = fs.statSync(filePath);
      const ageInDays = (now - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);

      if (ageInDays > retentionDays) {
        fs.unlinkSync(filePath);
      }
    }
  } catch (error) {
    console.error("Error cleaning up old exports:", error);
  }
};

export default {
  createDocumentZipExport,
  cleanupOldExports,
};
