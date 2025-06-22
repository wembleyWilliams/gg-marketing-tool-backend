import logger from "../../../logger/logger";
import {Request, Response} from "express";
import {generateTempPassword, setNewPassword, verifyTempPassword} from "../index";

const express = require('express')
const passport = require('passport');

const passLogger = logger.child({context:'passService'})
const auth = express.Router();

/**
 * POST /login
 * Route to handle user login with the local strategy.
 */
auth.post(
    '/login',
    passport.authenticate('local', {
        failureRedirect: '/login', // Redirect here if authentication fails
        successRedirect: '/dashboard', // Redirect here if authentication succeeds
        failureFlash: true, // Optional: Enable failure messages
        successFlash: 'Welcome back!', // Optional: Enable success messages
    })
);

auth.get('/google', passport.authenticate('google',{
    scope: [
        'email',
        'profile',
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
    ]

}))

auth.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req: any, res: any) => {
        passLogger.info('Authentication successful');
        res.redirect('/dashboard');
    }
);

auth.post('/set-password', setNewPassword);
auth.post('/verify-temp-password', verifyTempPassword);
auth.post('/generate-temp-password', generateTempPassword);

// auth.get('/logout', (req: any, res: any) => {
//     req.logout((err) => {
//         if (err) return next(err);
//         res.redirect('/');
//     });
// });

export default auth