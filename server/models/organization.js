//
// LibreTexts Conductor
// organization.js
// Mongoose Model
//

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrganizationSchema = new Schema({
    orgID: {                        // the organization's internal identifier string
        type: String,
        required: true
    },
    name: {                         // the organization's full name
        type: String,
        required: true
    },
    shortName: String,              // the organization's shortened name
    abbreviation: String,           // the organization's abbreviation
    coverPhoto: String,             // the organization's large "cover photo"
    largeLogo: String,              // the organization's large/main logo
    mediumLogo: String,             // the organization's medium/secondary logo
    smallLogo: String,              // the organization's smallest logo or icon
    aboutLink: String               // the organization's "About" page link
}, {
    timestamps: true
});

const Organization = mongoose.model('Organization', OrganizationSchema);

module.exports = Organization;
