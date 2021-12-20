//
// LibreTexts Conductor
// mail.js
//

const Mailgun = require('mailgun.js');
const formData = require('form-data');
const { debugError } = require('../debug.js');
const conductorErrors = require('../conductor-errors.js');
const marked = require('marked');
const { isEmptyString, truncateString } = require('../util/helpers.js');

const mgInstance = new Mailgun(formData);
const mailgun = mgInstance.client({
    username: 'api',
    key: process.env.MAILGUN_API_KEY
});


const autoGenNoticeText = '. This message was auto-generated by the Conductor platform. Replies to this address are not monitored.';
const autoGenNoticeHTML = '<br><p><em>This message was auto-generated by the Conductor platform. Replies to this address are not monitored.</em></p>';


/**
 * Sends a standard Reset Password email to a user via the Mailgun API.
 * NOTE: Do NOT use this method directly from a Conductor API route. Use internally
 *  only after proper verification via other internal methods.
 * @param {string} recipientAddress  - the user's email address
 * @param {string} recipientName     - the user's name ('firstName' or 'firstName lastName')
 * @param {string} resetLink         - the URL to use the access the reset form with token
 * @returns {Promise<Object|Error>} a Mailgun API promise
 */
const sendPasswordReset = (recipientAddress, recipientName, resetLink) => {
    return mailgun.messages.create(process.env.MAILGUN_DOMAIN, {
        from: 'LibreTexts Conductor <conductor@noreply.libretexts.org>',
        to: [recipientAddress],
        subject: 'Reset Your Conductor Password',
        text: `Hi ${recipientName}, we received a request to reset your Conductor password. Please follow this link to reset your password: ${resetLink}. This link will expire in 30 minutes. If you did not initiate this request, you can ignore this email. Sincerely, The LibreTexts team` + autoGenNoticeText,
        html: `<p>Hi ${recipientName},</p><p>We received a request to reset your Conductor password. Please follow this link to reset your password:</p><a href='${resetLink}' target='_blank' rel='noopener noreferrer'>Reset Conductor Password</a><p>This link will expire in 30 minutes. If you did not initiate this request, you can ignore this email.</p><p>Sincerely,</p><p>The LibreTexts team</p>` + autoGenNoticeHTML
    });
};


/**
 * Sends a standard Welcome email to a user via the Mailgun API.
 * NOTE: Do NOT use this method directly from a Conductor API route. Use internally
 *  only after proper verification via other internal methods.
 * @param {string} recipientAddress  - the user's email address
 * @param {string} recipientName     - the user's name ('firstName' or 'firstName lastName')
 * @returns {Promise<Object|Error>} a Mailgun API promise
 */
const sendRegistrationConfirmation = (recipientAddress, recipientName) => {
    return mailgun.messages.create(process.env.MAILGUN_DOMAIN, {
        from: 'LibreTexts Conductor <conductor@noreply.libretexts.org>',
        to: [recipientAddress],
        subject: 'Welcome to Conductor',
        text: `Hi ${recipientName}, welcome to Conductor! You can access your account using this email and the password you set during registration. Remember, Conductor accounts are universal — you can use this account on any Conductor instance in the LibreNet. Sincerely, The LibreTexts team` + autoGenNoticeText,
        html: `<p>Hi ${recipientName},</p><h2>Welcome to Conductor!</h2><p>You can access your account using your email and the password you set during registration.</p><p><em>Remember, Conductor accounts are universal — you can use this account on any Conductor instance in the LibreNet.</em></p><p>Sincerely,</p><p>The LibreTexts team</p>` + autoGenNoticeHTML
    })
};


/**
 * Sends a standard Password Change Notification email to a user via the Mailgun API.
 * NOTE: Do NOT use this method directly from a Conductor API route. Use internally
 *  only after proper verification via other internal methods.
 * @param {string} recipientAddress  - the user's email address
 * @param {string} recipientName     - the user's name ('firstName' or 'firstName lastName')
 * @returns {Promise<Object|Error>} a Mailgun API promise
 */
const sendPasswordChangeNotification = (recipientAddress, recipientName) => {
    return mailgun.messages.create(process.env.MAILGUN_DOMAIN, {
        from: 'LibreTexts Conductor <conductor@noreply.libretexts.org>',
        to: [recipientAddress],
        subject: 'Conductor Password Updated',
        text: `Hi ${recipientName}, You're receiving this email because your Conductor password was recently updated via the Conductor web application. If this was you, you can safely ignore this message. If this wasn't you, please reach out to us as soon as possible at info@libretexts.org. Sincerely, The LibreTexts team` + autoGenNoticeText,
        html: `<p>Hi ${recipientName},</p><p>You're receiving this email because your Conductor password was recently updated via the Conductor web application.</p><p>If this was you, you can safely ignore this message. If this wasn't you, please reach out to us as soon as possible at <a href='mailto:info@libretexts.org?subject=Unauthorized%20Conductor%20Password%20Change' target='_blank' rel='noopener noreferrer'>info@libretexts.org</a>.</p><p>Sincerely,</p><p>The LibreTexts team</p>` + autoGenNoticeHTML
    })
};


/**
 * Sends a standard Added as Team Member email to a user via the Mailgun API.
 * NOTE: Do NOT use this method directly from a Conductor API route. Use internally
 *  only after proper verification via other internal methods.
 * @param {string} recipientAddress  - the newly added user's email address
 * @param {string} recipientName     - the newly added user's name ('firstName' or 'firstName lastName')
 * @param {string} projectID         - the internal project identifier string
 * @param {string} projectName       - the project's title/name
 * @returns {Promise<Object|Error>} a Mailgun API Promise
 */
const sendAddedAsMemberNotification = (recipientAddress, recipientName, projectID, projectName) => {
    return mailgun.messages.create(process.env.MAILGUN_DOMAIN, {
        from: 'LibreTexts Conductor <conductor@noreply.libretexts.org>',
        to: [recipientAddress],
        subject: `Added as Team Member: ${projectName}`,
        text: `Hi ${recipientName}, You're receiving this email because you were added as a team member in the "${projectName}" project on the LibreTexts Conductor Platform. You can access this project by visiting ${process.env.LIBRE_SUBDOMAIN}.libretexts.org and opening the Projects tab. Sincerely, The LibreTexts team` + autoGenNoticeText,
        html: `<p>Hi ${recipientName},</p><p>You're receiving this email because you were added as a team member in the <a href='http://${process.env.LIBRE_SUBDOMAIN}.libretexts.org/projects/${projectID}' target='_blank' rel='noopener noreferrer'>${projectName}</a> project on the LibreTexts Conductor Platform.</p>You can access this project by clicking the project's name in this email, or by visiting <a href='http://${process.env.LIBRE_SUBDOMAIN}.libretexts.org' target='_blank' rel='noopener noreferrer'>Conductor</a> and opening the Projects tab.</p><p>Sincerely,</p><p>The LibreTexts team</p>` + autoGenNoticeHTML
    });
};


/**
 * Sends a standard LibreText Publishing Requested email to the LibreTexts team via the Mailgun API.
 * NOTE: Do NOT use this method directly from a Conductor API route. Use internally
 *  only after proper verification via other internal methods.
 * @param {String} requesterName     - the requesting user's name ('firstName' or 'firstName lastName')
 * @param {String} projectID         - the internal project identifier string
 * @param {String} projectName       - the project's title/name
 * @param {String} projectLibrary    - the shortened internal LibreTexts library identifer
 * @param {String} projectCoverID    - the coverpage ID of the LibreText
 * @returns {Promise<Object|Error>} a Mailgun API Promise
 */
const sendPublishingRequestedNotification = (requesterName, projectID, projectName, projectLibrary, projectCoverID) => {
    let textToSend = `Attention: A user, ${requesterName}, has requested that their project, ${projectName}, be formally published on LibreTexts using the Conductor platform. `;
    let htmlToSend = `<p>Attention:</p><p>A user, ${requesterName}, has requested that their project, <a href='http://${process.env.LIBRE_SUBDOMAIN}.libretexts.org/projects/${projectID}' target='_blank' rel='noopener noreferrer'>${projectName}</a>, be formally published on LibreTexts using the Conductor platform.</p>`;
    if (projectLibrary !== null) {
        if (projectCoverID !== null) {
            textToSend += `The LibreText is located in the ${projectLibrary} library, with pageID: ${projectCoverID}.`;
            htmlToSend += `<p>The LibreText is located in the <a href='http://${projectLibrary}.libretexts.org/@go/page/${projectCoverID}' target='_blank' rel='noopener noreferrer'>${projectLibrary}</a> library.</p>`;
        } else {
            textToSend += `The LibreText is located in the ${projectLibrary} library.`;
            htmlToSend += `<p>The LibreText is located in the ${projectLibrary} library.</p>`;
        }
    }
    textToSend += `The Conductor project is available in the ${process.env.ORG_ID} instance.` + autoGenNoticeText;
    htmlToSend += `<p>The Conductor project is available in the <strong>${process.env.ORG_ID}</strong> instance.</p><p><em>This message was auto-generated by the Conductor platform.</em></p>` + autoGenNoticeHTML;
    return mailgun.messages.create(process.env.MAILGUN_DOMAIN, {
        from: 'LibreTexts Conductor <conductor@noreply.libretexts.org>',
        to: ['info@libretexts.org'],
        subject: `LibreText Publishing Requested: ${projectName}`,
        text: textToSend,
        html: htmlToSend
    });
};


/**
 * Sends a standard OER Integration Request Confirmation notification to the requester via the Mailgun API.
 * NOTE: Do NOT use this method directly from a Conductor API route. Use internally
 *  only after proper verification via other internal methods.
 * @param {String} requesterName     - the requesting user's name (null, or 'firstName' or 'firstName lastName')
 * @param {String} recipientAddress  - the requesting user's email
 * @param {String} resourceTitle     - the resource's title/name
 * @returns {Promise<Object|Error>} a Mailgun API Promise
 */
const sendOERIntRequestConfirmation = (requesterName, recipientAddress, resourceTitle) => {
    let textToSend = `Hi ${requesterName}, LibreTexts has received your OER Integration Request for "${resourceTitle}". You should receive an email when we have reviewed your request. If you have any questions, please contact us at info@libretexts.org. Sincerely, The LibreTexts team` + autoGenNoticeText;
    let htmlToSend = `<p>Hi ${requesterName},</p><p>LibreTexts has received your OER Integration Request for "${resourceTitle}". You should receive an email when we have reviewed your request. If you have any questions, please contact us at <a href='mailto:info@libretexts.org?subject=OER Integration Request Questions' target='_blank' rel='noopener noreferrer'>info@libretexts.org</a>.</p><p>Sincerely,</p><p>The LibreTexts team</p>` + autoGenNoticeHTML;
    return mailgun.messages.create(process.env.MAILGUN_DOMAIN, {
        from: 'LibreTexts Conductor <conductor@noreply.libretexts.org>',
        to: [recipientAddress],
        subject: 'LibreTexts OER Integration Request Received',
        text: textToSend,
        html: htmlToSend
    });
};


/**
 * Sends a standard New OER Integration Request notification to the LibreTexts team via the Mailgun API.
 * NOTE: Do NOT use this method directly from a Conductor API route. Use internally
 *  only after proper verification via other internal methods.
 * @param {String} requesterName     - the requesting user's name ('firstName' or 'firstName lastName')
 * @param {String} resourceTitle     - the resource's title/name
 * @returns {Promise<Object|Error>} a Mailgun API Promise
 */
const sendOERIntRequestAdminNotif = (requesterName, resourceTitle) => {
    let textToSend = `Attention: ${requesterName} has submitted a new OER Integration Request for "${resourceTitle}". This request is available in Conductor.` + autoGenNoticeText;
    let htmlToSend = `<p>Attention:</p><p>${requesterName} has submitted a new OER Integration Request for "${resourceTitle}".</p><p>This request is available in Conductor.</p>` + autoGenNoticeHTML;
    return mailgun.messages.create(process.env.MAILGUN_DOMAIN, {
        from: 'LibreTexts Conductor <conductor@noreply.libretexts.org>',
        to: ['info@libretexts.org'],
        subject: 'New OER Integration Request',
        text: textToSend,
        html: htmlToSend
    });
};


/**
 * Sends a standard OER Integration Request Approval notification to the requester via the Mailgun API.
 * NOTE: Do NOT use this method directly from a Conductor API route. Use internally
 *  only after proper verification via other internal methods.
 * @param {String} requesterName     - the requesting user's name (null, or 'firstName' or 'firstName lastName')
 * @param {String} recipientAddress  - the requesting user's email
 * @param {String} resourceTitle     - the resource's title/name
 * @returns {Promise<Object|Error>} a Mailgun API Promise
 */
const sendOERIntRequestApproval = (requesterName, recipientAddress, resourceTitle) => {
    let textToSend = `Hi`;
    let htmlToSend = `<p>Hi`;
    if (requesterName !== null) {
        textToSend += ` ${requesterName}, `;
        htmlToSend += ` ${requesterName},</p>`;
    } else {
        textToSend += ', ';
        htmlToSend += ',</p>';
    }
    textToSend += `LibreTexts has approved your OER Integration Request for "${resourceTitle}" and has converted it to a project on our Conductor platform. If you indicated on the request form, you should have been automatically added to the project which can be found in the "Projects" tab. Otherwise, contact LibreTexts at info@libretexts.org for help accessing Conductor if you'd like to track the progress as it changes. Sincerely, The LibreTexts team` + autoGenNoticeText;
    htmlToSend += `<p>LibreTexts has approved your OER Integration Request for "${resourceTitle}" and has converted it to a project on our Conductor platform.</p><p>If you indicated on the request form, you should have been automatically added to the project which can be found in the <em>Projects</em> tab. Otherwise, contact LibreTexts at <a href='mailto:info@libretexts.org?subject=Conductor Access' target='_blank' rel='noopener noreferrer'>info@libretexts.org</a> for help accessing Conductor if you'd like to track the progress as it changes.</p><p>Sincerely,</p><p>The LibreTexts team</p>` + autoGenNoticeHTML;
    return mailgun.messages.create(process.env.MAILGUN_DOMAIN, {
        from: 'LibreTexts Conductor <conductor@noreply.libretexts.org>',
        to: [recipientAddress],
        subject: `LibreTexts OER Integration Request Approved`,
        text: textToSend,
        html: htmlToSend
    });
};


/**
 * Sends a standard Project Flagged notification to the respective group via the Mailgun API.
 * NOTE: Do NOT use this method directly from a Conductor API route. Use internally
 *  only after proper verification via other internal methods.
 * @param {String} recipients       - the flagging group to notify
 * @param {String} projectID        - the flagged project's internal ID
 * @param {String} projectTitle     - the flagged project's title
 * @param {String} projectOrg       - the flagged project's organization
 * @param {String} flaggingGroup    - the flagging group's title
 * @param {String} flagDescrip      - the description of the reason for flagging
 * @returns {Promise<Object|Error>} a Mailgun API Promise
 */
const sendProjectFlaggedNotification = (recipients, projectID, projectTitle, projectOrg, flaggingGroup, flagDescrip) => {
    let textToSend = `Attention: A team member of the "${projectTitle}" project (available in the ${projectOrg} instance) on Conductor has flagged their project and requested that you (${flaggingGroup}) review it.`;
    let htmlToSend = `<p>Attention:</p><p>A team member of the <a href='https://commons.libretexts.org/projects/${projectID}' target='_blank' rel='noopener noreferrer'>${projectTitle}</a> project (available in the <strong>${projectOrg}</strong> instance) on Conductor has flagged their project and requested that you (<em>${flaggingGroup}</em>) review it.</p>`;
    if (!isEmptyString(flagDescrip)) {
        let truncDescrip = truncateString(flagDescrip, 500);
        textToSend += `Reason for flagging (full description available on Conductor): ${truncDescrip}.`;
        textToSend += `<p>Reason for flagging (full description available on Conductor):</p><p>${marked.parseInline(truncDescrip)}</p>`;
    }
    textToSend += `You can find this project in the "Flagged Projects" option under the "Projects" tab in Conductor. Sincerely, The LibreTexts team` + autoGenNoticeText;
    htmlToSend += `<p>You can find this project in the <em>Flagged Projects</em> option under the <em>Projects</em> tab in Conductor.</p><p>Sincerely,</p><p>The LibreTexts team</p>` + autoGenNoticeHTML;
    return mailgun.messages.create(process.env.MAILGUN_DOMAIN, {
        from: 'LibreTexts Conductor <conductor@noreply.libretexts.org>',
        to: ['conductor@noreply.libretexts.org'],
        bcc: recipients,
        subject: `Conductor Project Flagged for Review: ${projectTitle}`,
        text: textToSend,
        html: htmlToSend
    });
};


/**
 * Sends a standard New Project Messages notification to the respective group via the Mailgun API.
 * NOTE: Do NOT use this method directly from a Conductor API route. Use internally
 *  only after proper verification via other internal methods.
 * @param {String} recipients       - the users to notify
 * @param {String} projectID        - the project's internal ID
 * @param {String} projectTitle     - the project's title
 * @param {String} projectOrg       - the project's organization
 * @param {String} messagesKind     - the Discussion section the messages are in
 * @param {String} threadTitle      - the relevant thread's title
 * @param {String} messageText      - the recent message text
 * @returns {Promise<Object|Error>} a Mailgun API Promise
 */
const sendNewProjectMessagesNotification = (recipients, projectID, projectTitle, projectOrg, messagesKind, threadTitle, messageText) => {
    let textToSend = `Attention: New messages are available in the "${threadTitle}" thread (${messagesKind} Discussion) of the "${projectTitle}" project on Conductor.`;
    let htmlToSend = `<p>Attention:</p><p>New messages are available in the <em>${threadTitle}</em> thread (<em>${messagesKind} Discussion</em>) of the <a href='https://commons.libretexts.org/projects/${projectID}' target='_blank' rel='noopener noreferrer'>${projectTitle}</a> project on Conductor.</p>`;
    if (!isEmptyString(messageText)) {
        let truncMsg = truncateString(messageText, 500);
        textToSend += `Recent message: ${truncMsg}.`;
        htmlToSend += `<p><strong>Recent message:<strong></p><p>${marked.parseInline(truncMsg)}</p><br>`;
    }
    textToSend += `This project is available in the ${projectOrg} instance. Sincerely, The LibreTexts team` + autoGenNoticeText;
    htmlToSend += `<p>This project is available in the <strong>${projectOrg}</strong> instance.</p><p>Sincerely,</p><p>The LibreTexts team</p>` + autoGenNoticeHTML;
    return mailgun.messages.create(process.env.MAILGUN_DOMAIN, {
        from: 'LibreTexts Conductor <conductor@noreply.libretexts.org>',
        to: ['conductor@noreply.libretexts.org'],
        bcc: recipients,
        subject: `New Messages in ${projectTitle}`,
        text: textToSend,
        html: htmlToSend
    });
};


/**
 * Sends a standard LibreTexts Alert (Project Completed) notification to the
 * respective group via the Mailgun API.
 * NOTE: Do NOT use this method directly from a Conductor API route. Use internally
 *  only after proper verification via other internal methods.
 * @param {String} recipients       - the users to notify
 * @param {String} projectID        - the project's internal ID
 * @param {String} projectTitle     - the project's title
 * @param {String} projectOrg       - the project's organization
 * @returns {Promise<Object|Error>} a Mailgun API Promise
 */
const sendProjectCompletedAlert = (recipients, projectID, projectTitle, projectOrg) => {
    let textToSend = `Attention: The "${projectTitle}" project on Conductor has been marked as completed. This project is available in the ${projectOrg} instance. You are receiving this message because you enabled a LibreTexts Alert for this project, or you submitted the OER Integration Request this project originated from. Sincerely, The LibreTexts team` + autoGenNoticeText;
    let htmlToSend = `<p>Attention:</p><p>The <a href='https://commons.libretexts.org/projects/${projectID}' target='_blank' rel='noopener noreferrer'>${projectTitle}</a> project on Conductor has been marked as completed. This project is available in the <strong>${projectOrg}</strong> instance.</p><p><em>You are receiving this message because you enabled a LibreTexts Alert for this project, or you submitted the OER Integration Request this project originated from.</em></p><p>Sincerely,</p><p>The LibreTexts team</p>` + autoGenNoticeHTML;
    return mailgun.messages.create(process.env.MAILGUN_DOMAIN, {
        from: 'LibreTexts Conductor <conductor@noreply.libretexts.org>',
        to: ['conductor@noreply.libretexts.org'],
        bcc: recipients,
        subject: `LibreTexts Alert: ${projectTitle} is Complete`,
        text: textToSend,
        html: htmlToSend
    });
};


/**
 * Sends a standard Assigned to Task email to the respective user
 * via the Mailgun API.
 * NOTE: Do NOT use this method directly from a Conductor API route. Use internally
 *  only after proper verification via other internal methods.
 * @param {String} recipient        - the user to notify
 * @param {String} projectID        - the project's internal ID
 * @param {String} projectTitle     - the project's title
 * @param {String} projectOrg       - the project's organization
 * @param {String} taskTitle        - the task's title
 * @returns {Promise<Object|Error>} a Mailgun API Promise
 */
const sendAssignedToTaskNotification = (recipient, projectID, projectTitle, projectOrg, taskTitle) => {
    let textToSend = `Attention: You have been assigned to the "${taskTitle}" task in the ${projectTitle} project on Conductor. This project is available in the ${projectOrg} instance. Sincerely, The LibreTexts team` + autoGenNoticeText;
    let htmlToSend = `<p>Attention:</p><p>You have been assigned to the <em>${taskTitle}</em> task in the <a href='https://commons.libretexts.org/projects/${projectID}' target='_blank' rel='noopener noreferrer'>${projectTitle}</a> project on Conductor. This project is available in the <strong>${projectOrg}</strong> instance.</p><p>Sincerely,</p><p>The LibreTexts team</p>` + autoGenNoticeHTML;
    return mailgun.messages.create(process.env.MAILGUN_DOMAIN, {
        from: 'LibreTexts Conductor <conductor@noreply.libretexts.org>',
        to: [recipient],
        subject: `Task Assigned: ${taskTitle}`,
        text: textToSend,
        html: htmlToSend
    });
};


/**
 * Sends a standard Account(s) Request Confirmation notification to the requester via the Mailgun API.
 * NOTE: Do NOT use this method directly from a Conductor API route. Use internally
 *  only after proper verification via other internal methods.
 * @param {String} requesterName - the requesting user's name (null, or 'firstName' or 'firstName lastName').
 * @param {String} recipientAddress - the requesting user's email.
 * @returns {Promise<Object|Error>} a Mailgun API Promise
 */
 const sendAccountRequestConfirmation = (requesterName, recipientAddress) => {
    let textToSend = `Hi ${requesterName}, LibreTexts has received your Instructor Account(s) Request. You should receive an email when we have reviewed your request. If you have any questions, please contact us at info@libretexts.org. Sincerely, The LibreTexts team` + autoGenNoticeText;
    let htmlToSend = `<p>Hi ${requesterName},</p><p>LibreTexts has received your Instructor Account(s) Request. You should receive an email when we have reviewed your request. If you have any questions, please contact us at <a href='mailto:info@libretexts.org?subject=Instructor Accounts Request Questions' target='_blank' rel='noopener noreferrer'>info@libretexts.org</a>.</p><p>Sincerely,</p><p>The LibreTexts team</p>` + autoGenNoticeHTML;
    return mailgun.messages.create(process.env.MAILGUN_DOMAIN, {
        from: 'LibreTexts Conductor <conductor@noreply.libretexts.org>',
        to: [recipientAddress],
        subject: 'LibreTexts Instructor Account(s) Request Received',
        text: textToSend,
        html: htmlToSend
    });
};


/**
 * Sends a standard New Account(s) Request notification to the LibreTexts team via the Mailgun API.
 * NOTE: Do NOT use this method directly from a Conductor API route. Use internally
 *  only after proper verification via other internal methods.
 * @returns {Promise<Object|Error>} a Mailgun API Promise
 */
 const sendAccountRequestAdminNotif = () => {
    let textToSend = `Attention: A user has submitted a new Instructor Account(s) Request for LibreTexts libraries access. This request is available in Conductor.` + autoGenNoticeText;
    let htmlToSend = `<p>Attention:</p><p>A user has submitted a new Instructor Account(s) Request for LibreTexts libraries access.</p><p>This request is available in Conductor.</p>` + autoGenNoticeHTML;
    return mailgun.messages.create(process.env.MAILGUN_DOMAIN, {
        from: 'LibreTexts Conductor <conductor@noreply.libretexts.org>',
        to: ['info@libretexts.org'],
        subject: 'New Instructor Account(s) Request',
        text: textToSend,
        html: htmlToSend
    });
};


/**
 * Sends a standard Account(s) Request Approval notification to the requester via the Mailgun API.
 * NOTE: Do NOT use this method directly from a Conductor API route. Use internally
 *  only after proper verification via other internal methods.
 * @param {String} requesterName     - the requesting user's name (null, or 'firstName' or 'firstName lastName')
 * @param {String} recipientAddress  - the requesting user's email
 * @returns {Promise<Object|Error>} a Mailgun API Promise
 */
 const sendAccountRequestApprovalNotification = (requesterName, recipientAddress) => {
    let textToSend = `Hi ${requesterName}, LibreTexts has approved your Instructor Account(s) Request. You should have received seperate emails with information about your new account(s). Please check your spam/junk folder if you have not received them. Otherwise, contact LibreTexts at info@libretexts.org for assistance. Sincerely, The LibreTexts team` + autoGenNoticeText;
    let htmlToSend = `<p>Hi ${requesterName},</p><p>LibreTexts has approved your Instructor Account(s) Request.</p><p>You should have received seperate emails with information about your new account(s).</p><p><em>Please check your spam/junk folder if you have not received them. Otherwise, contact LibreTexts at <a href='mailto:info@libretexts.org?subject=New Instructor Accounts' target='_blank' rel='noopener noreferrer'>info@libretexts.org</a> for assistance.</p><p>Sincerely,</p><p>The LibreTexts team</p>` + autoGenNoticeHTML;
    return mailgun.messages.create(process.env.MAILGUN_DOMAIN, {
        from: 'LibreTexts Conductor <conductor@noreply.libretexts.org>',
        to: [recipientAddress],
        subject: `LibreTexts Instructor Account(s) Request Approved`,
        text: textToSend,
        html: htmlToSend
    });
};


module.exports = {
    sendPasswordReset,
    sendRegistrationConfirmation,
    sendPasswordChangeNotification,
    sendAddedAsMemberNotification,
    sendPublishingRequestedNotification,
    sendOERIntRequestConfirmation,
    sendOERIntRequestAdminNotif,
    sendOERIntRequestApproval,
    sendProjectFlaggedNotification,
    sendNewProjectMessagesNotification,
    sendProjectCompletedAlert,
    sendAssignedToTaskNotification,
    sendAccountRequestConfirmation,
    sendAccountRequestAdminNotif,
    sendAccountRequestApprovalNotification
}
