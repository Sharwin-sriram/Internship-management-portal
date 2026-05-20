import User from '../models/user.js';
import { logAuthEvent, AuthEventType, AuthEventStatus } from '../services/authLog.service.js';

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required.',
      });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      await logAuthEvent({
        userId: null,
        eventType: AuthEventType.PASSWORD_CHANGED,
        status: AuthEventStatus.FAILED,
        req,
        metadata: { reason: 'User not found' },
      });
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      await logAuthEvent({
        userId: user._id,
        eventType: AuthEventType.PASSWORD_CHANGED,
        status: AuthEventStatus.FAILED,
        req,
        metadata: { reason: 'Incorrect current password' },
      });
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }

    user.password = newPassword;
    await user.save();

    await logAuthEvent({
      userId: user._id,
      eventType: AuthEventType.PASSWORD_CHANGED,
      status: AuthEventStatus.SUCCESS,
      req,
      metadata: { email: user.email },
    });

    res.status(200).json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    await logAuthEvent({
      userId: req.user?._id || null,
      eventType: AuthEventType.PASSWORD_CHANGED,
      status: AuthEventStatus.FAILED,
      req,
      metadata: { error: error.message },
    });
    res.status(500).json({ success: false, message: 'Server error while changing password.' });
  }
};

export const changeEmail = async (req, res) => {
  try {
    const { currentPassword, newEmail } = req.body;

    if (!currentPassword || !newEmail) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new email are required.',
      });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      await logAuthEvent({
        userId: null,
        eventType: AuthEventType.EMAIL_CHANGED,
        status: AuthEventStatus.FAILED,
        req,
        metadata: { reason: 'User not found' },
      });
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      await logAuthEvent({
        userId: user._id,
        eventType: AuthEventType.EMAIL_CHANGED,
        status: AuthEventStatus.FAILED,
        req,
        metadata: { reason: 'Incorrect current password' },
      });
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }

    const existing = await User.findOne({ email: newEmail.toLowerCase() });
    if (existing && existing._id.toString() !== user._id.toString()) {
      await logAuthEvent({
        userId: user._id,
        eventType: AuthEventType.EMAIL_CHANGED,
        status: AuthEventStatus.FAILED,
        req,
        metadata: { reason: 'Email already in use', attemptedEmail: newEmail },
      });
      return res.status(400).json({ success: false, message: 'Email is already in use.' });
    }

    const previousEmail = user.email;
    user.email = newEmail.toLowerCase();
    user.emailVerified = false;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save();

    await logAuthEvent({
      userId: user._id,
      eventType: AuthEventType.EMAIL_CHANGED,
      status: AuthEventStatus.SUCCESS,
      req,
      metadata: { previousEmail, newEmail },
    });

    res.status(200).json({ success: true, message: 'Email updated successfully.' });
  } catch (error) {
    await logAuthEvent({
      userId: req.user?._id || null,
      eventType: AuthEventType.EMAIL_CHANGED,
      status: AuthEventStatus.FAILED,
      req,
      metadata: { error: error.message },
    });
    res.status(500).json({ success: false, message: 'Server error while updating email.' });
  }
};

export const reauthenticate = async (req, res) => {
  try {
    const { currentPassword } = req.body;

    if (!currentPassword) {
      return res.status(400).json({ success: false, message: 'Current password is required.' });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      await logAuthEvent({
        userId: null,
        eventType: AuthEventType.REAUTH_FAILED,
        status: AuthEventStatus.FAILED,
        req,
        metadata: { reason: 'User not found' },
      });
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      await logAuthEvent({
        userId: user._id,
        eventType: AuthEventType.REAUTH_FAILED,
        status: AuthEventStatus.FAILED,
        req,
        metadata: { reason: 'Incorrect current password' },
      });
      return res.status(401).json({ success: false, message: 'Re-authentication failed.' });
    }

    await logAuthEvent({
      userId: user._id,
      eventType: AuthEventType.REAUTH_SUCCESS,
      status: AuthEventStatus.SUCCESS,
      req,
      metadata: { email: user.email },
    });

    res.status(200).json({ success: true, message: 'Re-authentication successful.' });
  } catch (error) {
    await logAuthEvent({
      userId: req.user?._id || null,
      eventType: AuthEventType.REAUTH_FAILED,
      status: AuthEventStatus.FAILED,
      req,
      metadata: { error: error.message },
    });
    res.status(500).json({ success: false, message: 'Server error during re-authentication.' });
  }
};
