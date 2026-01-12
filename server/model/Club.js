const mongoose = require('mongoose');
const clubSchema = new mongoose.Schema({
    cname: {
        type: String,
        required: true,
        unique: true
    },

    cdepartment: {
        type: String,
        required: true
    },
    cid: {
        type: String,
        required: true,
        unique: true
    },
    club_email: {
        type: String,
        required: true
    },
    hashedPassword: {
        type: String,
        required: true,
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    isApprovedForLogin: {
        type: Boolean,
        default: false
    },
    approvedAt: {
        type: Date,
        default: null
    },
    registrationStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    approvalRequestSentAt: {
        type: Date,
        default: null
    },
    approvalRequestExpiredAt: {
        type: Date,
        default: null
    }
}, { timestamps: true });

const club = mongoose.model('Clubs', clubSchema);
module.exports = club;