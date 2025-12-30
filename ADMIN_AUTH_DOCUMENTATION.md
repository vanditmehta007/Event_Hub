# Admin Approval Authentication System Documentation

## Overview
This system implements a strict, admin-approval-dependent authentication system for the Event Hub application. Every login and registration attempt by users and clubs requires explicit approval from the admin via email.

## System Architecture

### 1. **Database Models**

#### AdminAuth Model (`server/model/AdminAuth.js`)
Stores all authentication approval requests and their statuses.

**Fields:**
- `requestType`: Type of request (user_login, user_registration, club_login, club_registration)
- `userId/clubId`: Reference to the user or club
- `email`: Email address of the requester
- `name`: Name of the requester
- `department`: Department information
- `requestData`: Full request data
- `status`: pending, approved, or rejected
- `approvalToken`: Unique token for approval/rejection
- `approvedAt`: Timestamp when approved
- `rejectionReason`: Reason for rejection
- `createdAt`: Auto-expires after 24 hours

#### Updated User Model
- `isApproved`: Registration approval status (default: false)
- `isApprovedForLogin`: Login approval status (default: false)
- `approvedAt`: Timestamp of approval

#### Updated Club Model
- `isApproved`: Registration approval status (default: false)
- `isApprovedForLogin`: Login approval status (default: false)
- `approvedAt`: Timestamp of approval

### 2. **Admin Configuration**

**Environment Variables (.env):**
```
ADMIN_EMAIL=vanditmehta7116@gmail.com
ADMIN_SECRET=your-secure-admin-secret-key
ADMIN_DASHBOARD_URL=http://localhost:3000
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-app-password
```

The `ADMIN_EMAIL` is hardcoded in the system and receives all approval requests.
The `ADMIN_SECRET` is used to authenticate admin API calls for approving/rejecting requests.

### 3. **Authentication Flow**

#### User Registration Flow
1. User submits registration form
2. System creates user account with `isApproved = false`
3. Admin receives email with user details and approval token
4. Admin approves/rejects via email link or API
5. User can only login after approval

#### User Login Flow
1. User enters credentials
2. System verifies credentials
3. If user is not approved for registration: Return error
4. If user is not approved for login: Send approval request to admin, return pending message
5. After admin approval: User receives login token

#### Club Registration Flow
1. Club submits registration
2. System creates club account with `isApproved = false`
3. Admin receives email with club details
4. Admin approves/rejects
5. Club can only operate after approval

#### Club Login Flow
1. Club enters credentials
2. System verifies credentials
3. If club is not approved for registration: Return error
4. If club is not approved for login: Send approval request to admin, return pending message
5. After admin approval: Club receives login token

## API Endpoints

### User Endpoints

**POST `/uregister`**
- Register a new user
- Sends approval request to admin
- Response includes confirmation message

**POST `/ulogin`**
- User login
- Returns error if not approved for registration
- Sends approval request if not approved for login
- Returns token if approved

### Club Endpoints

**POST `/cregister`**
- Register a new club
- Sends approval request to admin
- Response includes confirmation message

**POST `/clogin`**
- Club login
- Returns error if not approved for registration
- Sends approval request if not approved for login
- Returns token if approved

### Admin Approval Endpoints

**POST `/admin/approve/:approvalToken`**
- Approve a pending request
- Requires header: `x-admin-secret`
- Updates user/club approval status
- Sends notification email to requester

Example:
```bash
curl -X POST http://localhost:8000/admin/approve/token123 \
  -H "x-admin-secret: your-admin-secret"
```

**POST `/admin/reject/:approvalToken`**
- Reject a pending request
- Requires header: `x-admin-secret`
- Optionally include rejection reason in body
- For registration rejections: Deletes the user/club record
- Sends rejection notification to requester

Example:
```bash
curl -X POST http://localhost:8000/admin/reject/token123 \
  -H "x-admin-secret: your-admin-secret" \
  -H "Content-Type: application/json" \
  -d '{"reason":"Invalid institution details"}'
```

**GET `/admin/pending-approvals`**
- List all pending approval requests
- Requires header: `x-admin-secret`
- Returns array of pending requests with details

Example:
```bash
curl http://localhost:8000/admin/pending-approvals \
  -H "x-admin-secret: your-admin-secret"
```

**GET `/admin/approval-history`**
- List all approved and rejected requests
- Requires header: `x-admin-secret`
- Returns historical approval data

Example:
```bash
curl http://localhost:8000/admin/approval-history \
  -H "x-admin-secret: your-admin-secret"
```

## Email Templates

### User Registration Approval Email
- Sent to: `ADMIN_EMAIL`
- Includes: User details (name, email, SAPID, department, phone)
- Contains: APPROVE and REJECT buttons

### User Login Approval Email
- Sent to: `ADMIN_EMAIL`
- Includes: User details and login timestamp
- Contains: APPROVE and REJECT buttons

### Club Registration Approval Email
- Sent to: `ADMIN_EMAIL`
- Includes: Club name, ID, and department
- Contains: APPROVE and REJECT buttons

### Club Login Approval Email
- Sent to: `ADMIN_EMAIL`
- Includes: Club name, ID, and login timestamp
- Contains: APPROVE and REJECT buttons

### User/Club Notification Emails
- Sent to: Requester email
- Informs them of approval/rejection status
- Includes contact info for further inquiries

## Security Features

1. **Token-Based Approval**: Each request gets a unique approval token
2. **Admin Secret**: API calls require ADMIN_SECRET header
3. **Auto-Expiration**: Approval requests auto-delete after 24 hours
4. **Audit Trail**: All approvals are logged with timestamps
5. **Email Verification**: Admin approval via email links
6. **Role-Based Access**: Different flows for user and club accounts

## Implementation Notes

### Admin Dashboard (TODO - Frontend)
Should implement a dashboard that:
- Displays pending approval requests
- Shows user/club details
- Allows one-click approval/rejection
- Shows approval history
- Provides analytics

### Email Links
Current implementation sends email with approval tokens that can be used with the API.
For enhanced UX, implement email links that direct to an admin dashboard page.

### Database Indexing
Add indexes in MongoDB for better query performance:
```javascript
// Recommended indexes
db.AdminAuth.createIndex({ "status": 1, "createdAt": 1 })
db.AdminAuth.createIndex({ "approvalToken": 1 })
db.Users.createIndex({ "isApproved": 1, "isApprovedForLogin": 1 })
db.Clubs.createIndex({ "isApproved": 1, "isApprovedForLogin": 1 })
```

## Configuration Steps

1. **Set Environment Variables**
   ```
   ADMIN_EMAIL=your-admin-email@gmail.com
   ADMIN_SECRET=very-secure-secret-key-min-32-chars
   ADMIN_DASHBOARD_URL=http://localhost:3000
   ```

2. **Update Admin Email** (Optional)
   - Edit `server/config/adminAuth.js`
   - Line: `const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'vanditmehta7116@gmail.com';`

3. **Test the System**
   - Register a user/club
   - Check admin email for approval request
   - Use API endpoint with ADMIN_SECRET to approve/reject
   - Verify user/club can now login

## Error Messages

| Scenario | Error Message |
|----------|---------------|
| User not approved for registration | "Your account is pending admin approval. Please wait for the admin to approve your registration." |
| User not approved for login | Login pending admin approval. Check your email for approval confirmation." |
| Club not approved for registration | "Your club registration is pending admin approval. Please wait for the admin to approve your registration." |
| Club not approved for login | "Login pending admin approval. Check your email for approval confirmation." |
| Invalid admin secret | "Unauthorized: Invalid admin credentials" |
| Approval token not found | "Approval request not found or already processed" |

## Future Enhancements

1. **Multi-Level Approval**: Require multiple admin approvals
2. **Time-Based Restrictions**: Limit login approvals to specific hours
3. **Email Verification**: Add additional email verification step
4. **IP Whitelisting**: Restrict logins to specific IP addresses
5. **Two-Factor Authentication**: Add 2FA for sensitive accounts
6. **Approval Quotas**: Set daily approval limits
7. **Audit Logs**: Enhanced logging and monitoring
8. **Analytics Dashboard**: Real-time approval metrics

## Troubleshooting

**Issue**: Admin not receiving emails
- Check EMAIL_USER and EMAIL_PASS in .env
- Verify Gmail App Password is configured
- Check spam folder

**Issue**: Approval not working
- Verify ADMIN_SECRET header is correct
- Check if approval token is still valid (24-hour expiry)
- Ensure token is URL-encoded if sent in URL

**Issue**: Users can't login after approval
- Verify both `isApproved` and `isApprovedForLogin` are set to true
- Check if approval was for registration or login (different fields)
- Verify JWT token generation is working

## Support

For issues or questions about this authentication system, contact the admin team at `ADMIN_EMAIL`.
