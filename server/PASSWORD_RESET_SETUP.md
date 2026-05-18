# Password Reset System - Setup Guide

## Overview
Secure password reset implementation with JWT-based token validation, email service integration, and automatic token expiry.

## Features
- ✅ One-time use tokens with 1-hour expiry (TTL)
- ✅ JWT-based token validation for additional security
- ✅ Rate limiting (5 requests per 15 minutes)
- ✅ Email service integration (SMTP/Gmail/AWS SES)
- ✅ Automatic cleanup of expired tokens
- ✅ Password strength validation
- ✅ Confirmation emails
- ✅ Security best practices

## Installation

1. Install the required dependency:
```bash
cd server
npm install nodemailer
```

## Configuration

### Email Service Setup

#### Option 1: Gmail SMTP
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account Settings → Security
   - Enable 2-Step Verification
   - Go to App Passwords
   - Generate a new app password for "Mail"
3. Update `.env`:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-char-app-password
EMAIL_FROM=noreply@internshipportal.com
```

#### Option 2: AWS SES
Update `src/services/email.service.js` transporter:
```javascript
const transporter = nodemailer.createTransport({
  host: 'email-smtp.us-east-1.amazonaws.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.AWS_SES_SMTP_USERNAME,
    pass: process.env.AWS_SES_SMTP_PASSWORD
  }
});
```

#### Option 3: Other SMTP Services
- **SendGrid**: `smtp.sendgrid.net:587`
- **Mailgun**: `smtp.mailgun.org:587`
- **Outlook**: `smtp-mail.outlook.com:587`

### Environment Variables
Update `server/.env`:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@internshipportal.com
FRONTEND_URL=http://localhost:3000
```

## API Endpoints

### 1. Request Password Reset
```http
POST /api/password-reset/request
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Password reset link has been sent to your email."
  }
}
```

**Rate Limit:** 5 requests per 15 minutes per IP

### 2. Validate Reset Token
```http
POST /api/password-reset/validate
Content-Type: application/json

{
  "token": "jwt-token-from-email"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "userId": "123",
    "email": "user@example.com"
  }
}
```

### 3. Reset Password
```http
POST /api/password-reset/reset
Content-Type: application/json

{
  "token": "jwt-token-from-email",
  "newPassword": "NewSecure123!",
  "confirmPassword": "NewSecure123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Password has been reset successfully."
  }
}
```

## Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (@$!%*?&)

## Security Features

### 1. Token Security
- Cryptographically secure random tokens (32 bytes)
- JWT wrapper for additional validation
- One-time use tokens (marked as used after reset)
- 1-hour expiry (TTL)

### 2. Rate Limiting
- 5 requests per 15 minutes per IP address
- Prevents brute force attacks

### 3. Email Obfuscation
- Doesn't reveal if email exists in system
- Same response for existing and non-existing users

### 4. Password Hashing
- bcrypt with salt rounds
- Secure password storage

### 5. Automatic Cleanup
- Background job runs every hour
- Removes expired tokens automatically

## Frontend Integration

### Reset Password Flow

1. **Request Reset Page:**
```javascript
const requestReset = async (email) => {
  const response = await fetch('http://localhost:3001/api/password-reset/request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  return response.json();
};
```

2. **Reset Password Page:**
```javascript
const resetPassword = async (token, newPassword, confirmPassword) => {
  const response = await fetch('http://localhost:3001/api/password-reset/reset', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword, confirmPassword })
  });
  return response.json();
};

// Get token from URL
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');
```

## Testing

### Test Email Service Connection
```javascript
// Add to server startup or create a test endpoint
const emailService = require('./src/services/email.service');
await emailService.verifyConnection();
```

### Manual Testing Flow
1. Start the server: `npm run dev`
2. Request password reset:
```bash
curl -X POST http://localhost:3001/api/password-reset/request \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```
3. Check email for reset link
4. Extract token from URL
5. Reset password:
```bash
curl -X POST http://localhost:3001/api/password-reset/reset \
  -H "Content-Type: application/json" \
  -d '{
    "token":"your-jwt-token",
    "newPassword":"NewSecure123!",
    "confirmPassword":"NewSecure123!"
  }'
```

## File Structure
```
server/
├── src/
│   ├── controllers/
│   │   └── passwordReset.controller.js    # Request handlers
│   ├── services/
│   │   ├── passwordReset.service.js       # Business logic
│   │   └── email.service.js               # Email sending
│   ├── models/
│   │   └── passwordReset.model.js         # Token storage
│   ├── routes/
│   │   └── passwordReset.routes.js        # API routes
│   ├── middlewares/
│   │   └── rateLimiter.middleware.js      # Rate limiting
│   └── utils/
│       └── scheduler.js                    # Background cleanup
└── data/
    └── passwordResets.json                 # Token storage
```

## Troubleshooting

### Email Not Sending
1. Check email credentials in `.env`
2. Verify SMTP settings
3. Check server logs for errors
4. Test connection: `await emailService.verifyConnection()`

### Gmail "Less Secure Apps" Error
- Use App Passwords instead of regular password
- Enable 2-factor authentication first

### Token Expired
- Tokens expire after 1 hour
- Request a new reset link

### Rate Limit Exceeded
- Wait 15 minutes before trying again
- Or adjust rate limit in `passwordReset.routes.js`

## Production Considerations

1. **Use Environment Variables:**
   - Never commit `.env` file
   - Use secure secret management

2. **HTTPS Only:**
   - Always use HTTPS in production
   - Update `FRONTEND_URL` to https://

3. **Email Service:**
   - Use dedicated email service (SendGrid, AWS SES)
   - Set up SPF, DKIM, DMARC records

4. **Database:**
   - Consider using MongoDB with TTL indexes
   - Current implementation uses JSON file storage

5. **Monitoring:**
   - Log all password reset attempts
   - Monitor for suspicious activity
   - Set up alerts for rate limit violations

## Migration to MongoDB (Optional)

If you want to use MongoDB instead of JSON files:

```javascript
// passwordReset.model.js with Mongoose
const mongoose = require('mongoose');

const passwordResetSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  email: { type: String, required: true },
  token: { type: String, required: true, unique: true },
  used: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now, expires: 3600 } // TTL: 1 hour
});

module.exports = mongoose.model('PasswordReset', passwordResetSchema);
```

## Support
For issues or questions, check the logs in `server/logs/` or contact the development team.
