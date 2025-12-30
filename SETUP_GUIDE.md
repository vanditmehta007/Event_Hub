# Admin Authentication Setup Guide

## Quick Start

### 1. Update Your .env File

Add these variables to your `server/.env` file:

```env
# Admin Configuration
ADMIN_EMAIL=vanditmehta7116@gmail.com
ADMIN_SECRET=your-very-secure-random-secret-key-minimum-32-characters-long

# Admin Dashboard URL (where approval emails will link to)
ADMIN_DASHBOARD_URL=http://localhost:3000

# Email Configuration (Gmail)
EMAIL_USER=your-gmail-account@gmail.com
EMAIL_PASS=your-app-specific-password

# Existing variables
MONGO_URI=mongodb+srv://your-mongo-uri
JWT_SECRET=your-jwt-secret
NODE_ENV=development
```

### 2. Generate ADMIN_SECRET

Generate a secure admin secret using Node.js:

```bash
# In your terminal
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and paste it as your `ADMIN_SECRET`.

### 3. Gmail Setup (Email Configuration)

#### Enable Gmail App Password:
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Factor Authentication if not already enabled
3. Go to App Passwords (you'll find it under Security)
4. Select Mail and Windows Computer (or your setup)
5. Generate and copy the app password
6. Use this as your `EMAIL_PASS` (not your Gmail password)

### 4. Hardcoded Admin Email

The admin email is set to: **`vanditmehta7116@gmail.com`**

To change it, you have two options:

**Option A: Via Environment Variable (Recommended)**
```env
ADMIN_EMAIL=your-new-admin-email@gmail.com
```

**Option B: Update the code directly**
Edit `server/config/adminAuth.js`:
```javascript
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'your-new-admin-email@gmail.com';
```

### 5. Test the Setup

#### Test User Registration:
```bash
curl -X POST http://localhost:8000/uregister \
  -H "Content-Type: application/json" \
  -d '{
    "uname": "Test User",
    "uemail": "testuser@example.com",
    "upassword": "password123",
    "usapid": "12345678901",
    "udepartment": "CSE",
    "uphonenumber": "9876543210"
  }'
```

Expected Response:
```json
{
  "success": true,
  "message": "Registration submitted. Admin approval is required before you can login.",
  "user": {
    "id": "...",
    "uname": "Test User",
    "uemail": "testuser@example.com"
  }
}
```

**Check your admin email** - you should receive an approval request.

#### Get Pending Approvals:
```bash
curl http://localhost:8000/admin/pending-approvals \
  -H "x-admin-secret: your-admin-secret-from-env"
```

#### Approve a Request:
```bash
curl -X POST http://localhost:8000/admin/approve/TOKEN_FROM_EMAIL \
  -H "x-admin-secret: your-admin-secret-from-env"
```

## Features

### Each Authentication Action Requires Admin Approval:
- ✅ User Registration
- ✅ User Login (after each login attempt)
- ✅ Club Registration
- ✅ Club Login (after each login attempt)

### Admin Controls:
- View all pending approval requests
- Approve with one click
- Reject with optional reason
- View approval history
- Admin email is hardcoded as: `vanditmehta7116@gmail.com`

### Email Notifications:
- Admin receives approval requests with user/club details
- Users/Clubs notified when approved or rejected
- All emails include approval tokens for automatic processing

## Flow Diagram

```
User/Club Registration
        ↓
Create User/Club (not approved)
        ↓
Send Email to Admin
        ↓
Admin Approves/Rejects
        ↓
If Approved: User/Club Created Successfully
If Rejected: User/Club Account Deleted


User/Club Login Attempt
        ↓
Verify Credentials
        ↓
Check if Approved for Registration
        ↓
If Not Approved: Return Error
If Approved: Check if Approved for Login
        ↓
If Not Approved for Login: Send Approval Email
If Approved: Generate JWT Token & Login
```

## Common Issues

### Issue: "No users with these details found"
**Solution**: Registration was rejected by admin. Please register again.

### Issue: "Your account is pending admin approval"
**Solution**: Admin hasn't approved your registration yet. Wait for approval email.

### Issue: "Login pending admin approval. Check your email"
**Solution**: This is normal. Admin needs to approve this login attempt. Check your email.

### Issue: Admin not receiving emails
**Checks**:
1. Verify EMAIL_USER and EMAIL_PASS in .env are correct
2. Check Gmail App Password is being used (not regular password)
3. Check spam/promotions folder
4. Verify 2FA is enabled on Gmail account
5. Check server logs for email errors

## Admin Actions

### Command to Approve All Pending Requests:

```bash
# Get pending requests
curl http://localhost:8000/admin/pending-approvals \
  -H "x-admin-secret: YOUR_ADMIN_SECRET" > pending.json

# Approve each one
for token in $(cat pending.json | grep -o '"approvalToken":"[^"]*"' | cut -d'"' -f4); do
  curl -X POST http://localhost:8000/admin/approve/$token \
    -H "x-admin-secret: YOUR_ADMIN_SECRET"
done
```

### Create Admin Dashboard (Frontend)

You should create an admin dashboard that:
1. Shows pending approvals
2. Displays user/club details
3. Has approve/reject buttons
4. Shows approval history
5. Tracks statistics

## Security Notes

1. **ADMIN_SECRET**: Keep this secret! Don't commit to git.
2. **Admin Email**: Currently hardcoded to `vanditmehta7116@gmail.com`
3. **Email Links**: Should only work with correct admin secret
4. **Token Expiry**: Approval requests auto-delete after 24 hours
5. **Audit Trail**: All approvals are logged

## Production Deployment

Before deploying to production:

1. ✅ Change ADMIN_EMAIL to your production admin email
2. ✅ Generate a strong ADMIN_SECRET (use crypto module)
3. ✅ Use production Gmail account or email service
4. ✅ Update ADMIN_DASHBOARD_URL to your production URL
5. ✅ Set NODE_ENV=production
6. ✅ Configure HTTPS/SSL
7. ✅ Set up proper error logging
8. ✅ Create admin dashboard interface

## Support

For detailed documentation, see: `ADMIN_AUTH_DOCUMENTATION.md`

For issues, check server logs:
```bash
npm run dev
# or
nodemon index.js
```
