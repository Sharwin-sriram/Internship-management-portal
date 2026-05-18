import AuthLog from '../models/authLog.model.js';
import logger from '../utils/logger.js';

export const AuthEventType = {
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILED: 'LOGIN_FAILED',
  LOGOUT: 'LOGOUT',
  PASSWORD_CHANGED: 'PASSWORD_CHANGED',
  EMAIL_CHANGED: 'EMAIL_CHANGED',
  REAUTH_SUCCESS: 'REAUTH_SUCCESS',
  REAUTH_FAILED: 'REAUTH_FAILED',
};

export const AuthEventStatus = {
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
};

function getIpAddress(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.connection?.remoteAddress || null;
}

export async function logAuthEvent({ userId = null, eventType, status = AuthEventStatus.SUCCESS, req, metadata = {} }) {
  try {
    const ipAddress = getIpAddress(req);
    const userAgent = req.headers['user-agent'] || null;

    const authLog = await AuthLog.create({
      userId,
      eventType,
      status,
      ipAddress,
      userAgent,
      metadata,
      timestamp: new Date(),
    });

    logger.info(`Auth event logged: ${eventType} (${status}) for user ${userId || 'unknown'} from ${ipAddress}`);
    return authLog;
  } catch (error) {
    logger.error(`Failed to log auth event: ${error.message}`);
    return null;
  }
}
