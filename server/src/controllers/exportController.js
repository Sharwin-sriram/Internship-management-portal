import { createDocumentZipExport, cleanupOldExports } from '../services/zipExportService.js';

// @desc    Export documents as ZIP
// @route   POST /api/exports
// @access  Private (Coordinator/Admin)
export const exportDocuments = async (req, res) => {
  try {
    const { batch, department, doc_type, is_verified } = req.body;
    
    // Create filters object
    const filters = {};
    if (batch) filters.batch = batch;
    if (department) filters.department = department;
    if (doc_type) filters.doc_type = doc_type;
    if (is_verified !== undefined) filters.is_verified = is_verified;

    // Trigger ZIP export
    const exportData = await createDocumentZipExport(filters);

    res.status(200).json({
      success: true,
      message: 'Document export generated successfully',
      data: exportData
    });
  } catch (error) {
    console.error('Export documents error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate document export',
    });
  }
};

// @desc    Cleanup old exports manually
// @route   DELETE /api/exports/cleanup
// @access  Private (Admin)
export const cleanupExports = async (req, res) => {
  try {
    const retentionDays = req.query.days ? parseInt(req.query.days) : 7;
    await cleanupOldExports(retentionDays);
    
    res.status(200).json({
      success: true,
      message: `Cleaned up exports older than ${retentionDays} days.`
    });
  } catch (error) {
    console.error('Cleanup exports error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cleanup old exports',
    });
  }
};

export default { exportDocuments, cleanupExports };
