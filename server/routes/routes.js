const express = require('express')
const router = express.Router(); 
const cors  = require('cors')
const dotenv = require('dotenv').config()
const {logoutUser,getProfile,getAllEvents,userLogin,userReg,userRegEvent,clubLogin,clubReg,verifyClubOTP,eventForm,eventFormBuilt,eventSet,createEventUpdate,getClubUpdate,deleteClubUpdate,createEventForm}  = require("../controllers/controllers")
const upload  = require('../config/cloudinary');
//route-map below-

router.post('/ulogin',userLogin )
router.post('/clogin', clubLogin)
router.post('/uregister', userReg)
router.post('/cregister', clubReg)
router.post('/verify-club-otp', verifyClubOTP)
router.post('/createevent',upload.single('eimage'),eventSet)
router.post('/createeventform',eventForm)
router.post('/userregevent', userRegEvent)
router.get('/event-form/:event_name',eventFormBuilt)
router.get('/events',getAllEvents);
router.get('/profile',getProfile);
router.post('/logout', logoutUser);

// Event Updates routes
router.post('/club-update', createEventUpdate);
router.get('/club-update', getClubUpdate);
router.delete('/club-update/:update_id', deleteClubUpdate);

module.exports=router