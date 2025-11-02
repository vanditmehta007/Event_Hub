const mongoose=require('mongoose');
const venueSchema = new mongoose.Schema({
    college:{
        type:String,
        required:true
    },

    floor:{
        type:String,
        required:true
    },
    room_number:{
        type:String,
        required:true,
        unique:true
    },
    time:{
        type:String,
        required:true,
    },
}, {timestamps:true});

const venue = mongoose.model('Venues',venueSchema);
module.exports=venue;