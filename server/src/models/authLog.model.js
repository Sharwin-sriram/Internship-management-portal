import mongoose from 'mongoose';

const authLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    eventType: {
      type: String,
      required: true,
      enum: [
        'LOGIN_SUCCESS',
        'LOGIN_FAILED',
        'LOGOUT',
        'PASSWORD_CHANGED',
        'EMAIL_CHANGED',
        'REAUTH_SUCCESS',
        'REAUTH_FAILED',
      ],
    },
    status: {
      type: String,
      required: true,
      enum: ['SUCCESS', 'FAILED'],
      default: 'SUCCESS',
    },
    ipAddress: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
    timestamp: {
      type: Date,
      default: () => new Date(),
      required: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    collection: 'authlogs',
    strict: true,
  },
);

const AuthLog = mongoose.model('AuthLog', authLogSchema);

export default AuthLog;
