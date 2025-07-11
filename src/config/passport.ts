import {findOrCreateOAuthUserDB, getUserByEmailDB} from "../database";
import logger from "../logger/logger";

const authLogger = logger.child({context: 'passportService'})
require('dotenv').config()

const passport = require('passport')
const bcrypt = require('bcrypt')
require('dotenv').config()

const LocalStrategy = require('passport-local')
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

// Google OAuth credentials from environment variables
const GOOGLE_CLIENT_ID = process.env.CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.CLIENT_SECRET;
const CALLBACK_URL = process.env.CALLBACK_URL

/**
 * Authentication middleware to check if user is logged in
 * @function isAuthenticated
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void|Response} Either continues to next middleware or redirects to login
 * @example
 * // Usage in route:
 * router.get('/protected-route', isAuthenticated, (req, res) => {...});
 */
export const isAuthenticated = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) {
        return next(); // User is authenticated, proceed to the next middleware
    }
    res.redirect('/login'); // Redirect to login page if not authenticated
};

/**
 * Passport service configuration module
 * @module passportService
 * @description Configures passport authentication strategies including:
 * - Local username/password authentication
 * - Google OAuth2 authentication
 * - User serialization/deserialization
 */

/**
 * Configures passport authentication strategies
 * @function passportService
 * @param {Object} passport - Passport instance to configure
 * @returns {void}
 * @description Sets up:
 * - LocalStrategy for email/password auth
 * - GoogleStrategy for OAuth
 * - User serialization/deserialization
 */
const passportService = (passport: any) => {
    /**
     * Local authentication strategy using email/password
     * @name LocalStrategy
     * @memberof module:passportService
     * @inner
     */
    passport.use(
        new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password'
        }, async (email: string, password: string, done: any) => {
            try {
                // Fetch user from database
                const user = await getUserByEmailDB(email);

                if (!user) {
                    authLogger.warn(`Login attempt for non-existent email: ${email}`);
                    return done(null, false, { message: 'Email is not registered' });
                }

                // Match password
                const isMatch = await bcrypt.compare(password, user.password);
                if (isMatch) {
                    authLogger.info(`Successful login for user: ${email}`);
                    return done(null, user);
                } else {
                    authLogger.warn(`Failed login attempt for user: ${email}`);
                    return done(null, false, { message: 'Incorrect password' });
                }
            } catch (err) {
                authLogger.error('Error during authentication:', err);
                return done(err);
            }
        })
    );

    /**
     * Google OAuth2 authentication strategy
     * @name GoogleStrategy
     * @memberof module:passportService
     * @inner
     */
    passport.use(new GoogleStrategy({
            clientID: GOOGLE_CLIENT_ID,
            clientSecret: GOOGLE_CLIENT_SECRET,
            callbackURL: `${CALLBACK_URL}/auth/google/callback`
        },
        (accessToken: any, refreshToken: any, profile: any, done: any) => {
            findOrCreateOAuthUserDB(profile, 'google')
                .then((user) => {
                    authLogger.info(`Google OAuth login for user: ${user?.email}`);
                    return done(null, user);
                })
                .catch((err: any) => {
                    authLogger.error('Error during Google OAuth authentication:', err);
                    return done(err);
                });
        }
    ));

    /**
     * Serializes user to session
     * @function serializeUser
     * @memberof module:passportService
     * @inner
     * @param {Object} user - User object to serialize
     * @param {Function} done - Callback function
     */
    passport.serializeUser((user: any, done: any) => {
        done(null, user.email);
    });

    /**
     * Deserializes user from session
     * @function deserializeUser
     * @memberof module:passportService
     * @inner
     * @param {string} email - User email from session
     * @param {Function} done - Callback function
     */
    passport.deserializeUser((email: string, done: any) => {
        getUserByEmailDB(email)
            .then((user) => {
                if (!user) {
                    authLogger.warn(`Deserialization failed - user not found: ${email}`);
                    return done(null, false, {message: "User not found in the database."});
                }
                authLogger.debug(`User deserialized: ${email}`);
                done(null, user);
            })
            .catch((err: any) => {
                authLogger.error('Error during user deserialization:', err);
                done(err, false, {message: "Error fetching user from the database."});
            });
    });
};

export default passportService;