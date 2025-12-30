const mongoose = require('mongoose');

const internalUpdateSchema = new mongoose.Schema({
    club_id: {
        type: String,
        required: true
    },
    update_text: {
        type: String,
        required: true
    },
    sent_to_count: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

const InternalUpdate = mongoose.model('InternalUpdate', internalUpdateSchema);
module.exports = InternalUpdate;
