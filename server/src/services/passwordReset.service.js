const PasswordReset = require('../models/passwordReset.model');
const emailService = require('./email.service');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, MONGODB_URI } = require('../config/env');
const logger = require('../utils/logger');

// Simple MongoDB connection helper
let db = null;
let client = null;

async function getDb() {
  if (db) return db;
  
  try {
    const { MongoClient } = require('mongodb');
    client = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });
    await client.connect();
    db = client.db();
    logger.info('MongoDB connected for password reset service');
    return db;
  } catch (error) {
    logger.error(`MongoDB connection failed: ${error.message}`);
    throw new Error('Database connection failed. Please try again later.');
  }
}

exports.requestPasswordReset = async (email) => {
  try {
    // Find user by email in MongoDB
    const database = await getDb();
    const user = await database.collection('users').findOne({ email });
    
    if (!user) {
      // Don't reveal if user exists or not for security
      logger.warn(`Password reset requested for non-existent email: ${email}`);
      return { 
        success: true, 
        message: 'If an account exists with this email, a reset link has been sent.' 
      };
    }

    // Delete any existing reset tokens for this user
    const userId = user._id.toString();
    await PasswordReset.deleteByUserId(userId);

    // Create new reset token
    const resetToken = await PasswordReset.create(userId, email);

    // Generate JWT for additional security
    const jwtToken = jwt.sign(
      { 
        resetId: resetToken.id,
        userId: userId,
        token: resetToken.token 
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Send email with reset link
    try {
      await emailService.sendPasswordResetEmail(
        email, 
        jwtToken, 
        user.name || user.email
      );
      
      logger.info(`Password reset email sent to user ${userId}`);
      
      return { 
        success: true, 
        message: 'Password reset link has been sent to your email.' 
      };
    } catch (error) {
      logger.error(`Failed to send reset email: ${error.message}`);
      throw new Error('Failed to send password reset email. Please try again later.');
    }
  } catch (error) {
    logger.error(`Password reset request error: ${error.message}`);
    throw error;
  }
};

exports.validateResetToken = async (token) => {
  try {
    // Verify JWT
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if reset token exists and is valid
    const resetToken = await PasswordReset.findByToken(decoded.token);
    
    if (!resetToken) {
      throw new Error('Invalid or expired reset token');
    }

    if (resetToken.used) {
      throw new Error('This reset token has already been used');
    }

    // Verify user still exists
    const database = await getDb();
    const { ObjectId } = require('mongodb');
    const user = await database.collection('users').findOne({ _id: new ObjectId(resetToken.userId) });
    if (!user) {
      throw new Error('User not found');
    }

    return { 
      valid: true, 
      userId: resetToken.userId,
      email: resetToken.email 
    };
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid reset token');
    }
    if (error.name === 'TokenExpiredError') {
      throw new Error('Reset token has expired');
    }
    throw error;
  }
};

exports.resetPassword = async (token, newPassword) => {
  // Validate token first
  const validation = await this.validateResetToken(token);
  
  if (!validation.valid) {
    throw new Error('Invalid or expired reset token');
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update user password in MongoDB
  const database = await getDb();
  const { ObjectId } = require('mongodb');
  const result = await database.collection('users').updateOne(
    { _id: new ObjectId(validation.userId) },
    { 
      $set: { 
        password: hashedPassword,
        passwordChangedAt: new Date()
      }
    }
  );

  if (result.matchedCount === 0) {
    throw new Error('Failed to update password');
  }

  // Decode JWT to get the actual token
  const decoded = jwt.verify(token, JWT_SECRET);
  
  // Mark token as used
  await PasswordReset.markAsUsed(decoded.token);

  // Send confirmation email
  try {
    await emailService.sendPasswordResetConfirmation(
      validation.email,
      user.name || user.email
    );
  } catch (error) {
    logger.error(`Failed to send confirmation email: ${error.message}`);
    // Don't fail the password reset if confirmation email fails
  }

  logger.info(`Password successfully reset for user ${validation.userId}`);

  return { 
    success: true, 
    message: 'Password has been reset successfully. You can now login with your new password.' 
  };
};

exports.cleanupExpiredTokens = async () => {
  const count = await PasswordReset.cleanupExpired();
  logger.info(`Cleaned up ${count} expired password reset tokens`);
  return count;
};
