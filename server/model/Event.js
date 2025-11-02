const mongoose=require('mongoose');
const eventSchema = new mongoose.Schema({
    ename:{
        type:String,
        required:true
    },

    eclub_name:{
        type:String,
        required:true
    },
    edate:{
        type:String,
        required:true,

    },
    evenue:{
        type:String,
        required:true,
    },
    etype:{
        type:String,
        required:true,
    },
    ecid:{
        type:String,
        required:true,
    },
    eprmsg:{
        type:String,
    },
    eimage:{
        type: String,
        required:true
    },
    eimagepublicid:{
        type:String,
        required: true
    }
}, {timestamps:true});

const event = mongoose.model('Events',eventSchema);
module.exports=event;
