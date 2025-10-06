import logger from "../../../logger/logger";
import {Request, Response} from "express";
import {
    forgotPassword,
    generateTempPassword,
    loginUser,
    registerUser, requestPasswordReset,
    resetPassword,
    setNewPassword,
    verifyEmail, verifyPasswordReset,
    verifyTempPassword
} from "../index";
import {next} from "cheerio/lib/api/traversing";
import {utils} from "../../../utils";

const express = require('express')
const passport = require('passport');

const passLogger = logger.child({context:'passService'})
const auth = express.Router();

/**
 * Authentication router module for handling all authentication-related routes.
 * @module AuthRouter
 * @description Handles:
 * - Local username/password authentication
 * - Google OAuth2 authentication
 * - Password management flows (set/reset/verify)
 */

/**
 * Route for local username/password authentication
 * @name POST /login
 * @function
 * @memberof module:AuthRouter
 * @inner
 * @param {string} path - Express path
 * @param {function} middleware - Passport local authentication strategy
 * @param {Object} req.body - Request body containing credentials
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.password - User's password
 * @returns {Object} JSON response with JWT token and user data
 * @throws {401} If authentication fails
 * @throws {500} If server error occurs
 * @see {@link module:authService.loginUser} for implementation details
 * @example
 * // Example request:
 * // POST /auth/login
 * // Body: { email: "user@example.com", password: "securepassword123" }
 */
auth.post('/login', async (req: any, res: any, next: any) => {
    try {
        passport.authenticate('local', loginUser(req,res))
    } catch (error) {
        passLogger.error('Error setting new password', {error});
        res.status(500).json({success: false, message: 'Server error setting new password', error});
    }
});

/**
 * Route to initiate Google OAuth2 authentication flow
 * @name GET /google
 * @function
 * @memberof module:AuthRouter
 * @inner
 * @param {string} path - Express path
 * @param {function} middleware - Passport Google authentication strategy
 * @description Redirects to Google's OAuth2 consent screen
 * @see {@link https://developers.google.com/identity/protocols/oauth2} for Google OAuth2 details
 * @example
 * // Example usage:
 * // GET /auth/google
 */
auth.get('/google', passport.authenticate('google',{
    scope: [
        'email',
        'profile',
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
    ]
}));

/**
 * Route for Google OAuth2 callback
 * @name GET /google/callback
 * @function
 * @memberof module:AuthRouter
 * @inner
 * @param {string} path - Express path
 * @param {function} middleware - Passport Google authentication strategy
 * @param {string} req.query.code - Authorization code from Google
 * @description Handles the OAuth2 callback from Google after user consent
 * @throws {401} If authentication fails
 * @example
 * // Example callback URL:
 * // GET /auth/google/callback?code=4/0Adeu5B...
 */
auth.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req: any, res: any) => {
        passLogger.info('Authentication successful');
        res.redirect('/dashboard');
    }
);

/**
 * Route to set a new password (for first-time or reset)
 * @name POST /set-password
 * @function
 * @memberof module:AuthRouter
 * @inner
 * @param {string} path - Express path
 * @param {function} middleware - setNewPassword handler
 * @param {Object} req.body - Request body
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.newPassword - New password to set
 * @returns {Object} JSON response with JWT token
 * @throws {400} If password already set
 * @throws {404} If user not found
 * @throws {500} If server error occurs
 * @see {@link module:authService.setNewPassword} for implementation details
 * @example
 * // Example request:
 * // POST /auth/set-password
 * // Body: { email: "user@example.com", newPassword: "newsecure123" }
 */
auth.post('/set-password', setNewPassword);

/**
 * Route to verify a temporary password
 * @name POST /verify-temp-password
 * @function
 * @memberof module:AuthRouter
 * @inner
 * @param {string} path - Express path
 * @param {function} middleware - verifyTempPassword handler
 * @param {Object} req.body - Request body
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.tempPassword - Temporary password to verify
 * @returns {Object} JSON response with verification status
 * @throws {400} If user already completed setup
 * @throws {401} If temporary password invalid
 * @throws {404} If user not found
 * @throws {500} If server error occurs
 * @see {@link module:authService.verifyTempPassword} for implementation details
 * @example
 * // Example request:
 * // POST /auth/verify-temp-password
 * // Body: { email: "user@example.com", tempPassword: "temp12345" }
 */
auth.post('/verify-temp-password', verifyTempPassword);

/**
 * Route to generate and email a temporary password
 * @name POST /generate-temp-password
 * @function
 * @memberof module:AuthRouter
 * @inner
 * @param {string} path - Express path
 * @param {function} middleware - generateTempPassword handler
 * @param {Object} req.body - Request body
 * @param {string} req.body.email - User's email address
 * @returns {Object} JSON response with generation status
 * @throws {404} If user not found
 * @throws {500} If server error occurs
 * @see {@link module:authService.generateTempPassword} for implementation details
 * @example
 * // Example request:
 * // POST /auth/generate-temp-password
 * // Body: { email: "user@example.com" }
 */
auth.post('/generate-temp-password', generateTempPassword);

auth.post('/register', registerUser);

auth.post('/verify-email', verifyEmail);

auth.post('/verify-password-reset', verifyPasswordReset)

auth.post('/resend-verification', utils.sendEmailVerificationEmail);

auth.post('/reset-password', resetPassword)

auth.post('/request-password-reset', requestPasswordReset)

auth.post('/forgot-password', forgotPassword)

// auth.post('/set-password', setNewPassword)

export default auth;