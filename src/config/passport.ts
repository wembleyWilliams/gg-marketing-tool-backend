import {findOrCreateOAuthUserDB, getUserByEmailDB} from "../database";

import logger from "../logger/logger";

const authLogger = logger.child({context: 'passportService'})

require('dotenv').config()

const passport = require('passport')
const bcrypt = require('bcrypt')
require('dotenv').config()

const LocalStrategy = require('passport-local')
// const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
// Replace with your Google credentials
const GOOGLE_CLIENT_ID = process.env.CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.CLIENT_SECRET;
const CALLBACK_URL = process.env.CALLBACK_URL

/**
 * Middleware to check if the user is authenticated
 * @param req Express request object
 * @param res Express response object
 * @param next Express next function
 */
export const isAuthenticated = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) {
        return next(); // User is authenticated, proceed to the next middleware
    }
    res.redirect('/login'); // Redirect to login page if not authenticated
};

const passportService = (passport: any) => {
    passport.use(
        new LocalStrategy(({
            usernameField: 'email',
            passwordField: 'password'
        }),async (email: string, password: string , done: any) => {
            try {
                // Fetch user from database
                const user = await getUserByEmailDB(email);

                if (!user) {
                    return done(null, false, { message: 'Email is not registered' });
                }

                // Match password
                const isMatch = await bcrypt.compare(password, user.password);
                if (isMatch) {
                    return done(null, user);
                } else {
                    return done(null, false, { message: 'Password incorrect' });
                }
            } catch (err) {
                authLogger.error('Error during authentication: ' ,err)
                return done(err);
            }
        })
    )

    passport.use(new GoogleStrategy({
            clientID: GOOGLE_CLIENT_ID,
            clientSecret: GOOGLE_CLIENT_SECRET,
            callbackURL: `${CALLBACK_URL}/auth/google/callback`
        },
        (accessToken: any, refreshToken: any, profile: any, done: any) => {
            findOrCreateOAuthUserDB(profile, 'google')
                .then((user) => {
                    authLogger.info(user?.email)
                    return done(null, user);
                })
                .catch((err: any) => {
                    authLogger.error({message: 'Error retrieving user', err});
                    return err
                })
        }
    ));

    passport.serializeUser((user: any, done: any) => {
        done(null, user.email);
    });

    passport.deserializeUser((user: any, done: any) => {
        getUserByEmailDB(user.email)
            .then((user) => {
                if (!user) {
                    return done(null, false, {message: "User not found in the database."});
                }
                done(null, user)
            })
            .catch((err: any) => {
                done(err, false, {message: "Error fetching user from the database."})
            })
    });
}

export default passportService