const mongoose=require('mongoose');
const userSchema = new mongoose.Schema({
    uname:{
        type:String,
        required:true
    },

    udepartment:{
        type:String,
        required:true
    },
    usapid:{
        type:String,
        required:true,
        unique:true
    },
    uemail:{
        type:String,
        required:true,
        unique:true
    },
    uphonenumber:{
        type:String,
        required:true,
        unique:true,
    },
    hashedPassword:{
        type:String,
        required:true,
    },
    isApproved:{
        type:Boolean,
        default:false
    },
    isApprovedForLogin:{
        type:Boolean,
        default:false
    },
    approvedAt:{
        type:Date,
        default:null
    }
}, {timestamps:true});

const user = mongoose.model('Users',userSchema);
module.exports=user;