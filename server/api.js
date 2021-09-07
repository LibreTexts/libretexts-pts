//
// LibreTexts Conductor
// api.js
//

'use strict';
const express = require('express');

/* Route Middleware */
const middleware = require('./middleware.js');

/* Interfaces */
const authAPI = require('./api/auth.js');
const userAPI = require('./api/user.js');
const orgAPI = require('./api/organizations.js');
const adoptionReportAPI = require('./api/adoptionreports.js');
const harvestingRequestsAPI = require('./api/harvestingrequests.js');
const collectionsAPI = require('./api/collections.js');
const booksAPI = require('./api/books.js');
const homeworkAPI = require('./api/homework.js');
const directoryAPI = require('./api/directory.js');
//const searchAPI = require('./api/search.js');
const announcementAPI = require('./api/announcements.js');
const sharedProjectsAPI = require('./api/projects.js');
const harvestingTargetsAPI = require('./api/harvestingtargets.js');
const harvestingProjectsAPI = require('./api/harvestingprojects.js');


var router = express.Router();
router.use(middleware.corsHelper);
router.use(middleware.authSanitizer);


/* Auth */
router.route('/v1/auth/login').post(authAPI.validate('login'),
    middleware.checkValidationErrors, authAPI.login);

// SSO/OAuth
router.route('/v1/oauth/libretexts').get(authAPI.oauthCallback);


/* Organizations */
router.route('/v1/org/info').get(orgAPI.validate('getinfo'),
    middleware.checkValidationErrors, orgAPI.getOrganizationInfo);


/* Adoption Reports */
// (submission route can be anonymous)
router.route('/v1/adoptionreport').post(middleware.checkLibreCommons,
    adoptionReportAPI.validate('submitReport'),
    middleware.checkValidationErrors, adoptionReportAPI.submitReport);

router.route('/v1/adoptionreports').get(middleware.checkLibreCommons,
    authAPI.verifyRequest, authAPI.getUserAttributes,
    authAPI.checkHasRoleMiddleware('libretexts', 'superadmin'),
    adoptionReportAPI.validate('getReports'), middleware.checkValidationErrors,
    adoptionReportAPI.getReports);

router.route('/v1/adoptionreport/delete').delete(middleware.checkLibreCommons,
    authAPI.verifyRequest, authAPI.getUserAttributes,
    authAPI.checkHasRoleMiddleware('libretexts', 'superadmin'),
    adoptionReportAPI.validate('deleteReport'), middleware.checkValidationErrors,
    adoptionReportAPI.deleteReport);


/* OER/Harvesting Requests */
// (submission route can be anonymous)
router.route('/v1/harvestingrequest').post(middleware.checkLibreCommons,
    harvestingRequestsAPI.validate('addRequest'),
    middleware.checkValidationErrors, harvestingRequestsAPI.addRequest);

router.route('/v1/harvestingrequests').get(middleware.checkLibreCommons,
    authAPI.verifyRequest, authAPI.getUserAttributes,
    authAPI.checkHasRoleMiddleware('libretexts', 'superadmin'),
    harvestingRequestsAPI.validate('getRequests'),
    middleware.checkValidationErrors, harvestingRequestsAPI.getRequests);


/* Commons Collections */
router.route('/v1/commons/collections').get(
    collectionsAPI.getCommonsCollections);

router.route('/v1/commons/collections/all').get(authAPI.verifyRequest,
    authAPI.getUserAttributes,
    authAPI.checkHasRoleMiddleware(process.env.ORG_ID, 'campusadmin'),
    collectionsAPI.getAllCollections);

router.route('/v1/commons/collection').get(
    collectionsAPI.validate('getCollection'), middleware.checkValidationErrors,
    collectionsAPI.getCollection);

router.route('/v1/commons/collection/create').post(authAPI.verifyRequest,
    authAPI.getUserAttributes,
    authAPI.checkHasRoleMiddleware(process.env.ORG_ID, 'campusadmin'),
    collectionsAPI.validate('createCollection'),
    middleware.checkValidationErrors, collectionsAPI.createCollection);

router.route('/v1/commons/collection/edit').put(authAPI.verifyRequest,
    authAPI.getUserAttributes,
    authAPI.checkHasRoleMiddleware(process.env.ORG_ID, 'campusadmin'),
    collectionsAPI.validate('editCollection'),
    middleware.checkValidationErrors, collectionsAPI.editCollection);

router.route('/v1/commons/collection/delete').delete(authAPI.verifyRequest,
    authAPI.getUserAttributes,
    authAPI.checkHasRoleMiddleware(process.env.ORG_ID, 'campusadmin'),
    collectionsAPI.validate('deleteCollection'),
    middleware.checkValidationErrors, collectionsAPI.deleteCollection);

router.route('/v1/commons/collection/addresource').put(authAPI.verifyRequest,
    authAPI.getUserAttributes,
    authAPI.checkHasRoleMiddleware(process.env.ORG_ID, 'campusadmin'),
    collectionsAPI.validate('addCollResource'),
    middleware.checkValidationErrors, collectionsAPI.addResourceToCollection);

router.route('/v1/commons/collection/removeresource').put(authAPI.verifyRequest,
    authAPI.getUserAttributes,
    authAPI.checkHasRoleMiddleware(process.env.ORG_ID, 'campusadmin'),
    collectionsAPI.validate('remCollResource'),
    middleware.checkValidationErrors,
    collectionsAPI.removeResourceFromCollection);


/* Directory */
router.route('/v1/commons/directory').get(directoryAPI.getDirectory);

router.route('/v1/commons/directory/libraries').get(
    directoryAPI.getMainLibraries);

router.route('/v1/commons/directory/shelves').get(
    directoryAPI.validate('getLibraryShelves'),
    middleware.checkValidationErrors,
    directoryAPI.getLibraryShelves);

/* Commons Management */
router.route('/v1/commons/syncwithlibs').post(authAPI.verifyRequest,
    authAPI.getUserAttributes,
    authAPI.checkHasRoleMiddleware('libretexts', 'superadmin'),
    booksAPI.syncWithLibraries);


/* Commons Books/Catalogs */
router.route('/v1/commons/catalog').get(
    booksAPI.validate('getCommonsCatalog'), middleware.checkValidationErrors,
    booksAPI.getCommonsCatalog);

router.route('/v1/commons/mastercatalog').get(
    booksAPI.validate('getMasterCatalog'), middleware.checkValidationErrors,
    booksAPI.getMasterCatalog);

router.route('/v1/commons/book').get(booksAPI.validate('getBookDetail'),
    middleware.checkValidationErrors, booksAPI.getBookDetail);

router.route('/v1/commons/filters').get(booksAPI.getCatalogFilterOptions);

router.route('/v1/commons/catalogs/addresource').put(authAPI.verifyRequest,
    authAPI.getUserAttributes,
    authAPI.checkHasRoleMiddleware(process.env.ORG_ID, 'campusadmin'),
    booksAPI.validate('addBookToCustomCatalog'),
    middleware.checkValidationErrors,
    booksAPI.addBookToCustomCatalog);

router.route('/v1/commons/catalogs/removeresource').put(authAPI.verifyRequest,
    authAPI.getUserAttributes,
    authAPI.checkHasRoleMiddleware(process.env.ORG_ID, 'campusadmin'),
    booksAPI.validate('removeBookFromCustomCatalog'),
    middleware.checkValidationErrors,
    booksAPI.removeBookFromCustomCatalog);


/* Homework */
router.route('/v1/commons/homework/all').get(homeworkAPI.getAllHomework);

router.route('/v1/commons/homework/adapt').get(homeworkAPI.getADAPTCatalog);


router.route('/v1/commons/homework/syncadapt').post(authAPI.verifyRequest,
    authAPI.getUserAttributes,
    authAPI.checkHasRoleMiddleware('libretexts', 'superadmin'),
    homeworkAPI.syncADAPTCommons);


/* Search */
//router.route('/v1/search').get(authAPI.verifyRequest, searchAPI.performSearch);


/* Users */
//router.route('/v1/user/createuserbasic').post(userAPI.createUserBasic);
router.route('/v1/user/basicinfo').get(authAPI.verifyRequest,
    userAPI.basicUserInfo);
router.route('/v1/user/accountinfo').get(authAPI.verifyRequest,
    userAPI.basicAccountInfo);


/* Announcements */
router.route('/v1/announcements/create').post(authAPI.verifyRequest,
    authAPI.getUserAttributes, announcementAPI.validate('postAnnouncement'),
    middleware.checkValidationErrors, announcementAPI.postAnnouncement);
router.route('/v1/announcements/all').get(authAPI.verifyRequest,
    announcementAPI.getAllAnnouncements);
router.route('/v1/announcements/recent').get(authAPI.verifyRequest,
    announcementAPI.getRecentAnnouncement);


/* Projects (General) */
router.route('/v1/projects/all').get(authAPI.verifyRequest,
    sharedProjectsAPI.getAllUserProjects);
router.route('/v1/projects/recent').get(authAPI.verifyRequest,
    sharedProjectsAPI.getRecentUserProjects);


/* Harvesting */

// Targetlist
router.route('/v1/harvesting/targetlist/all').get(authAPI.verifyRequest,
    harvestingTargetsAPI.getAllTargets);
router.route('/v1/harvesting/targetlist/add').post(authAPI.verifyRequest,
    harvestingTargetsAPI.addTarget);
router.route('/v1/harvesting/targetlist/targets/detail').get(
    authAPI.verifyRequest, harvestingTargetsAPI.getTargetDetail);
router.route('/v1/harvesting/targetlist/targets/update').post(
    authAPI.verifyRequest, harvestingTargetsAPI.updateTarget);
router.route('/v1/harvesting/targetlist/targets/delete').post(
    authAPI.verifyRequest, harvestingTargetsAPI.deleteTarget);

// Projects
router.route('/v1/harvesting/projects/addexisting').post(
    authAPI.verifyRequest, harvestingProjectsAPI.addExistingProject);
router.route('/v1/harvesting/projects/newfromtarget').post(
    authAPI.verifyRequest, harvestingProjectsAPI.newProjectFromTarget);
router.route('/v1/harvesting/projects/newforassignee').post(
    authAPI.verifyRequest, harvestingProjectsAPI.newProjectForAssignee);
router.route('/v1/harvesting/projects/detail').get(
    authAPI.verifyRequest, harvestingProjectsAPI.getProjectDetail);
router.route('/v1/harvesting/projects/update').post(
    authAPI.verifyRequest, harvestingProjectsAPI.updateProject);
router.route('/v1/harvesting/projects/flag').post(
    authAPI.verifyRequest, harvestingProjectsAPI.flagProject);
router.route('/v1/harvesting/projects/unflag').post(
    authAPI.verifyRequest, harvestingProjectsAPI.unflagProject);
router.route('/v1/harvesting/projects/markcompleted').post(
    authAPI.verifyRequest, harvestingProjectsAPI.markProjectCompleted);
router.route('/v1/harvesting/projects/delete').post(
    authAPI.verifyRequest, harvestingProjectsAPI.deleteProject);
router.route('/v1/harvesting/projects/current').get(
    authAPI.verifyRequest, harvestingProjectsAPI.getCurrentProjects);
router.route('/v1/harvesting/projects/flagged').get(
    authAPI.verifyRequest, harvestingProjectsAPI.getFlaggedProjects);
router.route('/v1/harvesting/projects/recentlycompleted').get(
    authAPI.verifyRequest, harvestingProjectsAPI.getRecentlyCompletedProjects);
router.route('/v1/harvesting/projects/completed').get(
    authAPI.verifyRequest, harvestingProjectsAPI.getAllCompletedProjects);
router.route('/v1/harvesting/projects/updates/all').get(
    authAPI.verifyRequest, harvestingProjectsAPI.getAllProgressUpdates);
router.route('/v1/harvesting/projects/updates/new').post(
    authAPI.verifyRequest, harvestingProjectsAPI.addProgressUpdate);
router.route('/v1/harvesting/projects/updates/delete').post(
    authAPI.verifyRequest, harvestingProjectsAPI.deleteProgressUpdate);
router.route('/v1/harvesting/projects/updates/feed').get(
    authAPI.verifyRequest, harvestingProjectsAPI.getUpdatesFeed);

module.exports = router;
