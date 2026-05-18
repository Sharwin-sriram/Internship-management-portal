# Postman Testing Guide - Internship Portal API

## 🚀 Getting Started

### Prerequisites
- Postman installed (Download from: https://www.postman.com/downloads/)
- Backend server running on `http://localhost:9933`

### Import the Collection
1. Open Postman
2. Click **Import** button (top left)
3. Select the file: `Internship_Portal_API.postman_collection.json`
4. Click **Import**

---

## 📋 Available Endpoints

### Base URL
```
http://localhost:9933
```

---

## 🧪 Test Scenarios

### 1. Health & Status Checks

#### ✅ Health Check
**Endpoint:** `GET /health`

**Purpose:** Verify the server is running

**Request:**
```
GET http://localhost:9933/health
```

**Expected Response (200 OK):**
```json
{
  "status": "ok",
  "timestamp": "2026-05-18T06:30:07.716Z"
}
```

---

#### ✅ API Test
**Endpoint:** `GET /api/test`

**Purpose:** Get list of available routes

**Request:**
```
GET http://localhost:9933/api/test
```

**Expected Response (200 OK):**
```json
{
  "message": "API is working",
  "timestamp": "2026-05-18T06:30:07.716Z",
  "routes": [
    "POST /api/password-reset/request",
    "POST /api/password-reset/validate",
    "POST /api/password-reset/reset"
  ]
}
```

---

### 2. Password Reset Flow

#### 📧 Step 1: Request Password Reset
**Endpoint:** `POST /api/password-reset/request`

**Purpose:** Request a password reset token

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "test@example.com"
}
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset link has been sent to your email."
}
```

**Error Responses:**

- **400 Bad Request** - Invalid email format:
```json
{
  "success": false,
  "message": "Invalid email format"
}
```

- **404 Not Found** - User not found:
```json
{
  "success": false,
  "message": "No user found with this email address"
}
```

**Note:** 
- Rate limited to 5 requests per 15 minutes per IP
- Email will only be sent if email service is configured
- Token expires in 1 hour

---

#### 🔍 Step 2: Validate Reset Token
**Endpoint:** `POST /api/password-reset/validate`

**Purpose:** Check if a reset token is valid

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "valid": true,
  "email": "test@example.com"
}
```

**Error Responses:**

- **400 Bad Request** - Token required:
```json
{
  "success": false,
  "message": "Token is required"
}
```

- **400 Bad Request** - Invalid token:
```json
{
  "success": false,
  "message": "Invalid or expired reset token"
}
```

- **400 Bad Request** - Token already used:
```json
{
  "success": false,
  "message": "This reset token has already been used"
}
```

---

#### 🔐 Step 3: Reset Password
**Endpoint:** `POST /api/password-reset/reset`

**Purpose:** Reset password using a valid token

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "newPassword": "NewPass@123",
  "confirmPassword": "NewPass@123"
}
```

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (@$!%*?&)

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Password has been reset successfully"
}
```

**Error Responses:**

- **400 Bad Request** - Missing fields:
```json
{
  "success": false,
  "message": "All fields are required"
}
```

- **400 Bad Request** - Passwords don't match:
```json
{
  "success": false,
  "message": "Passwords do not match"
}
```

- **400 Bad Request** - Password too short:
```json
{
  "success": false,
  "message": "Password must be at least 8 characters long"
}
```

- **400 Bad Request** - Weak password:
```json
{
  "success": false,
  "message": "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
}
```

---

## 🔄 Complete Test Flow

### Test the Full Password Reset Process

1. **Start with Health Check**
   ```
   GET http://localhost:9933/health
   ```
   ✅ Verify server is running

2. **Request Password Reset**
   ```
   POST http://localhost:9933/api/password-reset/request
   Body: { "email": "test@example.com" }
   ```
   ✅ Should return success message
   
   **Note:** Since email service is not configured, check the server logs for the reset token:
   ```
   [INFO] Password reset token generated: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. **Copy the Token from Server Logs**
   - Look in the terminal where the backend is running
   - Find the JWT token in the logs

4. **Validate the Token**
   ```
   POST http://localhost:9933/api/password-reset/validate
   Body: { "token": "your-token-here" }
   ```
   ✅ Should return valid: true

5. **Reset Password**
   ```
   POST http://localhost:9933/api/password-reset/reset
   Body: {
     "token": "your-token-here",
     "newPassword": "NewPass@123",
     "confirmPassword": "NewPass@123"
   }
   ```
   ✅ Should return success message

6. **Try Using the Same Token Again**
   ```
   POST http://localhost:9933/api/password-reset/validate
   Body: { "token": "same-token" }
   ```
   ❌ Should fail with "token already used" error

---

## 🐛 Troubleshooting

### Server Not Responding
- Check if backend is running: `http://localhost:9933/health`
- Verify port 9933 is not blocked
- Check server terminal for errors

### Email Not Received
- Email service is not configured by default
- Check server logs for the reset token instead
- To enable emails, configure Gmail App Password in `.env`

### Token Validation Fails
- Tokens expire after 1 hour
- Tokens can only be used once
- Check if token is complete (JWT tokens are long)

### Password Reset Fails
- Verify password meets all requirements
- Check that passwords match
- Ensure token is valid and not expired

---

## 📊 Response Status Codes

| Code | Meaning | When It Happens |
|------|---------|-----------------|
| 200 | OK | Request successful |
| 400 | Bad Request | Invalid input, validation error |
| 404 | Not Found | Resource not found (e.g., user email) |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

---

## 🔧 Postman Tips

### Save Responses
- Click **Save Response** to compare with future tests
- Use **Examples** to document expected responses

### Use Variables
- Set `{{baseUrl}}` variable to `http://localhost:9933`
- Save tokens in variables for reuse:
  ```javascript
  // In Tests tab
  pm.environment.set("resetToken", pm.response.json().token);
  ```

### Create Test Scripts
Add to the **Tests** tab:
```javascript
// Check status code
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

// Check response structure
pm.test("Response has success field", function () {
    pm.expect(pm.response.json()).to.have.property('success');
});
```

### Environment Setup
1. Create a new environment: **Internship Portal - Local**
2. Add variables:
   - `baseUrl`: `http://localhost:9933`
   - `resetToken`: (leave empty, will be set by tests)

---

## 📝 Test Checklist

- [ ] Health check returns 200 OK
- [ ] API test endpoint lists routes
- [ ] Can request password reset with valid email
- [ ] Invalid email format returns 400 error
- [ ] Can validate a fresh reset token
- [ ] Invalid token returns error
- [ ] Can reset password with valid token
- [ ] Password validation works (length, complexity)
- [ ] Passwords must match
- [ ] Used token cannot be reused
- [ ] Rate limiting works (try 6 requests quickly)

---

## 🎯 Next Steps

1. **Test with MongoDB**: Ensure database connection is working
2. **Configure Email**: Set up Gmail App Password for email testing
3. **Add More Endpoints**: Expand API with auth, user management, etc.
4. **Add Authentication**: Test JWT token-based auth flows

---

## 📞 Quick Reference

### Server Info
- **URL**: http://localhost:9933
- **Status**: Check `/health` endpoint
- **Logs**: Check terminal where `npm run dev` is running

### Common Test Data
```json
{
  "email": "test@example.com",
  "password": "Test@1234",
  "newPassword": "NewPass@123"
}
```

---

Happy Testing! 🚀
