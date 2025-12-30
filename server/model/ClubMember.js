const mongoose = require('mongoose');

const clubMemberSchema = new mongoose.Schema({
    club_id: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    sapid: {
        type: String,
        required: true
    },
    phone: {
        type: String
    },
    department: {
        type: String
    },
    joining_date: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    }
}, { timestamps: true });

// A club shouldn't add the same person twice ideally, usually SAPID is unique within a club or globally
// But a user can be in multiple clubs. So SAPID + ClubID should be unique.
clubMemberSchema.index({ club_id: 1, sapid: 1 }, { unique: true });

const ClubMember = mongoose.model('ClubMember', clubMemberSchema);
module.exports = ClubMember;
