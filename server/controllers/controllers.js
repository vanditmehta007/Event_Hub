//login , register auth for both 
const User = require('../model/User');
const Club = require('../model/Club')
const Event = require('../model/Event')
const EventRegiForm = require('../model/Event_RegiForm')
const UsersRegistered = require('../model/Users_registered')
const EventUpdate = require('../model/Event_updates')
const AdminAuth = require('../model/AdminAuth');
const cloudinary = require('cloudinary').v2;
const jwt = require('jsonwebtoken')
const ClubMember = require('../model/ClubMember');
const InternalUpdate = require('../model/InternalClubUpdate');


// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
const mongoose = require('mongoose')
const bcrypt = require('bcrypt');
const user = require('../model/User');
const nodemailer = require('nodemailer')
const dotenv = require('dotenv').config();
const { generateApprovalToken, sendUserNotification } = require('../config/adminAuth');
const isNumericString = (str) => {
    if (typeof str != "string") return false // We only process strings
    return !isNaN(str) && // Use type coercion to parse the string
        !isNaN(parseFloat(str)) // Ensure it's a valid number
}

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const ALL_VENUES = Array.from({ length: 26 }, (_, i) => `Classroom ${String.fromCharCode(65 + i)}`);

const userReg = async (req, res) => {
    try {
        const { uname, uemail, upassword, usapid, udepartment, uphonenumber } = req.body;
        if (!uname) return res.json({ error: 'Name is required' })
        if (!udepartment) return res.json({ error: 'Department is required' })
        if (!uemail) return res.json({ error: 'Email is required' })
        if (!upassword || upassword.length < 6) return res.json({ error: '6 character password is required' })
        if (!usapid || usapid.length < 11 || !isNumericString(usapid)) return res.json({ error: 'Numeric 11 digit SapID is required' })
        if (!uphonenumber || uphonenumber.length < 10 || !isNumericString(uphonenumber)) return res.json({ error: 'Please provide the correct phone number' })

        const existUser = await User.findOne({ usapid });
        if (existUser) return res.json({ error: 'User with this SapID already exists' });

        const hashedPassword = await bcrypt.hash(upassword, 11);

        // Create user - no approval needed for users
        const newUser = await User.create({
            uname,
            uemail,
            usapid,
            udepartment,
            uphonenumber,
            hashedPassword,
            isApproved: true,
            isApprovedForLogin: true
        });

        return res.json({
            success: true,
            message: 'Registration successful. Please login.',
            user: { id: newUser._id, uname: newUser.uname, uemail: newUser.uemail }
        });
    } catch (error) {
        console.log(error);
        return res.json({
            error: 'User Regsitration error , please try again.'
        });

    }
};

const userLogin = async (req, res) => {
    try {
        const { uemail, upassword, usapid } = req.body;

        const userInDB = await User.findOne({ uemail, usapid });
        if (!userInDB) return res.json({ error: 'No users with these details found, please recheck and try again' })



        const passwordMatch = await bcrypt.compare(upassword, userInDB.hashedPassword)
        if (!passwordMatch) {
            return res.json({ error: 'Invalid Credentials, please recheck and try again' });
        }



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


        // Check for club memberships
        const memberships = await ClubMember.find({
            $or: [{ sapid: userInDB.usapid }, { email: userInDB.uemail }],
            status: 'approved'
        });

        // We'll also return the club names to display in the frontend
        const membershipDetails = [];
        for (const membership of memberships) {
            const club = await Club.findOne({ cid: membership.club_id });
            if (club) {
                membershipDetails.push({
                    club_id: membership.club_id, // This is likely the 'cid' from ClubMember
                    club_db_id: club._id,       // The actual mongoose ID of the Club
                    cname: club.cname
                });
            }
        }

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000
        });
        return res.json({
            message: 'Login Successful!',
            user: { id: userInDB._id, uname: userInDB.uname, uemail: userInDB.uemail, role: 'user' },
            memberships: membershipDetails
        });
    } catch (error) {
        console.log(error);
        return res.json({ error: 'User Login Error, try again' })

    }
};


const pendingClubRegistrations = new Map();


const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const clubReg = async (req, res) => {
    try {
        const { cname, cdepartment, cpassword, cid, cemail } = req.body;
        if (!cname) return res.json({ error: 'Name is required' })
        if (!cemail) return res.json({ error: 'Club Email is required' })
        if (!cdepartment) return res.json({ error: 'Please select a departement' })
        if (!cpassword || cpassword.length < 6) return res.json({ error: '6 character password is required' })
        if (!cid || cid.length < 4) return res.json({ error: 'Numeric 4 digit ID is required' })

        const existClub = await Club.findOne({ $or: [{ cid }, { cname }] });
        if (existClub) {
            if (existClub.cid === cid) return res.json({ error: 'Club with this ID already exists' });
            if (existClub.cname === cname) return res.json({ error: 'Club with this Name already exists' });
        }

        const hashedPassword = await bcrypt.hash(cpassword, 10);

        // Create club but mark as not approved
        const newClub = await Club.create({
            cname,
            cdepartment,
            cid,
            club_email: cemail,
            hashedPassword,
            isApproved: false,
            isApprovedForLogin: false,
            registrationStatus: 'pending',
            approvalRequestSentAt: new Date(),
            approvalRequestExpiredAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
        });

        // Create AdminAuth entry for admin dashboard approval (no email needed)
        try {
            const approvalToken = generateApprovalToken();
            await AdminAuth.create({
                requestType: 'club_registration',
                clubId: newClub._id,
                email: 'vanditmehta7116@gmail.com',
                name: cname,
                department: cdepartment,
                requestData: { cname, cid, cdepartment, cemail },
                status: 'pending',
                approvalToken: approvalToken,
                createdAt: new Date()
            });
        } catch (err) {
            console.log('Error creating admin auth record:', err);
            // If this fails, remove the created club to avoid dangling entries
            await Club.deleteOne({ _id: newClub._id });
            return res.json({ error: 'Failed to create admin approval record. Registration cancelled.' });
        }

        // Create JWT token for the pending club
        const token = jwt.sign(
            {
                id: newClub._id,
                cname: newClub.cname,
                cid: newClub.cid,
                role: 'club'
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.json({
            success: true,
            message: 'Club registration submitted. Please wait for admin approval.',
            club: { id: newClub._id, cname, cid, registrationStatus: 'pending' },
            redirectTo: '/clubdash'
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
            club_email: pendingReg.club_email,
            hashedPassword: pendingReg.hashedPassword,
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

// Admin Approval Endpoints
const approveAdminRequest = async (req, res) => {
    try {
        const { approvalToken } = req.params;
        const adminSecret = req.headers['x-admin-secret'];

        // Verify admin secret
        if (adminSecret !== process.env.ADMIN_SECRET) {
            return res.json({ error: 'Unauthorized: Invalid admin credentials' });
        }

        const adminAuth = await AdminAuth.findOne({ approvalToken, status: 'pending' });
        if (!adminAuth) {
            return res.json({ error: 'Approval request not found or already processed' });
        }

        adminAuth.status = 'approved';
        adminAuth.approvedAt = new Date();
        await adminAuth.save();

        if (adminAuth.requestType === 'user_registration') {
            await User.findByIdAndUpdate(adminAuth.userId, {
                isApproved: true,
                approvedAt: new Date(),
                registrationStatus: 'approved'
            });
        } else if (adminAuth.requestType === 'user_login') {
            await User.findByIdAndUpdate(adminAuth.userId, {
                isApprovedForLogin: true
            });
        } else if (adminAuth.requestType === 'club_registration') {
            const updatedClub = await Club.findByIdAndUpdate(adminAuth.clubId, {
                isApproved: true,
                isApprovedForLogin: true,
                registrationStatus: 'approved',
                approvedAt: new Date()
            }, { new: true });
            // Return success to admin with club data
            return res.json({
                success: true,
                message: 'Club registration approved successfully!',
                club: updatedClub
            });
        } else if (adminAuth.requestType === 'club_login') {
            await Club.findByIdAndUpdate(adminAuth.clubId, {
                isApprovedForLogin: true
            });
        } else if (adminAuth.requestType === 'club_member_addition') {
            await ClubMember.findByIdAndUpdate(adminAuth.requestData.memberId, {
                status: 'approved'
            });
        }

        return res.json({
            success: true,
            message: 'Approval processed successfully'
        });

    } catch (error) {
        console.log('Approval error:', error);
        return res.json({ error: 'Failed to process approval' });
    }
};

const rejectAdminRequest = async (req, res) => {
    try {
        const { approvalToken } = req.params;
        const { reason, deleteClub } = req.body;
        const adminSecret = req.headers['x-admin-secret'];

        // Verify admin secret
        if (adminSecret !== process.env.ADMIN_SECRET) {
            return res.json({ error: 'Unauthorized: Invalid admin credentials' });
        }

        const adminAuth = await AdminAuth.findOne({ approvalToken, status: 'pending' });
        if (!adminAuth) {
            return res.json({ error: 'Approval request not found or already processed' });
        }

        adminAuth.status = 'rejected';
        adminAuth.rejectionReason = reason || 'Not specified';
        adminAuth.rejectedAt = new Date();
        await adminAuth.save();

        // Conditional delete or mark rejected
        if (adminAuth.requestType === 'user_registration') {
            if (deleteClub === true || deleteClub === 'true') {
                await User.findByIdAndDelete(adminAuth.userId);
            } else {
                await User.findByIdAndUpdate(adminAuth.userId, { registrationStatus: 'rejected' });
            }
        } else if (adminAuth.requestType === 'club_registration') {
            if (deleteClub === true || deleteClub === 'true') {
                await Club.findByIdAndDelete(adminAuth.clubId);
            } else {
                await Club.findByIdAndUpdate(adminAuth.clubId, { registrationStatus: 'rejected' });
            }
        } else if (adminAuth.requestType === 'club_member_addition') {
            await ClubMember.findByIdAndUpdate(adminAuth.requestData.memberId, {
                status: 'rejected'
            });
        }

        return res.json({
            success: true,
            message: 'Request rejected successfully',
            approvalDetails: adminAuth
        });
    } catch (error) {
        console.log(error);
        return res.json({ error: 'Failed to reject request' });
    }
};

const getPendingApprovals = async (req, res) => {
    try {
        const adminSecret = req.headers['x-admin-secret'];

        // Verify admin secret
        if (adminSecret !== process.env.ADMIN_SECRET) {
            return res.json({ error: 'Unauthorized: Invalid admin credentials' });
        }

        const pendingRequests = await AdminAuth.find({ status: 'pending' })
            .sort({ createdAt: -1 });

        return res.json({
            success: true,
            pendingCount: pendingRequests.length,
            requests: pendingRequests
        });
    } catch (error) {
        console.log(error);
        return res.json({ error: 'Failed to fetch pending approvals' });
    }
};

const getApprovalHistory = async (req, res) => {
    try {
        const adminSecret = req.headers['x-admin-secret'];

        // Verify admin secret
        if (adminSecret !== process.env.ADMIN_SECRET) {
            return res.json({ error: 'Unauthorized: Invalid admin credentials' });
        }

        const history = await AdminAuth.find({ status: { $in: ['approved', 'rejected'] } })
            .sort({ approvedAt: -1 });

        return res.json({
            success: true,
            totalCount: history.length,
            requests: history
        });
    } catch (error) {
        console.log(error);
        return res.json({ error: 'Failed to fetch approval history' });
    }
};

const clubLogin = async (req, res) => {
    try {
        const { cname, cpassword, cid } = req.body;

        const clubInDB = await Club.findOne({ cname, cid });
        if (!clubInDB) return res.json({ error: 'No club with these details found, please recheck and try again' })

        const passwordMatch = await bcrypt.compare(cpassword, clubInDB.hashedPassword);
        if (!passwordMatch) {
            return res.json({ error: 'Invalid Credentials, please recheck and try again' });
        }

        const token = jwt.sign(
            {
                id: clubInDB._id,
                cname: clubInDB.cname,
                cid: clubInDB.cid,
                role: 'club'
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.json({
            message: 'Login Successful!',
            user: {
                id: clubInDB._id,
                cname: clubInDB.cname,
                cid: clubInDB.cid,
                registrationStatus: clubInDB.registrationStatus,
                approvalRequestExpiredAt: clubInDB.approvalRequestExpiredAt
            }
        });
    } catch (error) {
        console.log(error);
        return res.json({ error: 'Club Login Error, try again' })
    }
};

const eventSet = async (req, res) => {
    try {
        const { token } = req.cookies;
        if (!token) return res.json({ error: 'Authentication required' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const club = await Club.findById(decoded.id);

        if (!club || !club.isApproved) {
            return res.json({ error: 'Club is not approved or authorized to create events.' });
        }

        const { ename, edate, evenue, etype, eprmsg } = req.body;
        const ecid = club.cid;
        const eclub_name = club.cname;

        // 2. File info is in req.file. Cloudinary URL is on 'path', public_id is on 'filename'
        if (!req.file) {
            return res.json({ error: 'Please upload an image for the event' });
        }

        const eimage = req.file.path;
        const eimagepublicid = req.file.filename;

        if (!ename) return res.json({ error: 'Please provide a name to the event' })
        //if(!eclub_name) return res.json({error:'Provide a club associated with this event'})
        if (!edate) return res.json({ error: "Please select a date for this event" })
        // if(!ecid) return res.json({error:'Please provide the club id'})
        if (!evenue) return res.json({ error: 'Please put the allocated venue' })
        if (!etype) return res.json({ error: 'Please select an event type ' })


        const eventInDB = await Event.findOne({ ename });
        if (eventInDB) { return res.json({ error: 'Event with this name in this club already created.' }) }


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

    } catch (error) {
        console.log(error);
        return res.json({ error: 'Event Create error, try again ' })

    }
}



const eventForm = async (req, res) => {
    try {
        const optionsMap = {
            name_tf: false,
            sapid_tf: false,
            email_tf: false,
            phone_tf: false,
            department_tf: false,
            about_yourself_tf: false
        };

        const { event_name, selectedOptions, custom_fields } = req.body;

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
            ...optionsMap,
            custom_fields: custom_fields || []
        });


        res.status(201).json({
            success: true,
            message: 'Form created successfully.',
            form: eventForm
        });
    }
    catch (error) {
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
            selectedFields: selectedFields,
            custom_fields: formData.custom_fields || []
        });
    }
    catch (error) {
        console.log("Error during form fetching: ", error);
        return res.status(500).json({
            error: 'Failed to fetch the form, please try again.'
        });
    }
}
const getAllEvents = async (req, res) => {
    try {
        const events = await Event.find({});
        res.json(events);

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Failed to fetch event data. ' })

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


        // Separate custom responses
        const standardKeys = ['event_name', 'name', 'sapid', 'email', 'phone', 'about_yourself'];
        const custom_responses = {};
        Object.keys(req.body).forEach(key => {
            if (!standardKeys.includes(key)) {
                custom_responses[key] = req.body[key];
            }
        });

        const newRegistration = await UsersRegistered.create({
            userId: user._id,
            event_name: event_name,
            name: name,
            sapid: sapid,
            email: email,
            phone: phone,
            about_yourself: about_yourself,
            custom_responses: custom_responses
        });

        // Fetch Club Details to get the email
        const eventInfo = await Event.findOne({ ename: event_name });
        let clubEmail = '';
        if (eventInfo) {
            const clubInfo = await Club.findOne({ cid: eventInfo.ecid }); // Assuming ecid matches club cid
            if (clubInfo) {
                clubEmail = clubInfo.club_email;
            }
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.uemail,
            subject: `You are in!`,
            html: `
      <h1>Registration Confirmed for ${event_name} !</h1>
      <p>Hi ${user.uname}</p>
      <p>You have successfully registered for the event: <strong>${event_name}</strong></p>
      <p>If you have any queries, please contact the club at: <strong>${clubEmail || 'Contact Club Admin'}</strong></p>
      <p>See you there !</p>
      `
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('error sending email : ', error);
            }
            else {
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
        const { update_text, event_name } = req.body; // Accept event_name
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
            update_text,
            event_name: event_name || 'General' // Default to 'General' if not provided
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

// Check club approval status
const getClubApprovalStatus = async (req, res) => {
    try {
        const { clubId } = req.body;

        const club = await Club.findById(clubId);
        if (!club) {
            return res.json({ error: 'Club not found' });
        }

        const now = new Date();
        const approvalExpired = club.approvalRequestExpiredAt && now > club.approvalRequestExpiredAt;

        return res.json({
            success: true,
            club: {
                id: club._id,
                cname: club.cname,
                cid: club.cid,
                registrationStatus: club.registrationStatus,
                isApproved: club.isApproved,
                approvalRequestSentAt: club.approvalRequestSentAt,
                approvalRequestExpiredAt: club.approvalRequestExpiredAt,
                approvalExpired: approvalExpired,
                hoursRemaining: club.approvalRequestExpiredAt ? Math.max(0, Math.floor((club.approvalRequestExpiredAt - now) / (1000 * 60 * 60))) : 0
            }
        });
    } catch (error) {
        console.log(error);
        return res.json({ error: 'Failed to fetch approval status' });
    }
};

// Resend approval request (if 24hrs expired)
const resendApprovalRequest = async (req, res) => {
    try {
        const { clubId } = req.body;

        const club = await Club.findById(clubId);
        if (!club) {
            return res.json({ error: 'Club not found' });
        }

        if (club.isApproved) {
            return res.json({ error: 'Club is already approved' });
        }

        if (club.registrationStatus === 'rejected') {
            return res.json({ error: 'Registration rejected. Cannot resend request.' });
        }

        // Create a new AdminAuth record and reset the 24-hour timer (no email)
        try {
            const approvalToken = generateApprovalToken();

            // Update club with new expiration time
            await Club.findByIdAndUpdate(clubId, {
                approvalRequestSentAt: new Date(),
                approvalRequestExpiredAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
            });

            // Create new AdminAuth record
            await AdminAuth.create({
                requestType: 'club_registration',
                clubId: club._id,
                email: 'club_registration@event_hub.local',
                name: club.cname,
                department: club.cdepartment,
                requestData: { cname: club.cname, cid: club.cid, cdepartment: club.cdepartment, resent: true },
                status: 'pending',
                approvalToken: approvalToken,
                createdAt: new Date()
            });

            return res.json({
                success: true,
                message: 'Approval request queued in admin dashboard. New 24-hour timer started.'
            });
        } catch (err) {
            console.log('Error resending approval request:', err);
            return res.json({ error: 'Failed to resend approval request' });
        }
    } catch (error) {
        console.log(error);
        return res.json({ error: 'Failed to resend approval request' });
    }
};

// Admin Management Endpoints
const getAllClubsWithEvents = async (req, res) => {
    try {
        const adminSecret = req.headers['x-admin-secret'];

        // Verify admin secret
        if (adminSecret !== process.env.ADMIN_SECRET) {
            return res.json({ error: 'Unauthorized: Invalid admin credentials' });
        }

        // Get all clubs
        const clubs = await Club.find({}).sort({ cname: 1 });

        // Get all events
        const allEvents = await Event.find({}).sort({ edate: 1 });

        // Group events by club ID
        const clubsWithEvents = clubs.map(club => {
            const clubEvents = allEvents.filter(event => event.ecid === club.cid);
            return {
                _id: club._id,
                cname: club.cname,
                cid: club.cid,
                cdepartment: club.cdepartment,
                registrationStatus: club.registrationStatus,
                isApproved: club.isApproved,
                createdAt: club.createdAt,
                events: clubEvents.map(event => ({
                    _id: event._id,
                    ename: event.ename,
                    edate: event.edate,
                    evenue: event.evenue,
                    etype: event.etype,
                    eprmsg: event.eprmsg,
                    eimage: event.eimage,
                    createdAt: event.createdAt
                }))
            };
        });

        return res.json({
            success: true,
            clubs: clubsWithEvents
        });
    } catch (error) {
        console.log(error);
        return res.json({ error: 'Failed to fetch clubs and events' });
    }
};

const deleteClub = async (req, res) => {
    try {
        const { clubId } = req.params;
        const adminSecret = req.headers['x-admin-secret'];

        // Verify admin secret
        if (adminSecret !== process.env.ADMIN_SECRET) {
            return res.json({ error: 'Unauthorized: Invalid admin credentials' });
        }

        const club = await Club.findById(clubId);
        if (!club) {
            return res.json({ error: 'Club not found' });
        }

        // Delete all events associated with this club
        const clubEvents = await Event.find({ ecid: club.cid });

        // Delete event images from Cloudinary and events from database
        for (const event of clubEvents) {
            try {
                if (event.eimagepublicid) {
                    await cloudinary.uploader.destroy(event.eimagepublicid);
                }
            } catch (cloudinaryError) {
                console.log('Error deleting image from Cloudinary:', cloudinaryError);
            }
        }
        await Event.deleteMany({ ecid: club.cid });

        // Delete event forms associated with club events
        const eventNames = clubEvents.map(e => e.ename);
        await EventRegiForm.deleteMany({ event_name: { $in: eventNames } });

        // Delete user registrations for these events
        await UsersRegistered.deleteMany({ event_name: { $in: eventNames } });

        // Delete event updates
        await EventUpdate.deleteMany({ club_id: clubId });

        // Delete admin auth records
        await AdminAuth.deleteMany({ clubId: clubId });

        // Finally, delete the club
        await Club.findByIdAndDelete(clubId);

        return res.json({
            success: true,
            message: `Club "${club.cname}" and all associated events have been deleted successfully`
        });
    } catch (error) {
        console.log(error);
        return res.json({ error: 'Failed to delete club' });
    }
};

const deleteEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        const adminSecret = req.headers['x-admin-secret'];

        // Verify admin secret
        if (adminSecret !== process.env.ADMIN_SECRET) {
            return res.json({ error: 'Unauthorized: Invalid admin credentials' });
        }

        const event = await Event.findById(eventId);
        if (!event) {
            return res.json({ error: 'Event not found' });
        }

        // Get all users to send cancellation email
        const allUsers = await User.find({}, 'uemail uname');

        // Get registered users for this event
        const registeredUsers = await UsersRegistered.find({ event_name: event.ename }, 'userId name email');

        // Send cancellation email to all users
        const emailPromises = allUsers.map(user => {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: user.uemail,
                subject: `Event Cancelled: ${event.ename}`,
                html: `
                    <h1>Event Cancellation Notice</h1>
                    <p>Hi ${user.uname},</p>
                    <p>We regret to inform you that the following event has been cancelled:</p>
                    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0;">
                        <h2 style="color: #2c3e50;">${event.ename}</h2>
                        <p><strong>Date:</strong> ${new Date(event.edate).toLocaleDateString()}</p>
                        <p><strong>Venue:</strong> ${event.evenue}</p>
                        <p><strong>Type:</strong> ${event.etype}</p>
                        <p><strong>Club:</strong> ${event.eclub_name}</p>
                    </div>
                    <p>We apologize for any inconvenience caused.</p>
                    <p>Best regards,<br>Event Hub Administration</p>
                `
            };
            return transporter.sendMail(mailOptions);
        });

        try {
            await Promise.all(emailPromises);
            console.log('Event cancellation emails sent successfully');
        } catch (emailError) {
            console.log('Error sending some cancellation emails:', emailError);
        }

        // Delete event image from Cloudinary
        try {
            if (event.eimagepublicid) {
                await cloudinary.uploader.destroy(event.eimagepublicid);
            }
        } catch (cloudinaryError) {
            console.log('Error deleting image from Cloudinary:', cloudinaryError);
        }

        // Delete event form
        await EventRegiForm.deleteOne({ event_name: event.ename });

        // Delete user registrations
        await UsersRegistered.deleteMany({ event_name: event.ename });

        // Delete the event
        await Event.findByIdAndDelete(eventId);

        return res.json({
            success: true,
            message: `Event "${event.ename}" has been deleted and cancellation emails have been sent to all users`
        });
    } catch (error) {
        console.log(error);
        return res.json({ error: 'Failed to delete event' });
    }
};

const getUserRegistrations = async (req, res) => {
    try {
        const { token } = req.cookies;
        if (!token) return res.json({ error: 'Authentication required' });

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.json({ error: 'Invalid token' });
        }

        const registrations = await UsersRegistered.find({ userId: decoded.id });

        // Enhance with event details
        const enrichedRegistrations = await Promise.all(registrations.map(async (reg) => {
            const event = await Event.findOne({ ename: reg.event_name });
            return {
                ...reg.toObject(),
                eventDetails: event ? event.toObject() : null
            };
        }));

        return res.json({ success: true, registrations: enrichedRegistrations });
    } catch (error) {
        console.log(error);
        return res.json({ error: 'Failed to fetch registrations' });
    }
};

const getAllUpdates = async (req, res) => {
    try {
        const updates = await EventUpdate.find({}).sort({ createdAt: -1 });
        return res.json({ success: true, updates });
    } catch (error) {
        console.log(error);
        return res.json({ error: 'Failed to fetch updates' });
    }
};



// Club Dashboard Controllers

const getClubEventsWithStats = async (req, res) => {
    try {
        const { token } = req.cookies;
        if (!token) return res.json({ error: 'Authentication required' });
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== 'club') return res.json({ error: 'Unauthorized' });

        const events = await Event.find({ ecid: decoded.cid });

        const now = new Date();
        const eventsWithStats = await Promise.all(events.map(async (event) => {
            const regCount = await UsersRegistered.countDocuments({ event_name: event.ename });
            const eventDate = new Date(event.edate);

            let status = 'upcoming';
            // Simple date comparison 
            if (eventDate.toDateString() === now.toDateString()) status = 'current';
            else if (eventDate < now) status = 'past';

            return {
                ...event.toObject(),
                registrationCount: regCount,
                status
            };
        }));

        return res.json({ success: true, events: eventsWithStats });

    } catch (error) {
        console.log(error);
        return res.json({ error: 'Failed to fetch club events' });
    }
};

const getClubMembers = async (req, res) => {
    try {
        const { token } = req.cookies;
        if (!token) return res.json({ error: 'Authentication required' });
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== 'club') return res.json({ error: 'Unauthorized' });

        const members = await ClubMember.find({ club_id: decoded.id }).sort({ name: 1 });
        return res.json({ success: true, members });
    } catch (error) {
        console.log(error);
        return res.json({ error: 'Failed to fetch members' });
    }
};

const addClubMember = async (req, res) => {
    try {
        const { token } = req.cookies;
        const { name, email, sapid, phone, department } = req.body;

        if (!token) return res.json({ error: 'Authentication required' });
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== 'club') return res.json({ error: 'Unauthorized' });

        if (!name || !email || !sapid) return res.json({ error: 'Name, Email and SAP ID are required' });

        const existingMember = await ClubMember.findOne({ club_id: decoded.id, sapid });
        if (existingMember) return res.json({ error: 'Member with this SAP ID already exists in the committee' });

        const newMember = await ClubMember.create({
            club_id: decoded.id,
            name,
            email,
            sapid,
            phone,
            department,
            status: 'pending' // Pending admin approval
        });

        // Create Admin Approval Request
        try {
            const approvalToken = generateApprovalToken();
            await AdminAuth.create({
                requestType: 'club_member_addition',
                clubId: decoded.id,
                email: email,
                name: name,
                department: department || 'N/A',
                requestData: {
                    memberId: newMember._id,
                    name,
                    sapid,
                    clubName: decoded.cname
                },
                status: 'pending',
                approvalToken: approvalToken,
                createdAt: new Date()
            });
        } catch (err) {
            console.log('Error creating admin auth record for member addition:', err);
            // Rollback member creation if admin request fails
            await ClubMember.deleteOne({ _id: newMember._id });
            return res.json({ error: 'Failed to process member addition request. Please try again.' });
        }

        return res.json({ success: true, member: newMember, message: 'Member added. Waiting for admin approval.' });
    } catch (error) {
        console.log(error);
        return res.json({ error: 'Failed to add member' });
    }
};

const removeClubMember = async (req, res) => {
    try {
        const { token } = req.cookies;
        const { memberId } = req.params;

        if (!token) return res.json({ error: 'Authentication required' });
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== 'club') return res.json({ error: 'Unauthorized' });

        await ClubMember.findOneAndDelete({ _id: memberId, club_id: decoded.id });
        return res.json({ success: true, message: 'Member removed successfully' });
    } catch (error) {
        console.log(error);
        return res.json({ error: 'Failed to remove member' });
    }
};

const sendInternalUpdate = async (req, res) => {
    try {
        const { token } = req.cookies;
        const { update_text } = req.body;

        if (!token) return res.json({ error: 'Authentication required' });
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== 'club') return res.json({ error: 'Unauthorized' });

        if (!update_text) return res.json({ error: 'Update text is required' });

        const members = await ClubMember.find({ club_id: decoded.id });
        if (members.length === 0) return res.json({ error: 'No members found to send updates to' });

        const emailPromises = members.map(member => {
            return transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: member.email,
                subject: `Internal Update: ${decoded.cname}`,
                html: `
                    <h3>Internal Club Update</h3>
                    <p><strong>From:</strong> ${decoded.cname} Core Committee</p>
                    <hr/>
                    <p>${update_text}</p>
                `
            });
        });

        // Send emails
        try {
            await Promise.all(emailPromises);
        } catch (err) {
            console.log("Partial email failure", err);
        }

        // Log update
        await InternalUpdate.create({
            club_id: decoded.id,
            update_text,
            sent_to_count: members.length
        });

        return res.json({ success: true, message: `Update sent to ${members.length} members.` });

    } catch (error) {
        console.log(error);
        return res.json({ error: 'Failed to send internal update' });
    }
};

// Switch User to Club Profile
const switchToClubProfile = async (req, res) => {
    try {
        const { target_club_id } = req.body; // Expecting the CLUB'S 'cid' (e.g., 'ACM') or '_id'? Let's support _id or cid if unique. 
        // Based on my previous code in loginUser, I'm passing `club_db_id` as `_id` and `club_id` as `cid`.
        // Let's expect the `club_db_id` (Mongoose ID) for security/specificity.

        const { token } = req.cookies;
        if (!token) return res.json({ error: 'Not authenticated' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Verify the user is actually a member of this club
        // We need the user's SAPID or Email from the DB based on the token ID
        const user = await User.findById(decoded.id);
        if (!user) return res.json({ error: 'User not found' });

        const targetClub = await Club.findById(target_club_id);
        if (!targetClub) return res.json({ error: 'Club not found' });

        // Check Membership
        const isMember = await ClubMember.findOne({
            club_id: targetClub._id, // ClubMember stores _id, not cid
            $or: [{ sapid: user.usapid }, { email: user.uemail }],
            status: 'approved'
        });

        if (!isMember) {
            return res.json({ error: 'You are not an authorized member of this club.' });
        }

        // Issue new token with 'club' role
        const newToken = jwt.sign(
            {
                id: targetClub._id, // ACT AS THE CLUB
                cname: targetClub.cname,
                cid: targetClub.cid,
                role: 'club',
                originalUserId: user._id // Optional: track who is acting
            },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.cookie('token', newToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000
        });

        return res.json({
            success: true,
            message: `Switched to ${targetClub.cname} dashboard`,
            club: {
                id: targetClub._id,
                cname: targetClub.cname,
                cid: targetClub.cid,
                role: 'club'
            }
        });

    } catch (error) {
        console.error("Switch profile error:", error);
        return res.json({ error: 'Failed to switch profile' });
    }
};

const getUserMemberships = async (req, res) => {
    try {
        const { token } = req.cookies;
        if (!token) return res.json({ error: 'Authentication required' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Ensure the requester is a user (or club member trying to view their personal memberships, which is tricky if they are logged in as club)
        // For now, assume 'user' role is needed, or at least we find the User entity by ID.
        // If logged in as 'club', decoded.id is the club ID. User can't view "my memberships" efficiently without original user ID.
        // Assuming this is called from User Dashboard, so role is 'user'.

        if (decoded.role !== 'user') return res.json({ error: 'This feature is for user profiles only.' });

        const user = await User.findById(decoded.id);
        if (!user) return res.json({ error: 'User not found' });

        // Find memberships
        const memberships = await ClubMember.find({
            $or: [{ sapid: user.usapid }, { email: user.uemail }],
            status: 'approved'
        });

        const clubDetails = [];
        for (const membership of memberships) {
            // club_id in ClubMember stores the Club's _id, so we must find by ID
            const club = await Club.findById(membership.club_id);
            if (club) {
                clubDetails.push({
                    _id: membership._id, // Membership ID
                    club_id: club._id,   // Club DB ID (for switching if needed later)
                    cid: club.cid,       // Club human ID
                    cname: club.cname,
                    cdepartment: club.cdepartment,
                    joining_date: membership.joining_date,
                    role: 'Member' // Or if you add roles later
                });
            }
        }

        return res.json({ success: true, memberships: clubDetails });

    } catch (error) {
        console.error("Get memberships error:", error);
        return res.json({ error: 'Failed to fetch memberships' });
    }
};

const getAvailableVenues = async (req, res) => {
    try {
        const { date } = req.body;
        if (!date) return res.json({ error: 'Date is required' });

        const events = await Event.find({ edate: date });
        const bookedVenues = events.map(e => e.evenue);



        // Return all venues and booked ones so frontend can display status
        return res.json({ success: true, allVenues: ALL_VENUES, bookedVenues });
    } catch (error) {
        console.log(error);
        return res.json({ error: 'Failed to fetch venue availability' });
    }
};

const getEventRegistrations = async (req, res) => {
    try {
        const { event_name } = req.params;
        if (!event_name) return res.json({ error: "Event name is required" });

        // Security check: Ideally we should check if the requester is the club owner of the event
        // For now, assuming middleware or dashboard context handles general protection
        // But let's verify if the event exists
        const event = await Event.findOne({ ename: event_name });
        if (!event) return res.json({ error: "Event not found" });

        const registrations = await UsersRegistered.find({ event_name: event_name }).sort({ createdAt: -1 });

        return res.json({ success: true, registrations });
    } catch (error) {
        console.error("Error fetching event registrations:", error);
        return res.json({ error: "Failed to fetch registrations" });
    }
};

module.exports = {
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
    deleteClubUpdate,
    approveAdminRequest,
    rejectAdminRequest,
    getPendingApprovals,
    getApprovalHistory,
    getClubApprovalStatus,
    resendApprovalRequest,
    getAllClubsWithEvents,
    deleteClub,
    deleteEvent,
    getUserRegistrations,
    getAllUpdates,
    getClubEventsWithStats,
    getClubMembers,
    addClubMember,
    removeClubMember,
    sendInternalUpdate,
    switchToClubProfile,
    getUserMemberships,
    getAvailableVenues,
    getEventRegistrations
};