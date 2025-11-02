const mongoose=require('mongoose');
const clubSchema = new mongoose.Schema({
    cname:{
        type:String,
        required:true
    },

    cdepartment:{
        type:String,
        required:true
    },
    cid:{
        type:String,
        required:true,
        unique:true
    },
    hashedPassword:{
        type:String,
        required:true,
    }
}, {timestamps:true});

const club = mongoose.model('Clubs',clubSchema);
module.exports=club;