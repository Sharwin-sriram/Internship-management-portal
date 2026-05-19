import DocumentVersion from "../models/DocumentVersion.js";
import Document from "../models/Document.js";

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

// @desc    Get all versions of a document
// @route   GET /api/documents/:id/versions
// @access  Private
export const getDocumentVersions = async (req, res) => {
  try {
    const documentId = req.params.id;

    // Validate document access
    const document = await Document.findById(documentId);
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

    const versions = await DocumentVersion.find({ document: documentId })
      .select("-file_data")
      .sort("-version_number");

    res.status(200).json({
      success: true,
      count: versions.length,
      data: versions,
    });
  } catch (error) {
    console.error("Get versions error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch document versions",
    });
  }
};

// @desc    Restore a previous document version
// @route   POST /api/documents/:id/versions/:versionId/restore
// @access  Private
export const restoreDocumentVersion = async (req, res) => {
  try {
    const { id, versionId } = req.params;

    const document = await Document.findById(id);
    if (!document) {
      return res
        .status(404)
        .json({ success: false, message: "Document not found" });
    }

    if (
      document.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized to restore" });
    }

    const versionToRestore = await DocumentVersion.findById(versionId);
    if (!versionToRestore || versionToRestore.document.toString() !== id) {
      return res
        .status(404)
        .json({ success: false, message: "Version not found" });
    }

    // Update main document to reflect restored version
    document.file_data = versionToRestore.file_data;
    document.mime_type = versionToRestore.mime_type;
    document.original_name = versionToRestore.original_name;
    // We increment the version number to show it's a new state, even if restored from old
    const newVersionNum = document.version + 1;
    document.version = newVersionNum;
    document.is_verified = false;
    await document.save();

    // Create a new version log for this restored state
    await DocumentVersion.create({
      document: document._id,
      user: req.user._id,
      version_number: newVersionNum,
      file_data: versionToRestore.file_data,
      mime_type: versionToRestore.mime_type,
      original_name: versionToRestore.original_name,
      file_size: versionToRestore.file_size,
      restored_from_version: versionToRestore.version_number,
      change_description: `Restored from version ${versionToRestore.version_number}`,
    });

    res.status(200).json({
      success: true,
      message: `Document restored to version ${versionToRestore.version_number}`,
      data: document,
    });
  } catch (error) {
    console.error("Restore version error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to restore document version",
    });
  }
};

// @desc    Download a previous document version
// @route   GET /api/documents/:id/versions/:versionId/download
// @access  Private
export const downloadDocumentVersion = async (req, res) => {
  try {
    const { id, versionId } = req.params;

    const document = await Document.findById(id);
    if (!document) {
      return res
        .status(404)
        .json({ success: false, message: "Document not found" });
    }

    if (
      document.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin" &&
      req.user.role !== "coordinator"
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    const version = await DocumentVersion.findById(versionId);
    if (!version || version.document.toString() !== id) {
      return res
        .status(404)
        .json({ success: false, message: "Version not found" });
    }

    if (!version.file_data) {
      return res
        .status(404)
        .json({ success: false, message: "Version binary data not found" });
    }

    res.set("Content-Type", version.mime_type);
    res.set(
      "Content-Disposition",
      `inline; filename="v${version.version_number}_${version.original_name}"`,
    );
    res.send(version.file_data);
  } catch (error) {
    console.error("Download version error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to download version" });
  }
};

export default {
  getDocumentVersions,
  restoreDocumentVersion,
  downloadDocumentVersion,
};
