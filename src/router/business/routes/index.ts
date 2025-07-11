import {
    createBusiness,
    deleteBusiness,
    getBusiness,
    getBusinessByUserId,
    updateBusiness,
    updateBusinessLogo
} from "../index";

const express = require('express');
const business = express.Router();

/**
 * Express router for business-related operations.
 * @module BusinessRouter
 * @description Handles all business-related CRUD operations including:
 * - Business creation and deletion
 * - Business information retrieval
 * - Business profile updates (social handles and logo)
 */

/**
 * Route to get a business by ID.
 * @name GET /:businessId
 * @function
 * @memberof module:BusinessRouter
 * @inner
 * @param {string} path - Express path with businessId parameter
 * @param {function} middleware - getBusiness handler
 * @param {string} req.params.businessId - The ID of the business to retrieve
 * @returns {Object} The business data
 * @throws {404} If business is not found
 * @throws {500} If server error occurs
 * @see {@link module:businessService.getBusiness} for implementation details
 * @example
 * // Example route: GET /business/12345
 */
business.get('/:businessId', getBusiness);

/**
 * Route to get a business by user ID.
 * @name GET /user/:userId
 * @function
 * @memberof module:BusinessRouter
 * @inner
 * @param {string} path - Express path with userId parameter
 * @param {function} middleware - getBusinessByUserId handler
 * @param {string} req.params.userId - The user ID associated with the business
 * @returns {Object} The business data
 * @throws {404} If business is not found
 * @throws {500} If server error occurs
 * @see {@link module:businessService.getBusinessByUserId} for implementation details
 * @example
 * // Example route: GET /business/user/67890
 */
business.get('/user/:userId', getBusinessByUserId);

/**
 * Route to update business social handles.
 * @name POST /update/:businessId
 * @function
 * @memberof module:BusinessRouter
 * @inner
 * @param {string} path - Express path with businessId parameter
 * @param {function} middleware - updateBusiness handler
 * @param {string} req.params.businessId - The ID of the business to update
 * @param {Object} req.body.handle - The new social media handles
 * @returns {Object} The updated business data
 * @throws {500} If update fails
 * @see {@link module:businessService.updateBusiness} for implementation details
 * @example
 * // Example route: POST /business/update/12345
 * // Request body: { handle: { twitter: '@newhandle', instagram: '@newinsta' } }
 */
business.post('/update/:businessId', updateBusiness);

/**
 * Route to create a new business.
 * @name POST /create
 * @function
 * @memberof module:BusinessRouter
 * @inner
 * @param {string} path - Express path
 * @param {function} middleware - createBusiness handler
 * @param {Object} req.body - The complete business data
 * @returns {Object} The created business data
 * @throws {500} If creation fails
 * @see {@link module:businessService.createBusiness} for implementation details
 * @example
 * // Example route: POST /business/create
 * // Request body: { name: "New Business", owner: "user123", ... }
 */
business.post('/create', createBusiness);

/**
 * Route to delete a business by ID.
 * @name DELETE /delete/:businessId
 * @function
 * @memberof module:BusinessRouter
 * @inner
 * @param {string} path - Express path with businessId parameter
 * @param {function} middleware - deleteBusiness handler
 * @param {string} req.params.businessId - The ID of the business to delete
 * @returns {Object} Confirmation of deletion
 * @throws {500} If deletion fails
 * @see {@link module:businessService.deleteBusiness} for implementation details
 * @example
 * // Example route: DELETE /business/delete/12345
 */
business.delete('/delete/:businessId', deleteBusiness);

/**
 * Route to update a business logo.
 * @name POST /update/logo/:businessId
 * @function
 * @memberof module:BusinessRouter
 * @inner
 * @param {string} path - Express path with businessId parameter
 * @param {function} middleware - updateBusinessLogo handler
 * @param {string} req.params.businessId - The ID of the business to update
 * @param {Object} req.body - The new logo data
 * @returns {string} Confirmation message
 * @throws {502} If update fails
 * @throws {500} If server error occurs
 * @see {@link module:businessService.updateBusinessLogo} for implementation details
 * @example
 * // Example route: POST /business/update/logo/12345
 * // Request body: { logoUrl: "https://example.com/newlogo.png" }
 */
business.post('/update/logo/:businessId', updateBusinessLogo);

export default business;