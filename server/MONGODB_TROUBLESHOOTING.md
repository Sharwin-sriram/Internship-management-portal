# MongoDB Connection Issue - Troubleshooting

## Current Error
```
querySrv ECONNREFUSED _mongodb._tcp.internship.jkx84le.mongodb.net
```

This is a DNS resolution error when trying to connect to MongoDB Atlas.

## Possible Causes & Solutions

### 1. Network/Firewall Issue
- **Check your internet connection**
- **Check if your firewall is blocking MongoDB**
- Try disabling VPN if you're using one
- Check if your organization/ISP blocks MongoDB Atlas

### 2. MongoDB Atlas Cluster Paused
- Log into [MongoDB Atlas](https://cloud.mongodb.com/)
- Check if your cluster is paused (free tier clusters pause after inactivity)
- Click "Resume" if paused

### 3. DNS Resolution Problem
Try using the direct connection string instead of SRV:

**Current (SRV format):**
```
mongodb+srv://shivaji:DhjADQ3bLlhvvoxr@internship.jkx84le.mongodb.net/?appName=Internship
```

**Alternative (Direct format):**
```
mongodb://shivaji:DhjADQ3bLlhvvoxr@internship-shard-00-00.jkx84le.mongodb.net:27017,internship-shard-00-01.jkx84le.mongodb.net:27017,internship-shard-00-02.jkx84le.mongodb.net:27017/?ssl=true&replicaSet=atlas-xxxxx-shard-0&authSource=admin&retryWrites=true&w=majority
```

### 4. IP Whitelist
- Go to MongoDB Atlas → Network Access
- Make sure your IP is whitelisted
- Or add `0.0.0.0/0` to allow all IPs (for testing only)

### 5. Test Connection
Run the test script:
```bash
node test-mongodb.js
```

## Quick Fix: Use Local MongoDB

If you can't connect to Atlas, install MongoDB locally:

1. **Install MongoDB Community Edition**
   - Download from: https://www.mongodb.com/try/download/community
   - Or use Docker: `docker run -d -p 27017:27017 mongo`

2. **Update .env:**
```env
MONGODB_URI=mongodb://localhost:27017/internship_portal
```

3. **Restart server:**
```bash
npm run dev
```

## Alternative: Test Without Database

The password reset system can work with JSON file storage (already implemented as fallback). The tokens are stored in `data/passwordResets.json`.

The only MongoDB dependency is for:
- Finding users by email
- Updating user passwords

You can test the token generation and email sending without MongoDB by mocking the user lookup.

## Check MongoDB Atlas Status

1. Visit: https://status.mongodb.com/
2. Check if there are any ongoing incidents

## Contact Support

If none of these work:
- MongoDB Atlas Support: https://support.mongodb.com/
- Check MongoDB Community Forums: https://www.mongodb.com/community/forums/
