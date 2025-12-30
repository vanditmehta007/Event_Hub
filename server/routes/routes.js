const express = require('express')
const router = express.Router();
const cors = require('cors')
const dotenv = require('dotenv').config()
const { logoutUser, getProfile, getAllEvents, userLogin, userReg, userRegEvent, clubLogin, clubReg, verifyClubOTP, eventForm, eventFormBuilt, eventSet, createEventUpdate, getClubUpdate, deleteClubUpdate, createEventForm, approveAdminRequest, rejectAdminRequest, getPendingApprovals, getApprovalHistory, getClubApprovalStatus, resendApprovalRequest, getAllClubsWithEvents, deleteClub, deleteEvent, getUserRegistrations, getAllUpdates, getClubEventsWithStats, getClubMembers, addClubMember, removeClubMember, sendInternalUpdate, switchToClubProfile, getUserMemberships, getAvailableVenues, getEventRegistrations } = require("../controllers/controllers")
const upload = require('../config/cloudinary');
//route-map below-

router.post('/ulogin', userLogin)
router.post('/clogin', clubLogin)
router.post('/uregister', userReg)
router.post('/cregister', clubReg)
router.post('/verify-club-otp', verifyClubOTP)
router.post('/createevent', upload.single('eimage'), eventSet)
router.post('/createeventform', eventForm)
router.post('/userregevent', userRegEvent)
router.get('/event-form/:event_name', eventFormBuilt)
router.get('/events', getAllEvents);
router.get('/profile', getProfile);
router.post('/logout', logoutUser);

router.get('/user/registrations', getUserRegistrations);
router.get('/notifications', getAllUpdates);

// Event Updates routes
router.post('/club-update', createEventUpdate);
router.get('/club-update', getClubUpdate);
router.delete('/club-update/:update_id', deleteClubUpdate);

// Admin Approval Routes
router.post('/admin/approve/:approvalToken', approveAdminRequest);
router.post('/admin/reject/:approvalToken', rejectAdminRequest);
router.get('/admin/pending-approvals', getPendingApprovals);
router.get('/admin/approval-history', getApprovalHistory);

// Club Approval Status Routes
router.post('/club/approval-status', getClubApprovalStatus);
router.post('/club/resend-approval', resendApprovalRequest);

// Admin Management Routes
router.get('/admin/clubs-events', getAllClubsWithEvents);
router.delete('/admin/club/:clubId', deleteClub);
router.delete('/admin/event/:eventId', deleteEvent);

// Club Dashboard Routes
router.get('/club/events-stats', getClubEventsWithStats);
router.get('/club/members', getClubMembers);
router.post('/club/members', addClubMember);
router.delete('/club/members/:memberId', removeClubMember);
router.post('/club/internal-updates', sendInternalUpdate);

router.post('/user/switch-to-club', switchToClubProfile);
router.get('/user/memberships', getUserMemberships);

router.post('/venues/available', getAvailableVenues);
router.get('/club/event-registrations/:event_name', getEventRegistrations);

module.exports = router