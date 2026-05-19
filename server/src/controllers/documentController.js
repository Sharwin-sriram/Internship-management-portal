import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Document from "../models/Document.js";
import DocumentVersion from "../models/DocumentVersion.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const canDownloadDocument = (user, document) => {
  if (!user || !document) return false;

  if (
    document.user.toString() === user._id.toString() ||
    user.role === "admin" ||
    user.role === "coordinator"
  ) {
    return true;
  }

  return user.role === "company" && document.doc_type === "resume";
};

// @desc    Upload a document
// @route   POST /api/documents/upload
// @access  Private
export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const { documentType } = req.body;

    if (!documentType) {
      return res.status(400).json({
        success: false,
        message: "Document type is required",
      });
    }

    // Valid document types as per the Document model
    const validTypes = [
      "resume",
      "transcript",
      "id_proof",
      "offer_letter",
      "cover_letter",
      "certificate",
      "other",
    ];
    if (!validTypes.includes(documentType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid document type. Valid types are: ${validTypes.join(", ")}`,
      });
    }

    // Check if a document of this type already exists for the user to handle versioning
    let document = await Document.findOne({
      user: req.user._id,
      doc_type: documentType,
    });
    let version = 1;

    if (document) {
      version = document.version + 1;

      document.file_data = req.file.buffer;
      document.mime_type = req.file.mimetype;
      document.original_name = req.file.originalname;
      document.version = version;
      document.is_verified = false; // Reset verification on new upload
      await document.save();
    } else {
      document = await Document.create({
        user: req.user._id,
        doc_type: documentType,
        file_data: req.file.buffer,
        mime_type: req.file.mimetype,
        original_name: req.file.originalname,
        version: version,
        is_verified: false,
      });
    }

    // Maintain version history
    await DocumentVersion.create({
      document: document._id,
      user: req.user._id,
      version_number: version,
      file_data: req.file.buffer,
      mime_type: req.file.mimetype,
      original_name: req.file.originalname,
      file_size: req.file.size,
    });

    res.status(201).json({
      success: true,
      message: "File uploaded successfully",
      data: {
        documentId: document._id,
        version: version,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "File upload failed",
    });
  }
};

// @desc    Get all documents
// @route   GET /api/documents
// @access  Private
export const getDocuments = async (req, res) => {
  try {
    let query = {};

    // If the user is a student or company, they can only see their own documents
    if (req.user.role === "student" || req.user.role === "company") {
      query.user = req.user._id;
    }
    // Coordinators and admins can see all documents

    const { doc_type } = req.query;
    if (doc_type) {
      query.doc_type = doc_type;
    }

    const documents = await Document.find(query)
      .select("-file_data")
      .populate("user", "name email role");

    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents,
    });
  } catch (error) {
    console.error("Error fetching documents:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch documents",
    });
  }
};

// @desc    Delete a document
// @route   DELETE /api/documents/:id
// @access  Private
export const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    // Check ownership or admin
    if (
      document.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin" &&
      req.user.role !== "coordinator"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this document",
      });
    }

    // We no longer need to unlink local files, just remove from DB
    await document.deleteOne();
    await DocumentVersion.deleteMany({ document: req.params.id });

    res.status(200).json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete document",
    });
  }
};

// @desc    Verify a document
// @route   PUT /api/documents/:id/verify
// @access  Private (Coordinator/Admin only)
export const verifyDocument = async (req, res) => {
  try {
    const { is_verified } = req.body;

    if (typeof is_verified !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "is_verified must be a boolean",
      });
    }

    const document = await Document.findByIdAndUpdate(
      req.params.id,
      { is_verified },
      { new: true, runValidators: true },
    ).populate("user", "name email role");

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    res.status(200).json({
      success: true,
      message: `Document verification status updated to ${is_verified}`,
      data: document,
    });
  } catch (error) {
    console.error("Verify error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify document",
    });
  }
};

// @desc    Download a document
// @route   GET /api/documents/:id/download
// @access  Private
export const downloadDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res
        .status(404)
        .json({ success: false, message: "Document not found" });
    }

    if (!canDownloadDocument(req.user, document)) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    if (!document.file_data) {
      return res
        .status(404)
        .json({ success: false, message: "Document binary data not found" });
    }

    res.set("Content-Type", document.mime_type);
    res.set(
      "Content-Disposition",
      `inline; filename="${document.original_name}"`,
    );
    res.send(document.file_data);
  } catch (error) {
    console.error("Download error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to download document" });
  }
};
