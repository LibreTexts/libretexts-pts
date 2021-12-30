//
// LibreTexts Conductor
// project.js
// Mongoose Model
//

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const { projectClassifications } = require('../util/projectutils.js');
const { a11ySectionReviewSchema } = require('../util/a11yreviewutils.js');

const ProjectSchema = new Schema({
    orgID: {                    // organization identifier string
        type: String,
        required: true
    },
    projectID: {                // base62 10-digit identifier
        type: String,
        required: true
    },
    title: {                    // project title
        type: String,
        required: true
    },
    status: {                   // project status, one of: 'available', 'open', 'completed', 'flagged'
        type: String,
        default: 'available'
    },
    visibility: {
        type: String,           // project privacy, one of: 'public', 'private'
        default: 'private'
    },
    currentProgress: {          // estimated project progress (%)
        type: Number,
        default: 0
    },
    peerProgress: {             // estimated project peer review progress (%)
        type: Number,
        default: 0
    },
    a11yProgress: {             // estimated project accessibility progress/score (%)
        type: Number,
        default: 0
    },
    classification: {           // the project's internal classification
        type: String,
        enum: ['', ...projectClassifications]
    },
    leads: [String],            // project leads (privileged) (UUIDs)
    liaisons: [String],         // project liaisons (campus admins, privileged) (UUIDs)
    members: [String],          // project team members (semi-privileged) (UUIDs)
    auditors: [String],         // users with access to view (low-privileged) (UUIDs)
    libreLibrary: String,       // the corresponding LibreText's library
    libreCoverID: String,       // the corresponding LibreText's Coverpage ID,
    libreShelf: String,         // the 'Bookshelf' if the LibreText is not a campus text
    libreCampus: String,        // the 'Campus' if the LibreText is a campus text
    author: String,             // resource author (if applicable)
    authorEmail: String,        // resource author's email (if applicable)
    license: String,            // resource license (if applicable)
    resourceURL: String,        // resource original URL (if applicable)
    projectURL: String,         // the URL where the project exists (if applicable, typically a LibreTexts lib link)
    tags: [String],             // project tags (tagIDs)
    notes: String,              // project notes/description
    rdmpReqRemix: Boolean,      // whether the Construction Roadmap indicates remixing is required
    rdmpCurrentStep: String,    // the project's current step in the Construction Roadmap,
    a11yReview: [               // the text section accessibility reviews
        a11ySectionReviewSchema
    ],
    harvestReqID: String,       // the _id of the Harvesting Request the project was converted from (if applicable)
    flag: String,               // user group to flag, one of: ['libretexts', 'campusadmin', 'lead', 'liaison']
    flagDescrip: String,        // a description of the reason for flagging
    libreAlerts: [String]       // array of uuids of users who have a LibreTexts Alert enabled on the project
}, {
    timestamps: true
});

const Project = mongoose.model('Project', ProjectSchema);

module.exports = Project;
