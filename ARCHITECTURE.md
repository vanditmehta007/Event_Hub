# System Architecture & Flow Diagrams

## High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Event Hub Application                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐                 ┌──────────────────────┐  │
│  │   Frontend       │                 │   Backend Server     │  │
│  │  (React/Vite)    │                 │   (Express/Node)     │  │
│  │                  │                 │                      │  │
│  │  - Login Form    │◄──────────────►│  - Auth Routes       │  │
│  │  - Register Form │    HTTP API     │  - User Routes       │  │
│  │  - Dashboard     │                 │  - Admin Routes      │  │
│  └──────────────────┘                 └────────┬─────────────┘  │
│                                                 │                 │
│                                    ┌────────────┴─────────────┐  │
│                                    │                          │  │
│                         ┌──────────▼─────────┐   ┌──────────▼───┐
│                         │   Controllers      │   │  AdminAuth   │
│                         │                    │   │  Utilities   │
│                         │ - userReg          │   │              │
│                         │ - userLogin        │   │ - sendEmail  │
│                         │ - clubReg          │   │ - generateTok│
│                         │ - clubLogin        │   │ - Notify     │
│                         │ - Admin endpoints  │   └──────────────┘
│                         └────────┬───────────┘
│                                  │
│              ┌───────────────────┼───────────────────┐
│              │                   │                   │
│    ┌─────────▼──────────┐  ┌────▼──────────┐  ┌───▼───────────┐
│    │    MongoDB         │  │  Nodemailer   │  │   JWT Auth    │
│    │                    │  │               │  │               │
│    │ - Users            │  │ - Gmail SMTP  │  │ - Token Gen   │
│    │ - Clubs            │  │ - Templates   │  │ - Verification│
│    │ - AdminAuth        │  │ - Tracking    │  │ - Validation  │
│    │ - Events           │  └───────────────┘  └───────────────┘
│    └────────────────────┘
│                                    │
│                         ┌──────────▼──────────┐
│                         │   Admin Email       │
│                         │ vanditmehta7116@    │
│                         │ gmail.com           │
│                         │                     │
│                         │ - Approval Requests │
│                         │ - Notifications     │
│                         │ - History Logs      │
│                         └─────────────────────┘
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## User Registration Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ USER REGISTRATION SEQUENCE                                       │
└─────────────────────────────────────────────────────────────────┘

Step 1: User Submits Registration
    ┌─────────┐
    │ Frontend│ POST /uregister
    └────┬────┘ (name, email, password, etc.)
         │
         │
    ┌────▼──────────────────────────────────┐
    │ Server validates data                  │
    │ Hashes password                        │
    │ Checks for duplicates                  │
    └────┬──────────────────────────────────┘
         │
         │
    ┌────▼──────────────────────────────────┐
    │ Creates User in MongoDB:               │
    │ - isApproved: false                   │
    │ - isApprovedForLogin: false           │
    │ - Status: PENDING                      │
    └────┬──────────────────────────────────┘
         │
         │
    ┌────▼──────────────────────────────────┐
    │ Generates Approval Token               │
    │ Creates AdminAuth record               │
    │ Status: PENDING                        │
    └────┬──────────────────────────────────┘
         │
         │
    ┌────▼──────────────────────────────────┐
    │ Sends Email to Admin:                  │
    │ TO: vanditmehta7116@gmail.com          │
    │ SUBJECT: [ADMIN APPROVAL]              │
    │          User Registration             │
    │ Contains: User details + Token         │
    └────┬──────────────────────────────────┘
         │
         │
    ┌────▼──────────────────────────────────┐
    │ Response to User:                      │
    │ {                                      │
    │   success: true,                       │
    │   message: "Awaiting admin approval"   │
    │ }                                      │
    └────────────────────────────────────────┘


Step 2: Admin Reviews & Approves
         ┌──────────────┐
         │ Admin Email  │
         │ Receives     │ [ADMIN APPROVAL] User Registration - John Doe
         │ Request      │ Details: Email, SAP ID, Department, Phone
         │ Email        │ [APPROVE] [REJECT]
         └────┬─────────┘
              │
              │ Clicks APPROVE or API call
              │
         ┌────▼─────────────────────────┐
         │ Admin Secret Verified        │
         │ Token Validated              │
         │ Status: APPROVED             │
         └────┬─────────────────────────┘
              │
         ┌────▼──────────────────────────────┐
         │ Update User in MongoDB:            │
         │ - isApproved: true                │
         │ - approvedAt: NOW()               │
         │ - Status: REGISTERED               │
         └────┬──────────────────────────────┘
              │
         ┌────▼──────────────────────────────┐
         │ Send Email to User:                │
         │ TO: user@example.com               │
         │ SUBJECT: Approval Confirmed        │
         │ Message: "You can now login"       │
         └──────────────────────────────────┘


Step 3: User Can Now Login
    ┌─────────┐
    │ User    │ ✅ Account Approved
    │ is      │ ✅ Can attempt login
    │ Ready   │ ✅ Will need login approval
    └─────────┘
```

---

## User Login Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ USER LOGIN SEQUENCE                                              │
└─────────────────────────────────────────────────────────────────┘

Step 1: User Attempts Login
    ┌─────────┐
    │ Frontend│ POST /ulogin
    └────┬────┘ (email, password, sapid)
         │
    ┌────▼─────────────────────────────┐
    │ Find User in Database            │
    │ Verify Password                  │
    │ Check isApproved status          │
    └────┬────────────────────────────┘
         │
    ┌────▼────────────────────────────────────────────────┐
    │ Decision Tree:                                       │
    │                                                      │
    │ ❌ User not found              → Error (invalid)    │
    │ ❌ Password mismatch           → Error (invalid)    │
    │ ❌ isApproved = false          → Error (awaiting)   │
    │ ✅ isApproved = true                               │
    │    ├─ ❌ isApprovedForLogin=false → Send email     │
    │    └─ ✅ isApprovedForLogin=true  → Generate token │
    └────┬────────────────────────────────────────────────┘
         │
         └─────────────────────────────────────────────────────────┐
                                                                   │
            SCENARIO A: First Login (not approved)               │
            ┌──────────────────────────────────────┐              │
            │ Generate new token                   │              │
            │ Create AdminAuth record              │              │
            │ Status: LOGIN_PENDING                │              │
            │ Type: user_login                     │              │
            └────┬─────────────────────────────────┘              │
                 │                                               │
            ┌────▼──────────────────────────────┐               │
            │ Send Email to Admin:               │               │
            │ TO: vanditmehta7116@gmail.com      │               │
            │ SUBJECT: [ADMIN APPROVAL]          │               │
            │          User Login Request        │               │
            │ Contains: Login timestamp + Token  │               │
            └────┬─────────────────────────────┘               │
                 │                                               │
            ┌────▼────────────────────────────┐                │
            │ Response to User:                │                │
            │ {                                │                │
            │   success: false,                │                │
            │   requiresApproval: true,        │                │
            │   message: "Login pending..."    │                │
            │ }                                │                │
            └────────────────────────────────┘                │
                                                                │
            SCENARIO B: Already Approved                        │
            ┌────────────────────────────────┐                 │
            │ isApprovedForLogin = true      │                 │
            │ Generate JWT Token             │                 │
            │ Set secure cookie              │                 │
            └────┬─────────────────────────┘                 │
                 │                                               │
            ┌────▼────────────────────────────┐                │
            │ Response to User:                │                │
            │ {                                │                │
            │   message: "Login successful",  │                │
            │   user: {id, name, email}      │                │
            │ }                                │                │
            │ Cookie: token=JWT_TOKEN         │                │
            └────────────────────────────────┘                │
                                                                │
└───────────────────────────────────────────────────────────────┘


Step 2: Admin Approves Login
         ┌──────────────┐
         │ Admin Email  │
         │ Receives     │ [ADMIN APPROVAL] User Login Request
         │ Request      │ Details: Email, SAP ID, Login Time
         │ Email        │ [APPROVE] [REJECT]
         └────┬─────────┘
              │
              │ Clicks APPROVE
              │
         ┌────▼─────────────────────────────┐
         │ Update User in MongoDB:           │
         │ - isApprovedForLogin: true       │
         │ - Status: LOGIN_APPROVED          │
         └────┬────────────────────────────┘
              │
         ┌────▼──────────────────────────────┐
         │ Send Email to User:                │
         │ SUBJECT: Login Approved            │
         │ Message: "Try logging in again"    │
         └──────────────────────────────────┘


Step 3: User Logs In After Approval
    ┌─────────┐
    │ User    │ POST /ulogin (again)
    └────┬────┘
         │
    ┌────▼──────────────────────────┐
    │ Verify Credentials             │
    │ isApproved: ✅                │
    │ isApprovedForLogin: ✅        │
    │ Generate JWT                   │
    └────┬─────────────────────────┘
         │
    ┌────▼──────────────────────────┐
    │ Response:                      │
    │ {                              │
    │   message: "Login successful"  │
    │   user: {...}                  │
    │   cookie: JWT                  │
    │ }                              │
    │                                │
    │ ✅ User can access system      │
    └────────────────────────────────┘
```

---

## Club Registration & Login (Same Pattern)

```
CLUB REGISTRATION:
    Register → Pending → Admin Approves → Registered → Can Login

CLUB LOGIN:
    First attempt → Admin approval needed → Admin approves → JWT
    Subsequent → Admin approval each time → JWT on approval
```

---

## Admin Approval Management

```
┌─────────────────────────────────────────────────────────────────┐
│ ADMIN APPROVAL MANAGEMENT                                        │
└─────────────────────────────────────────────────────────────────┘

GET /admin/pending-approvals
    ├─ Response: Array of pending requests
    │
    ├─ Fields:
    │  ├─ requestType (user_login, user_registration, etc.)
    │  ├─ name, email, department
    │  ├─ approvalToken (unique)
    │  ├─ createdAt (expires in 24h)
    │  └─ requestData (user/club details)
    │
    └─ Example:
       [
         {
           _id: "...",
           requestType: "user_registration",
           name: "John Doe",
           email: "john@example.com",
           approvalToken: "abc123...",
           createdAt: "2024-11-22T10:00:00Z",
           status: "pending"
         }
       ]


POST /admin/approve/:approvalToken
    ├─ Action: Approve a pending request
    ├─ Updates: User/Club approval status
    ├─ Sends: Approval email to requester
    │
    └─ For USER_REGISTRATION:
       └─ Sets: isApproved = true
    
    └─ For USER_LOGIN:
       └─ Sets: isApprovedForLogin = true
    
    └─ For CLUB_REGISTRATION:
       └─ Sets: isApproved = true
    
    └─ For CLUB_LOGIN:
       └─ Sets: isApprovedForLogin = true


POST /admin/reject/:approvalToken
    ├─ Action: Reject a pending request
    ├─ Reason: Optional (stored in database)
    │
    ├─ For REGISTRATION requests:
    │  ├─ Delete user/club record
    │  └─ Send rejection email
    │
    ├─ For LOGIN requests:
    │  ├─ Keep user/club record
    │  ├─ Send denial email
    │  └─ User must login again to retry
    │
    └─ Auto-expires after 24 hours anyway


GET /admin/approval-history
    ├─ Shows: All approved/rejected requests
    ├─ Sorted: Most recent first
    │
    └─ Fields:
       ├─ status: "approved" or "rejected"
       ├─ approvedAt/rejectedAt: Timestamp
       ├─ rejectionReason: Why rejected
       └─ Full audit trail
```

---

## Database Schema Overview

```
┌─────────────────────────────────────────────────────────────────┐
│ MongoDB Collections                                              │
└─────────────────────────────────────────────────────────────────┘

Users Collection:
{
  _id: ObjectId,
  uname: String,
  uemail: String,
  usapid: String,
  udepartment: String,
  uphonenumber: String,
  hashedPassword: String,
  isApproved: Boolean (default: false),          ← NEW
  isApprovedForLogin: Boolean (default: false),  ← NEW
  approvedAt: Date,                              ← NEW
  createdAt: Date,
  updatedAt: Date
}

Clubs Collection:
{
  _id: ObjectId,
  cname: String,
  cdepartment: String,
  cid: String,
  hashedPassword: String,
  isApproved: Boolean (default: false),          ← NEW
  isApprovedForLogin: Boolean (default: false),  ← NEW
  approvedAt: Date,                              ← NEW
  createdAt: Date,
  updatedAt: Date
}

AdminAuth Collection (NEW):
{
  _id: ObjectId,
  requestType: String,          // user_login, user_registration, etc.
  userId: ObjectId (ref User),
  clubId: ObjectId (ref Club),
  email: String,
  name: String,
  department: String,
  requestData: Mixed,
  status: String,               // pending, approved, rejected
  approvalToken: String,        // Unique token
  approvedAt: Date,
  rejectionReason: String,
  createdAt: Date,              // Auto-delete after 24 hours
  updatedAt: Date
}
```

---

## Email Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ EMAIL NOTIFICATION FLOW                                          │
└─────────────────────────────────────────────────────────────────┘

EVENT: User Registration
    ↓
    Send to: ADMIN_EMAIL (vanditmehta7116@gmail.com)
    Type: APPROVAL REQUEST
    Subject: [ADMIN APPROVAL] User Registration - {Name}
    Contains:
    ├─ User Details (name, email, SAP ID, dept, phone)
    ├─ Approval Token
    ├─ [APPROVE] Button
    └─ [REJECT] Button


EVENT: Admin Approves Registration
    ↓
    Send to: User Email
    Type: APPROVAL NOTIFICATION
    Subject: Your Registration Approved!
    Contains:
    ├─ Confirmation message
    ├─ Next steps
    └─ Support contact


EVENT: User Login Attempt
    ↓
    Send to: ADMIN_EMAIL
    Type: APPROVAL REQUEST
    Subject: [ADMIN APPROVAL] User Login - {Name}
    Contains:
    ├─ User Details
    ├─ Login timestamp
    ├─ [APPROVE] Button
    └─ [REJECT] Button


EVENT: Admin Approves Login
    ↓
    Send to: User Email
    Type: APPROVAL NOTIFICATION
    Subject: Login Approved!
    Contains:
    ├─ Confirmation message
    └─ Support contact


EVENT: Admin Rejects Request
    ↓
    Send to: User Email or Admin Email
    Type: REJECTION NOTIFICATION
    Subject: Your Request Was Rejected
    Contains:
    ├─ Rejection reason
    ├─ Next steps
    └─ Support contact
```

---

## Security Model

```
┌─────────────────────────────────────────────────────────────────┐
│ SECURITY LAYERS                                                  │
└─────────────────────────────────────────────────────────────────┘

Layer 1: User Account Creation
    ├─ Password: Hashed with bcrypt (11 rounds)
    ├─ Account: Created as UNAPPROVED
    └─ Approval: Required before any access

Layer 2: Registration Approval
    ├─ Admin: Must approve each registration
    ├─ Email: Verification sent to admin
    ├─ Token: Cryptographically secure approval token
    └─ Timeout: Expires after 24 hours

Layer 3: Login Approval
    ├─ Per-Login: Each login requires approval
    ├─ Credentials: Verified before approval request
    ├─ Token: New token for each login attempt
    └─ Admin: Must explicitly approve each login

Layer 4: Admin API Security
    ├─ Secret: ADMIN_SECRET header required
    ├─ Validation: Token verified against database
    ├─ Logging: All approvals logged with timestamps
    └─ Audit: Full history maintained

Layer 5: JWT Token Security
    ├─ Issued: Only after approval
    ├─ Duration: 24-hour expiration
    ├─ Storage: HTTP-only secure cookies
    ├─ Validation: Signature verified on each request
    └─ Refresh: Requires new login approval

Total Security: Multi-layer verification before any access granted
```

---

**Architecture Diagram Version**: 1.0
**Created**: November 22, 2025
**Status**: Complete & Ready for Implementation
