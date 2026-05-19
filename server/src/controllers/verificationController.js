import DocumentVerification from '../models/DocumentVerification.js';
import Document from '../models/Document.js';

// @desc    Get verification history for a document
// @route   GET /api/documents/:id/verifications
// @access  Private
export const getVerificationHistory = async (req, res) => {
  try {
    const verifications = await DocumentVerification.find({ document: req.params.id })
      .populate('student', 'name email')
      .populate('verified_by', 'name email role')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: verifications.length,
      data: verifications
    });
  } catch (error) {
    console.error('Get verification history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch verification history'
    });
  }
};

// @desc    Verify or update document status
// @route   PUT /api/documents/:id/verify
// @access  Private (Coordinator/Admin)
export const updateVerificationStatus = async (req, res) => {
  try {
    const { status, comments, rejection_reason, resubmission_required, resubmission_deadline } = req.body;
    
    if (!['pending', 'verified', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be pending, verified, or rejected.'
      });
    }

    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Update document verified boolean
    document.is_verified = (status === 'verified');
    await document.save();

    // Create a new verification log entry
    const verificationLog = await DocumentVerification.create({
      document: document._id,
      student: document.user, // User who uploaded it
      status: status,
      verified_by: req.user._id,
      verification_date: new Date(),
      comments: comments || null,
      rejection_reason: status === 'rejected' ? rejection_reason : null,
      resubmission_required: resubmission_required || false,
      resubmission_deadline: resubmission_deadline || null
    });

    res.status(200).json({
      success: true,
      message: `Document status updated to ${status}`,
      data: verificationLog
    });
  } catch (error) {
    console.error('Update verification status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update document verification status'
    });
  }
};

export default { getVerificationHistory, updateVerificationStatus };
