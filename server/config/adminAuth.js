const nodemailer = require('nodemailer');
const crypto = require('crypto');
const dotenv = require('dotenv').config();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'vanditmehta7116@gmail.com';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const generateApprovalToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

const sendAdminApprovalRequest = async (requestType, userData) => {
    const approvalToken = generateApprovalToken();
    const approvalLink = `${process.env.ADMIN_DASHBOARD_URL || 'http://localhost:3000'}/admin/approve/${approvalToken}`;
    
    let subject = '';
    let emailBody = '';
    
    if (requestType === 'user_registration') {
        subject = `[ADMIN APPROVAL] New User Registration - ${userData.uname}`;
        emailBody = `
            <h2>New User Registration Request</h2>
            <p><strong>Approval Token:</strong> ${approvalToken}</p>
            <hr>
            <p><strong>User Details:</strong></p>
            <ul>
                <li><strong>Name:</strong> ${userData.uname}</li>
                <li><strong>Email:</strong> ${userData.uemail}</li>
                <li><strong>SAP ID:</strong> ${userData.usapid}</li>
                <li><strong>Department:</strong> ${userData.udepartment}</li>
                <li><strong>Phone:</strong> ${userData.uphonenumber}</li>
            </ul>
            <hr>
            <p><a href="${approvalLink}?action=approve&type=user_registration" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">APPROVE</a>
            <a href="${approvalLink}?action=reject&type=user_registration" style="background-color: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-left: 10px;">REJECT</a></p>
        `;
    } else if (requestType === 'user_login') {
        subject = `[ADMIN APPROVAL] User Login Request - ${userData.uname}`;
        emailBody = `
            <h2>User Login Approval Request</h2>
            <p><strong>Approval Token:</strong> ${approvalToken}</p>
            <hr>
            <p><strong>User Details:</strong></p>
            <ul>
                <li><strong>Name:</strong> ${userData.uname}</li>
                <li><strong>Email:</strong> ${userData.uemail}</li>
                <li><strong>SAP ID:</strong> ${userData.usapid}</li>
            </ul>
            <p><strong>Login Timestamp:</strong> ${new Date().toLocaleString()}</p>
            <hr>
            <p><a href="${approvalLink}?action=approve&type=user_login" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">APPROVE</a>
            <a href="${approvalLink}?action=reject&type=user_login" style="background-color: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-left: 10px;">REJECT</a></p>
        `;
    } else if (requestType === 'club_registration') {
        subject = `[ADMIN APPROVAL] New Club Registration - ${userData.cname}`;
        emailBody = `
            <h2>New Club Registration Request</h2>
            <p><strong>Approval Token:</strong> ${approvalToken}</p>
            <hr>
            <p><strong>Club Details:</strong></p>
            <ul>
                <li><strong>Club Name:</strong> ${userData.cname}</li>
                <li><strong>Club ID:</strong> ${userData.cid}</li>
                <li><strong>Department:</strong> ${userData.cdepartment}</li>
            </ul>
            <hr>
            <p><a href="${approvalLink}?action=approve&type=club_registration" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">APPROVE</a>
            <a href="${approvalLink}?action=reject&type=club_registration" style="background-color: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-left: 10px;">REJECT</a></p>
        `;
    } else if (requestType === 'club_login') {
        subject = `[ADMIN APPROVAL] Club Login Request - ${userData.cname}`;
        emailBody = `
            <h2>Club Login Approval Request</h2>
            <p><strong>Approval Token:</strong> ${approvalToken}</p>
            <hr>
            <p><strong>Club Details:</strong></p>
            <ul>
                <li><strong>Club Name:</strong> ${userData.cname}</li>
                <li><strong>Club ID:</strong> ${userData.cid}</li>
            </ul>
            <p><strong>Login Timestamp:</strong> ${new Date().toLocaleString()}</p>
            <hr>
            <p><a href="${approvalLink}?action=approve&type=club_login" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">APPROVE</a>
            <a href="${approvalLink}?action=reject&type=club_login" style="background-color: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-left: 10px;">REJECT</a></p>
        `;
    }

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: ADMIN_EMAIL,
        subject: subject,
        html: emailBody
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Admin approval email sent for ${requestType}`);
        return approvalToken;
    } catch (error) {
        console.log('Error sending admin approval email:', error);
        throw new Error('Failed to send approval request to admin');
    }
};

const sendUserNotification = async (email, status, requestType) => {
    let subject = '';
    let message = '';
    
    if (status === 'approved') {
        subject = 'Your Request Has Been Approved!';
        message = `Your ${requestType.replace('_', ' ')} request has been approved by the admin. You can now proceed.`;
    } else {
        subject = 'Your Request Has Been Rejected';
        message = `Your ${requestType.replace('_', ' ')} request has been rejected by the admin. Please contact the admin for more details.`;
    }

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: subject,
        html: `
            <h2>${subject}</h2>
            <p>${message}</p>
            <hr>
            <p>If you have any questions, please contact the admin at ${ADMIN_EMAIL}</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`User notification email sent to ${email}`);
    } catch (error) {
        console.log('Error sending user notification email:', error);
    }
};

module.exports = {
    ADMIN_EMAIL,
    generateApprovalToken,
    sendAdminApprovalRequest,
    sendUserNotification
};
