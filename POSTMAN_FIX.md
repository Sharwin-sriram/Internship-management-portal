# 🔧 Fix Postman Password Reset Request

## The Problem
You're getting 404 because:
1. URL has `%0A` (newline characters)
2. Body type is set to "none" instead of "raw JSON"
3. Missing Content-Type header

---

## ✅ Step-by-Step Fix

### Step 1: Clean the URL
**Delete everything in the URL field and type this exactly:**
```
http://localhost:9933/api/password-reset/request
```
⚠️ **Important:** No spaces, no Enter key at the end!

---

### Step 2: Set Request Method
Make sure it says **POST** (not GET)

---

### Step 3: Configure Body
1. Click on the **"Body"** tab
2. Select **"raw"** radio button (NOT "none")
3. In the dropdown next to "raw", select **"JSON"**
4. In the text area below, paste this:

```json
{
  "email": "test@example.com"
}
```

---

### Step 4: Add Headers (Optional - usually auto-added)
1. Click on **"Headers"** tab
2. Make sure you have:
   - Key: `Content-Type`
   - Value: `application/json`

---

### Step 5: Send Request
Click the blue **"Send"** button

---

## ✅ Expected Success Response

```json
{
  "success": true,
  "message": "If an account exists with this email, a reset link has been sent."
}
```

---

## 📋 Quick Copy-Paste

### For Request Body:
```json
{
  "email": "test@example.com"
}
```

---

## 🎯 All Password Reset Endpoints

### 1. Request Reset
```
POST http://localhost:9933/api/password-reset/request

Body (raw JSON):
{
  "email": "test@example.com"
}
```

### 2. Validate Token
```
POST http://localhost:9933/api/password-reset/validate

Body (raw JSON):
{
  "token": "YOUR_TOKEN_HERE"
}
```

### 3. Reset Password
```
POST http://localhost:9933/api/password-reset/reset

Body (raw JSON):
{
  "token": "YOUR_TOKEN_HERE",
  "newPassword": "NewPass@123",
  "confirmPassword": "NewPass@123"
}
```

---

## 🐛 Common Mistakes

❌ **Wrong:** Body type = "none"  
✅ **Right:** Body type = "raw" + "JSON"

❌ **Wrong:** URL with spaces or newlines  
✅ **Right:** Clean URL with no extra characters

❌ **Wrong:** GET method  
✅ **Right:** POST method

---

## 💡 Pro Tip

If you keep having issues with Postman Web, use the **API_TESTER.html** file instead:
1. Open `API_TESTER.html` in your browser
2. Click the test buttons
3. Everything works automatically!

---

## ✅ Verification

After fixing, you should see:
- Status: **200 OK** (not 404)
- Response with `"success": true`
- Check server terminal for the reset token

---

**Need help?** Open `API_TESTER.html` for an easier testing experience! 🚀
