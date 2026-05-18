# 🚀 Postman Quick Start Guide

## Step 1: Import Collection
1. Open Postman
2. Click **Import** → Select `Internship_Portal_API.postman_collection.json`
3. Collection will appear in left sidebar

## Step 2: Quick Tests

### ✅ Test 1: Health Check
```
GET http://localhost:9933/health
```
Click **Send** → Should return `{"status":"ok"}`

---

### ✅ Test 2: API Info
```
GET http://localhost:9933/api/test
```
Click **Send** → Should list available routes

---

### ✅ Test 3: Password Reset Request
```
POST http://localhost:9933/api/password-reset/request
```

**Headers:**
- Content-Type: `application/json`

**Body (raw JSON):**
```json
{
  "email": "test@example.com"
}
```

Click **Send** → Should return success message

**⚠️ Important:** Check your backend terminal for the reset token since email is not configured!

---

### ✅ Test 4: Validate Token
```
POST http://localhost:9933/api/password-reset/validate
```

**Headers:**
- Content-Type: `application/json`

**Body (raw JSON):**
```json
{
  "token": "PASTE_TOKEN_FROM_SERVER_LOGS_HERE"
}
```

Click **Send** → Should return `{"valid": true}`

---

### ✅ Test 5: Reset Password
```
POST http://localhost:9933/api/password-reset/reset
```

**Headers:**
- Content-Type: `application/json`

**Body (raw JSON):**
```json
{
  "token": "PASTE_TOKEN_HERE",
  "newPassword": "NewPass@123",
  "confirmPassword": "NewPass@123"
}
```

Click **Send** → Should return success message

---

## 📋 Quick Copy-Paste Requests

### Health Check
```
GET http://localhost:9933/health
```

### Request Reset
```
POST http://localhost:9933/api/password-reset/request
Content-Type: application/json

{
  "email": "test@example.com"
}
```

### Validate Token
```
POST http://localhost:9933/api/password-reset/validate
Content-Type: application/json

{
  "token": "YOUR_TOKEN_HERE"
}
```

### Reset Password
```
POST http://localhost:9933/api/password-reset/reset
Content-Type: application/json

{
  "token": "YOUR_TOKEN_HERE",
  "newPassword": "NewPass@123",
  "confirmPassword": "NewPass@123"
}
```

---

## 🎯 Expected Results

| Endpoint | Method | Expected Status | Expected Response |
|----------|--------|----------------|-------------------|
| /health | GET | 200 | `{"status":"ok"}` |
| /api/test | GET | 200 | Routes list |
| /api/password-reset/request | POST | 200 | Success message |
| /api/password-reset/validate | POST | 200 | `{"valid":true}` |
| /api/password-reset/reset | POST | 200 | Success message |

---

## 🐛 Common Issues

### ❌ Connection Refused
**Problem:** Can't connect to server  
**Solution:** Make sure backend is running (`npm run dev` in server folder)

### ❌ 404 Not Found
**Problem:** Wrong URL  
**Solution:** Check URL is `http://localhost:9933` (not 3000)

### ❌ 400 Bad Request
**Problem:** Invalid data format  
**Solution:** 
- Check Content-Type header is `application/json`
- Verify JSON syntax is correct
- Check required fields are present

### ❌ Token Not Working
**Problem:** Token validation fails  
**Solution:**
- Copy complete token from server logs
- Tokens expire in 1 hour
- Tokens can only be used once

---

## 💡 Pro Tips

1. **Save Responses**: Click "Save Response" to compare later
2. **Use Collections**: Organize requests in folders
3. **Environment Variables**: Set `{{baseUrl}}` = `http://localhost:9933`
4. **Check Server Logs**: Terminal shows detailed info about requests
5. **Test Scripts**: Add assertions in the "Tests" tab

---

## 📞 Need Help?

- Check `POSTMAN_TESTING_GUIDE.md` for detailed documentation
- Look at server terminal for error messages
- Verify server is running: `http://localhost:9933/health`

---

**Ready to test!** Start with the Health Check and work your way down. 🎉
