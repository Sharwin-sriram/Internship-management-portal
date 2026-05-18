import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Document from '../models/Document.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @desc    Upload a document
// @route   POST /api/documents/upload
// @access  Private
export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const { documentType } = req.body;

    if (!documentType) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Document type is required',
      });
    }

    // Valid document types as per the Document model
    const validTypes = ['resume', 'transcript', 'id_proof', 'offer_letter', 'cover_letter', 'certificate', 'other'];
    if (!validTypes.includes(documentType)) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: `Invalid document type. Valid types are: ${validTypes.join(', ')}`,
      });
    }

    // Check if a document of this type already exists for the user to handle versioning
    const existingDoc = await Document.findOne({ user: req.user._id, doc_type: documentType }).sort('-version');
    const version = existingDoc ? existingDoc.version + 1 : 1;

    // Create the document record in MongoDB
    const storageUrl = `/uploads/${req.file.filename}`;
    
    const document = await Document.create({
      user: req.user._id,
      doc_type: documentType,
      storage_url: storageUrl,
      version: version,
      is_verified: false,
    });

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        document,
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);

    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: error.message || 'File upload failed',
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
    if (req.user.role === 'student' || req.user.role === 'company') {
      query.user = req.user._id;
    }
    // Coordinators and admins can see all documents

    const documents = await Document.find(query).populate('user', 'name email role');

    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents,
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch documents',
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
        message: 'Document not found',
      });
    }

    // Check ownership or admin
    if (
      document.user.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin' &&
      req.user.role !== 'coordinator'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this document',
      });
    }

    // Remove file from filesystem
    const filename = document.storage_url.split('/').pop();
    const filePath = path.join(__dirname, '../../uploads', filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Remove from database
    await document.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete document',
    });
  }
};

// @desc    Verify a document
// @route   PUT /api/documents/:id/verify
// @access  Private (Coordinator/Admin only)
export const verifyDocument = async (req, res) => {
  try {
    const { is_verified } = req.body;
    
    if (typeof is_verified !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'is_verified must be a boolean',
      });
    }

    const document = await Document.findByIdAndUpdate(
      req.params.id,
      { is_verified },
      { new: true, runValidators: true }
    ).populate('user', 'name email role');

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    res.status(200).json({
      success: true,
      message: `Document verification status updated to ${is_verified}`,
      data: document,
    });
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify document',
    });
  }
};
