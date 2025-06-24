import logger from "../../../logger/logger";
import {Request, Response} from "express";
import {generateTempPassword, loginUser, setNewPassword, verifyTempPassword} from "../index";
import {next} from "cheerio/lib/api/traversing";

const express = require('express')
const passport = require('passport');

const passLogger = logger.child({context:'passService'})
const auth = express.Router();

/**
 * POST /login
 * Route to handle user login with the local strategy.
 */
auth.post(
    '/login',async (req: any, res: any, next: any)=> {

        try {
            passport.authenticate('local', loginUser(req,res))
        } catch (error) {
            passLogger.error('Error setting new password', {error});
            res.status(500).json({success: false, message: 'Server error setting new password', error});
        }
    }
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