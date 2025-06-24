import {Request, Response} from 'express';
import bcrypt from 'bcryptjs';
import logger from '../../logger/logger';
import {utils} from "../../utils";
import {getUserByEmailDB, updateUserDB} from "../../database";

const passLogger = logger.child({context: 'passService'});

// POST /api/login
export const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await getUserByEmailDB(email);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Ensure user has already set a password (not in firstLogin state)
        if (user.firstLogin) {
            return res.status(400).json({ success: false, message: 'User must set password before login' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Incorrect password' });
        }

        const token = utils.generateJWT(user);

        passLogger.info(`User logged in: ${email}`);

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                _id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
            },
        });

    } catch (error) {
        passLogger.error('Error logging in user', { error });
        res.status(500).json({ success: false, message: 'Server error during login', error });
    }
};


// POST /api/set-password
export const setNewPassword = async (req: Request, res: Response) => {
    try {
        const {email, newPassword} = req.body;

        const user = await getUserByEmailDB(email);
        if (!user) {
            return res.status(404).json({success: false, message: 'User not found'});
        }

        if (!user.firstLogin) {
            return res.status(400).json({success: false, message: 'Password already set or user not eligible'});
        }

        await utils.setNewPassword(email, newPassword);

        const freshUser = await getUserByEmailDB(email); // in case any new fields updated
        const token = utils.generateJWT(freshUser);

        passLogger.info(`Password set and token issued for ${email}`);

        return res.status(200).json({
            success: true,
            message: 'Password successfully set',
            token,
            user: {
                _id: freshUser._id,
                email: freshUser.email,
                firstName: freshUser.firstName,
                lastName: freshUser.lastName,
            },
        });

    } catch (error) {
        passLogger.error('Error setting new password', {error});
        res.status(500).json({success: false, message: 'Server error setting new password', error});
    }
};

// POST /api/verify-temp-password
export const verifyTempPassword = async (req: Request, res: Response) => {
    try {
        const {email, tempPassword} = req.body;

        const user = await getUserByEmailDB(email);
        if (!user) {
            return res.status(404).json({success: false, message: 'User not found'});
        }

        if (!user.firstLogin) {
            return res.status(400).json({success: false, message: 'User already completed first login'});
        }

        const isMatch = await bcrypt.compare(tempPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({success: false, message: 'Invalid temporary password'});
        }

        passLogger.info(`Temp password verified for ${email}`);
        return res.status(200).json({success: true, message: 'Temporary password verified'});

    } catch (error) {
        passLogger.error('Error verifying temporary password', {error});
        res.status(500).json({success: false, message: 'Server error verifying temp password', error});
    }
};

// POST /api/generate-temp-password
export const generateTempPassword = async (req: Request, res: Response) => {
    try {
        const result = await utils.generateTempPassword(req.body.email);
        if (result) {
            res.status(200).json({...result, success: true});
        } else {
            passLogger.warn('Failed to generate temp password');
            res.status(404).json({success: false, message: 'User not found or generation failed'});
        }
    } catch (error) {
        passLogger.error('Error generating temp password', {error});
        res.status(500).json({success: false, message: 'Error generating temp password', error});
    }
};

