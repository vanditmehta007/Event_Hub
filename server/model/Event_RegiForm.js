const mongoose=require('mongoose');
const eventFormSchema = new mongoose.Schema({
    event_name:{
        type:String,
        required:true
    },

//     club_name:{
//         type:String,
//         required:true
//     },
//     club_id:{
//   type:String,
//         required:true
//     },
    name_tf:{
        type:Boolean,
    },
    sapid_tf:{
        type:Boolean,
    
    },
    email_tf:{
        type:Boolean,
     
    },
    phone_tf:{
        type:Boolean,
      
    },

    about_yourself_tf:{
        type:Boolean,
    },
    //cloudinary and multor for image.
}, {timestamps:true});

const eventform = mongoose.model('EventRegiForm',eventFormSchema);
module.exports=eventform;
