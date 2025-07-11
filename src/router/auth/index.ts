import {Request, Response} from 'express';
import bcrypt from 'bcryptjs';
import logger from '../../logger/logger';
import {utils} from "../../utils";
import {getUserByEmailDB, updateUserDB} from "../../database";

const passLogger = logger.child({context: 'passService'});


/**
 * Authentication service module handling user authentication and password management.
 * @module authService
 * @description Provides endpoints for:
 * - User login
 * - Password setting and reset
 * - Temporary password generation and verification
 */

/**
 * Authenticates a user and returns a JWT token.
 * @async
 * @function loginUser
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.password - User's password
 * @returns {Promise<Response>} JSON response with JWT token and user data
 * @throws {404} If user not found
 * @throws {400} If user hasn't set password (firstLogin state)
 * @throws {401} If password is incorrect
 * @throws {500} If server error occurs
 * @example
 * // POST /api/login
 * // Request body: { email: "user@example.com", password: "securepassword123" }
 * // Response: { success: true, token: "jwt.token.xyz", user: { ... } }
 */
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

    } catch (error: any) {
        passLogger.error('Error logging in user', { error });
        res.status(500).json({ success: false, message: 'Server error during login', error });
    }
};

/**
 * Sets a new password for a first-time user.
 * @async
 * @function setNewPassword
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.newPassword - New password to set
 * @returns {Promise<Response>} JSON response with JWT token and user data
 * @throws {404} If user not found
 * @throws {400} If password already set or user not eligible
 * @throws {500} If server error occurs
 * @example
 * // POST /api/set-password
 * // Request body: { email: "user@example.com", newPassword: "newsecurepassword123" }
 * // Response: { success: true, token: "jwt.token.xyz", user: { ... } }
 */
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

/**
 * Verifies a temporary password for password reset flow.
 * @async
 * @function verifyTempPassword
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.tempPassword - Temporary password to verify
 * @returns {Promise<Response>} JSON response with verification status
 * @throws {404} If user not found
 * @throws {400} If user already completed first login
 * @throws {401} If temporary password is invalid
 * @throws {500} If server error occurs
 * @example
 * // POST /api/verify-temp-password
 * // Request body: { email: "user@example.com", tempPassword: "temporary123" }
 * // Response: { success: true, message: "Temporary password verified" }
 */
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

/**
 * Generates and emails a temporary password for password reset.
 * @async
 * @function generateTempPassword
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {string} req.body.email - User's email address
 * @returns {Promise<Response>} JSON response with generation status
 * @throws {404} If user not found
 * @throws {500} If server error occurs
 * @example
 * // POST /api/generate-temp-password
 * // Request body: { email: "user@example.com" }
 * // Response: { success: true, message: "Temporary password generated and sent" }
 */
export const generateTempPassword = async (req: Request, res: Response) => {
    try {
        const result = await utils.generateTempPassword(req.body.email);
        if (result) {
            const {hash, tempPassword} = result
            res.status(200).json({hash: hash, tempPassword: tempPassword, success: true});
        } else {
            passLogger.warn('Failed to generate temp password');
            res.status(404).json({success: false, message: 'User not found or generation failed'});
        }
    } catch (error) {
        passLogger.error('Error generating temp password', {error});
        res.status(500).json({success: false, message: 'Error generating temp password', error});
    }
};

