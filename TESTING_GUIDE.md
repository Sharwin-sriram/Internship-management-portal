# Testing Guide - Internship Management Portal

## 🚀 Servers Running

### Frontend (Next.js)
- **URL**: http://localhost:3000
- **Status**: ✅ Running
- **Framework**: Next.js 16.2.6 with Turbopack

### Backend (Express)
- **URL**: http://localhost:9933
- **Status**: ✅ Running
- **Environment**: Development

---

## 📋 Test Scenarios

### 1. Homepage Test
1. Open your browser and go to: **http://localhost:3000**
2. You should see the InternHub landing page
3. Check that the header displays "InternHub" logo
4. Verify navigation links are visible

### 2. Registration Test
1. Click "Get started" or navigate to: **http://localhost:3000/register**
2. Test Student Registration:
   - Select "🎓 Student" role
   - Fill in:
     - Full Name: `Test Student`
     - Email: `student@test.com`
     - Password: `Test@1234`
     - Confirm Password: `Test@1234`
   - Click "Create account"
   - **Expected**: Success message and redirect to login

3. Test Company Registration:
   - Select "🏢 Company" role
   - Fill in:
     - Contact Name: `John Doe`
     - Company Name: `Test Corp`
     - Email: `company@test.com`
     - Password: `Test@1234`
     - Confirm Password: `Test@1234`
   - Click "Create account"
   - **Expected**: Success message and redirect to login

### 3. Login Test
1. Navigate to: **http://localhost:3000/login**
2. Try logging in with the account you just created:
   - Email: `student@test.com`
   - Password: `Test@1234`
   - Click "Sign in"
   - **Expected**: Redirect to dashboard

### 4. Dashboard Test
1. After successful login, you should be at: **http://localhost:3000/dashboard**
2. Verify:
   - User name appears in header
   - "Sign out" button is visible
   - Dashboard content is displayed

### 5. Logout Test
1. Click "Sign out" button in the header
2. **Expected**: Redirect to homepage
3. Verify you can't access dashboard without logging in

### 6. Backend API Tests

#### Health Check
```bash
curl http://localhost:9933/health
```
**Expected Response:**
```json
{"status":"ok","timestamp":"2026-05-18T..."}
```

#### API Test Endpoint
```bash
curl http://localhost:9933/api/test
```
**Expected Response:**
```json
{
  "message": "API is working",
  "timestamp": "2026-05-18T...",
  "routes": [
    "POST /api/password-reset/request",
    "POST /api/password-reset/validate",
    "POST /api/password-reset/reset"
  ]
}
```

---

## 🐛 Known Issues

### Email Service
- **Status**: ⚠️ Not configured
- **Impact**: Password reset emails won't be sent
- **Fix**: Update `.env` file with valid Gmail credentials:
  ```
  EMAIL_USER=your-email@gmail.com
  EMAIL_PASS=your-app-password
  ```
  Note: Use Gmail App Password, not your regular password

### Database
- **Status**: ⚠️ MongoDB connection may need verification
- **Connection String**: Check `MONGODB_URI` in `.env` file
- **Test**: Try registering a user to verify database connectivity

---

## 🔍 Debugging Tips

### Check Server Logs
- **Backend logs**: Check the terminal where `npm run dev` is running in the `server` folder
- **Frontend logs**: Check the terminal where `npm run dev` is running in the `client` folder
- **Browser console**: Press F12 in your browser to see client-side errors

### Common Issues

1. **Port Already in Use**
   - Backend (9933): Stop any other process using this port
   - Frontend (3000): Stop any other Next.js apps

2. **CORS Errors**
   - Backend has CORS enabled for all origins
   - Check browser console for specific errors

3. **Registration/Login Not Working**
   - Check MongoDB connection in backend logs
   - Verify `MONGODB_URI` in `.env` file
   - Check browser Network tab (F12) for API responses

---

## 📝 Test Checklist

- [ ] Homepage loads successfully
- [ ] Can navigate to registration page
- [ ] Can register as a student
- [ ] Can register as a company
- [ ] Can navigate to login page
- [ ] Can login with registered account
- [ ] Dashboard loads after login
- [ ] User info displays in header
- [ ] Can logout successfully
- [ ] Backend health endpoint responds
- [ ] Backend test endpoint responds

---

## 🎯 Next Steps After Testing

1. **If everything works**: Start building additional features
2. **If registration/login fails**: Check MongoDB connection
3. **If you need password reset**: Configure email service
4. **For production**: Update environment variables and security settings

---

## 📞 Quick Commands

### Stop Servers
You can stop the servers by pressing `Ctrl+C` in their respective terminals

### Restart Servers
```bash
# Backend
cd server
npm run dev

# Frontend
cd client
npm run dev
```

### View Logs
Check the terminal windows where the servers are running

---

Happy Testing! 🚀
