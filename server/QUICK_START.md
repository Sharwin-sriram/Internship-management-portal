# Password Reset - Quick Start

## ✅ Server is Running!

Your server is now running on port **9933** with the password reset system installed.

## 🔧 Next Steps

### 1. Configure Email Service (Required for sending emails)

Update your `.env` file with email credentials:

```env
# For Gmail:
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password-here
EMAIL_FROM=noreply@internshipportal.com
```

**To get Gmail App Password:**
1. Go to Google Account → Security
2. Enable 2-Step Verification
3. Go to App Passwords
4. Generate password for "Mail"
5. Copy the 16-character password to EMAIL_PASS

### 2. Test the API

**Request Password Reset:**
```bash
curl -X POST http://localhost:9933/api/password-reset/request \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\"}"
```

**Reset Password:**
```bash
curl -X POST http://localhost:9933/api/password-reset/reset \
  -H "Content-Type: application/json" \
  -d "{
    \"token\":\"your-jwt-token-from-email\",
    \"newPassword\":\"NewSecure123!\",
    \"confirmPassword\":\"NewSecure123!\"
  }"
```

## 📡 API Endpoints

- `POST /api/password-reset/request` - Request reset link
- `POST /api/password-reset/validate` - Validate token
- `POST /api/password-reset/reset` - Reset password
- `GET /health` - Health check

## 🔒 Security Features

✅ JWT-based token validation  
✅ 1-hour token expiry  
✅ One-time use tokens  
✅ Rate limiting (5 requests/15 min)  
✅ Password strength validation  
✅ MongoDB integration  
✅ Automatic token cleanup  

## 📚 Full Documentation

See `PASSWORD_RESET_SETUP.md` for complete documentation.

## ⚠️ Current Status

- ✅ Server running on port 9933
- ✅ MongoDB connected
- ⚠️ Email service not configured (update .env to enable)
- ✅ Password reset API ready

## 🐛 Troubleshooting

**Email not sending?**
- Check EMAIL_USER and EMAIL_PASS in .env
- Use App Password for Gmail (not regular password)
- Restart server after updating .env

**Server crashed?**
- Check MongoDB connection string
- Ensure all dependencies installed: `npm install`
- Check logs for specific errors
