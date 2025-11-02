//login , register auth for both 
const User = require('../model/User');
const Club = require('../model/Club')
const Event = require('../model/Event')
const EventRegiForm = require('../model/Event_RegiForm')
const UsersRegistered = require('../model/Users_registered')
const EventUpdate = require('../model/Event_updates')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt');
const user = require('../model/User');
const nodemailer = require('nodemailer')
const dotenv = require('dotenv').config();
const isNumericString = (str) => {
  if (typeof str != "string") return false // We only process strings
  return !isNaN(str) && // Use type coercion to parse the string
         !isNaN(parseFloat(str)) // Ensure it's a valid number
}

const transporter = nodemailer.createTransport({
  service:'gmail',
  auth:{
    user:process.env.EMAIL_USER,
    pass:process.env.EMAIL_PASS
  }
});

const userReg= async(req,res)=>{
try {
    const {uname, uemail, upassword, usapid,udepartment,uphonenumber} =req.body;
    if(!uname) return res.json({error: 'Name is required'})
    if(!udepartment) return res.json({error: 'Department is required'})
    if(!uemail) return res.json({error: 'Email is required'})
    if(!upassword || upassword.length < 6 ) return res.json({error: '6 character password is required'})
    if(!usapid || usapid.length < 11 || !isNumericString(usapid)) return res.json({error: 'Numeric 11 digit SapID is required'})
        if(!uphonenumber || uphonenumber.length<10 || !isNumericString(uphonenumber)) return res.json({error:'Please provide the correct phone number'})
        const existUser = await User.findOne( { usapid });
        if(existUser) return res.json({error : 'User with this SapID already exists'});

        const hashedPassword = await bcrypt.hash(upassword,11);

        const user= await User.create({
            uname,
            uemail,
            usapid,
            udepartment,
            uphonenumber,
            hashedPassword,        
        });
        return res.json({ success: true, user: user });
} catch (error) {
    console.log(error);
    return res.json({
        error: 'User Regsitration error , please try again.'
    });
    
}
};

const userLogin = async (req,res) => {
    try {
       const {uemail,upassword,usapid}= req.body;
       
       const userInDB = await User.findOne({uemail,usapid});
       if(!userInDB) return res.json({error : 'No users with these details found, please recheck and try again'})
        const passwordMatch = await bcrypt.compare(upassword,userInDB.hashedPassword)
    if(passwordMatch){
   const token = jwt.sign(
        { 
          id: userInDB._id, 
          uname: userInDB.uname, 
          uemail: userInDB.uemail, 
          role: 'user' 
        }, 
        process.env.JWT_SECRET, 
        { expiresIn: '1d' }
      );

     
      res.cookie('token', token, {
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production', 
        maxAge: 24 * 60 * 60 * 1000 
      });
        return res.json({message: 'Login Successful!', user:{ id: userInDB._id, uname:userInDB.uname, uemail:userInDB.uemail}});
    }
    else{
        return res.json({error:'Invalid Credentials, please recheck and try again'});
    }
    } catch (error) {
        console.log(error);
        return res.json({error:'User Login Error, try again'})
        
    }
};


const pendingClubRegistrations = new Map();


const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const clubReg = async(req,res) => {
try {
    const {cname, cdepartment, cpassword, cid} = req.body;
    if(!cname) return res.json({error: 'Name is required'})
    if(!cdepartment) return res.json({error: 'Please select a departement'})
    if(!cpassword || cpassword.length < 6 ) return res.json({error: '6 character password is required'})
    if(!cid || cid.length < 4 ) return res.json({error: 'Numeric 4 digit ID is required'})

    const existClub = await Club.findOne({ cid });
    if(existClub) return res.json({error : 'Club with this ID already exists'});

    const hashedPassword = await bcrypt.hash(cpassword, 10);
    

    const otp = generateOTP();
    

    pendingClubRegistrations.set(cid, {
        cname,
        cdepartment,
        hashedPassword,
        cid,
        otp,
        timestamp: Date.now() 
    });

 
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: 'vanditmehta7116@gmail.com',
        subject: 'Club Registration OTP Verification',
        text: `Your OTP for registering ${cname} club is: ${otp}\nThis OTP will expire in 10 minutes.`
    };

    await transporter.sendMail(mailOptions);
    
    return res.json({ 
        success: true, 
        message: 'OTP has been sent to the admin email. Please verify to complete registration.',
        requiresOTP: true,
        cid: cid 
    });
} catch (error) {
    console.log(error);
    return res.json({
        error: 'Club Registration error, please try again.'
    });
}
};

const verifyClubOTP = async (req, res) => {
    try {
        const { cid, otp } = req.body;
        
        const pendingReg = pendingClubRegistrations.get(cid);
        if (!pendingReg) {
            return res.json({ error: 'Registration request not found or expired. Please register again.' });
        }

      
        if (Date.now() - pendingReg.timestamp > 10 * 60 * 1000) {
            pendingClubRegistrations.delete(cid);
            return res.json({ error: 'OTP has expired. Please register again.' });
        }

        
        if (pendingReg.otp !== otp) {
            return res.json({ error: 'Invalid OTP. Please try again.' });
        }

        
        const club = await Club.create({
            cname: pendingReg.cname,
            cdepartment: pendingReg.cdepartment,
            cid: pendingReg.cid,
            hashedPassword: pendingReg.hashedPassword,
        });

      
        pendingClubRegistrations.delete(cid);

        return res.json({ 
            success: true, 
            message: 'Club registration successful!',
            club: club 
        });

    } catch (error) {
        console.log(error);
        return res.json({
            error: 'OTP verification failed, please try again.'
        });
    }
};

const clubLogin = async (req,res) => {
    try {
       const {cname,cpassword,cid}= req.body;
       
       const clubInDB = await Club.findOne({cname,cid});
       if(!clubInDB) return res.json({error : 'No users with these details found, please recheck and try again'})

        const passwordMatch = await bcrypt.compare(cpassword,clubInDB.hashedPassword) 
    if(passwordMatch){
      const token = jwt.sign(
        { 
          id: clubInDB._id, 
          cname: clubInDB.cname, 
          cid: clubInDB.cid, 
          role: 'club'
        }, 
        process.env.JWT_SECRET, 
        { expiresIn: '1d' }
      );

   
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000
      });
        return res.json({message: 'Login Successful!', club:{ id: clubInDB._id, cname: clubInDB.cname, cdepartment:clubInDB.cdepartment, cid: clubInDB.cid}});
    }
    else{
        return res.json({error:'Invalid Credentials, please recheck and try again'});
    }
    } catch (error) {
        console.log(error);
        return res.json({error:'Club Login Error, try again'})
        
    }
};


const eventSet= async (req,res) => {
try {

    const{ename,edate,evenue,etype,ecid,eclub_name, eprmsg} = req.body; 

    // 2. File info is in req.file. Cloudinary URL is on 'path', public_id is on 'filename'
    if (!req.file) {
      return res.json({ error: 'Please upload an image for the event' });
    }
    
    const eimage = req.file.path;
    const eimagepublicid = req.file.filename;

    if(!ename) return res.json({error:'Please provide a name to the event'})
    //if(!eclub_name) return res.json({error:'Provide a club associated with this event'})
    if(!edate) return res.json({error:"Please select a date for this event"})
   // if(!ecid) return res.json({error:'Please provide the club id'})
    if(!evenue) return res.json({error:'Please put the allocated venue'})
    if(!etype) return res.json({error:'Please select an event type '})
    
    
    const eventInDB = await Event.findOne({ename}); 
    if(eventInDB){return res.json({error:'Event with this name in this club already created.'})}


//autofill values here.

const event = await Event.create({
    ename,
    edate,
    evenue,
    etype,
    ecid,
    eclub_name,
    eprmsg,
    eimage,
    eimagepublicid
});

const allUsers = await User.find({}, 'uemail uname');


const emailPromises = allUsers.map(user => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.uemail,
        subject: `New Event Alert: ${ename}`,
        html: `
            <h1>New Event Announcement!</h1>
            <p>Hi ${user.uname},</p>
            <p>A new event has been announced by ${eclub_name}:</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0;">
                <h2 style="color: #2c3e50;">${ename}</h2>
                <p><strong>Date:</strong> ${new Date(edate).toLocaleDateString()}</p>
                <p><strong>Venue:</strong> ${evenue}</p>
                <p><strong>Type:</strong> ${etype}</p>
                ${eprmsg ? `<p><strong>Message:</strong> ${eprmsg}</p>` : ''}
            </div>
            <p>Don't miss out! Stay tuned for registration details.</p>
            <p>Best regards,<br>${eclub_name}</p>
        `
    };
    return transporter.sendMail(mailOptions);
});

try {
    await Promise.all(emailPromises);
    console.log('Event notification emails sent successfully');
} catch (emailError) {
    console.log('Error sending some notification emails:', emailError);
   
}

return res.json({ 
    success: true, 
    event: event,
    emailsSent: true
});
    
} catch (error){
    console.log(error);
    return res.json({error:'Event Create error, try again '})
    
}
}



const eventForm = async(req, res) => {
    try {
        const optionsMap = {
            name_tf: false,
            sapid_tf: false,
            email_tf: false,
            phone_tf: false,
            department_tf: false,
            about_yourself_tf: false
        };

        const { event_name, selectedOptions } = req.body;
        
        if (!event_name) {
            return res.status(400).json({ error: 'Event name is required.' });
        }

        if (!selectedOptions || selectedOptions.length === 0) {
            return res.status(400).json({ error: 'Please select at least one field.' });
        }
        const existingForm = await EventRegiForm.findOne({ event_name });
        if (existingForm) {
            return res.status(400).json({ error: 'Form for this event already exists.' });
        }

        selectedOptions.forEach(opt => {
            if (optionsMap.hasOwnProperty(opt)) {
                optionsMap[opt] = true;
            }
        });

        const eventForm = await EventRegiForm.create({
            event_name,
            ...optionsMap
        });

        res.status(201).json({ 
            success: true, 
            message: 'Form created successfully.', 
            form: eventForm 
        });
}
catch(error){
 console.error('Error creating form:', error);
    res.status(500).json({ error: 'Internal server error.' });
};
};


const eventFormBuilt = async (req, res) => {
    try {
        const { event_name } = req.params;
        
        if (!event_name) {
            return res.status(400).json({ error: 'Event name is required' });
        }

        const formInDB = await EventRegiForm.findOne({ event_name });

        if (!formInDB) {
            return res.status(404).json({ error: 'Form not found or still under processing.' });
        }

        const formData = formInDB.toObject();

        const fieldFlags = {
            name_tf: formData.name_tf || false,
            sapid_tf: formData.sapid_tf || false,
            email_tf: formData.email_tf || false,
            phone_tf: formData.phone_tf || false,
            department_tf: formData.department_tf || false,
            about_yourself_tf: formData.about_yourself_tf || false
        };

        const selectedFields = Object.keys(fieldFlags).filter(
            (key) => fieldFlags[key] === true
        );

        res.status(200).json({
            success: true,
            event_name: formData.event_name,
            selectedFields: selectedFields
        });
    }
    catch (error) {
        console.log("Error during form fetching: ", error);
        return res.status(500).json({
            error: 'Failed to fetch the form, please try again.'
        });
    }
}
const getAllEvents = async(req,res) => {
    try {
        const events = await Event.find({});
        res.json(events);
        
    } catch (error) {
        console.log(error);
        res.status(500).json({error: 'Failed to fetch event data. '})
        
    }
}

const userRegEvent = async (req, res) => {
  try {

    const { event_name, name, sapid, email, phone, about_yourself } = req.body;


    if (!event_name) {
      return res.json({ error: 'Event name is required.' });
    }
    if (!sapid) {
      return res.json({ error: 'SAP ID is required.' });
    }

    
    const user = await User.findOne({ usapid: sapid });
    if (!user) {
      return res.json({
        error: 'User not found. Please register an account first.',
      });
    }

    
    const eventForm = await EventRegiForm.findOne({ event_name: event_name });
    if (!eventForm) {
      return res.json({ error: 'This event does not exist or is not accepting registrations.' });
    }


    const existingRegistration = await UsersRegistered.findOne({
      userId: user._id,
      event_name: event_name,
    });
    
    if (existingRegistration) {
      return res.json({ error: 'You are already registered for this event.' });
    }


    const newRegistration = await UsersRegistered.create({
      userId: user._id,
      event_name: event_name,
      name: name,
      sapid: sapid,
      email: email,
      phone: phone, 
      about_yourself: about_yourself, 
    });

    const mailOptions = {
      from :process.env.EMAIL_USER,
      to:user.uemail,
      subject: `You are in!`,
      html: `
      <h1>Registration Confirmed for ${event_name} !</h1>
      <p>Hi ${user.uname}</p>
      <p>You have successfully registered for the event: <strong>${event_name}</strong></p>
      <p>See you there !</p>
      `
    };
    transporter.sendMail(mailOptions,(error,info) => {
      if(error){
        console.log('error sending email : ', error);
      }
      else{
        console.log('Email sent: ' + info.response);
        
      }
    });
    return res.json({
      success: true,
      message: 'You have been successfully registered for the event!',
      registration: newRegistration,
    });

  } catch (error) {
    console.log('Error during event registration: ', error);
    return res.status(500).json({ error: 'An error occurred on the server.' });
  }
};

const getProfile = (req, res) => {
  const { token } = req.cookies; 
  if (!token) {
    return res.json(null); 
  }

  try {
   
    const data = jwt.verify(token, process.env.JWT_SECRET);
    return res.json(data);
  } catch (error) {
    console.log(error);
    return res.json(null); 
  }
};

const logoutUser = (req, res) => {
  try {
    // Clear the 'token' cookie
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Match login settings
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax', // Adjust for cross-site if needed
    });
    return res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.log('Logout error:', error);
    return res.status(500).json({ error: 'Logout failed' });
  }
};

// Create or update event update
const createEventUpdate = async (req, res) => {
    try {
        const { update_text } = req.body;
        const { token } = req.cookies;
        
        if (!token) {
            return res.json({ error: 'Authentication required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== 'club') {
            return res.json({ error: 'Only clubs can create updates' });
        }

        if (!update_text) {
            return res.json({ error: 'Update text is required' });
        }

        const eventUpdate = await EventUpdate.create({
            club_id: decoded.id,
            club_name: decoded.cname,
            update_text
        });

        return res.json({ 
            success: true, 
            update: eventUpdate 
        });
    } catch (error) {
        console.log(error);
        return res.json({
            error: 'Failed to create update'
        });
    }
};

// Get latest update for a club
const getClubUpdate = async (req, res) => {
    try {
        const { token } = req.cookies;
        
        if (!token) {
            return res.json({ error: 'Authentication required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== 'club') {
            return res.json({ error: 'Only clubs can access updates' });
        }

        const update = await EventUpdate.findOne({ club_id: decoded.id })
            .sort({ createdAt: -1 }); // Get most recent update

        if (!update) {
            return res.json({ 
                success: true, 
                update: { update_text: 'No Updates' } 
            });
        }

        return res.json({ 
            success: true, 
            update: update 
        });
    } catch (error) {
        console.log(error);
        return res.json({
            error: 'Failed to fetch update'
        });
    }
};

// Delete current update
const deleteClubUpdate = async (req, res) => {
    try {
        const { token } = req.cookies;
        const { update_id } = req.params;
        
        if (!token) {
            return res.json({ error: 'Authentication required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== 'club') {
            return res.json({ error: 'Only clubs can delete updates' });
        }

        const update = await EventUpdate.findOneAndDelete({
            _id: update_id,
            club_id: decoded.id // Ensure club can only delete their own updates
        });

        if (!update) {
            return res.json({ error: 'Update not found or unauthorized' });
        }

        return res.json({ 
            success: true, 
            message: 'Update deleted successfully' 
        });
    } catch (error) {
        console.log(error);
        return res.json({
            error: 'Failed to delete update'
        });
    }
};

module.exports={
userLogin,
userReg,
eventForm,
eventFormBuilt,
eventSet,
clubLogin,
clubReg,
verifyClubOTP,
userRegEvent,
getAllEvents,
getProfile,
logoutUser,
createEventUpdate,
getClubUpdate,
deleteClubUpdate
};