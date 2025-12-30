const mongoose = require('mongoose');
const eventFormSchema = new mongoose.Schema({
    event_name: {
        type: String,
        required: true
    },

    //     club_name:{
    //         type:String,
    //         required:true
    //     },
    //     club_id:{
    //   type:String,
    //         required:true
    //     },
    name_tf: {
        type: Boolean,
    },
    sapid_tf: {
        type: Boolean,

    },
    email_tf: {
        type: Boolean,

    },
    phone_tf: {
        type: Boolean,

    },

    about_yourself_tf: {
        type: Boolean,
    },
    custom_fields: [{
        label: { type: String, required: true },
        type: { type: String, required: true, enum: ['text', 'number', 'email', 'date', 'textarea'] },
        name: { type: String, required: true },
        required: { type: Boolean, default: false }
    }]
}, { timestamps: true });

const eventform = mongoose.model('EventRegiForm', eventFormSchema);
module.exports = eventform;
