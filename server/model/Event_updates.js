const mongoose = require('mongoose');

const eventUpdateSchema = new mongoose.Schema({
    club_id: {
        type: String,
        required: true
    },
    club_name: {
        type: String,
        required: true
    },
    event_name: {
        type: String,
        required: false,
        default: 'General'
    },
    update_text: {
        type: String,
        required: true
    }
}, { timestamps: true });

const EventUpdate = mongoose.model('EventUpdate', eventUpdateSchema);
module.exports = EventUpdate;
