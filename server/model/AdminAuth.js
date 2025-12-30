const mongoose = require('mongoose');

const adminAuthSchema = new mongoose.Schema({
    requestType: {
        type: String,
        enum: ['user_login', 'user_registration', 'club_login', 'club_registration', 'club_member_addition'],
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        default: null
    },
    clubId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Clubs',
        default: null
    },
    email: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    requestData: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    approvalToken: {
        type: String,
        unique: true,
        sparse: true
    },
    approvedAt: {
        type: Date,
        default: null
    },
    rejectionReason: {
        type: String,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 86400 // Auto-delete after 24 hours
    }
}, { timestamps: true });

const AdminAuth = mongoose.model('AdminAuth', adminAuthSchema);
module.exports = AdminAuth;
