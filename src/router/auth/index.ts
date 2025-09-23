import {Request, Response} from 'express';
import bcrypt from 'bcryptjs';
import logger from '../../logger/logger';
import {utils} from "../../utils";
import {
    createBusinessDB,
    createUserDB,
    createVCardDB,
    getTokenByIdDB,
    getUserByEmailDB,
    updateUserDB
} from "../../database";
import {RegistrationData} from "../../common/types";

const passLogger = logger.child({context: 'passService'});


/**
 * Authentication service module handling user authentication and password management.
 * @module authService
 * @description Provides endpoints for:
 * - User login
 * - User registration
 * - Password setting and reset
 * - Temporary password generation and verification
 */

/**
 * Registers a new user with email verification.
 * @async
 * @function registerUser
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.firstName - User's first name
 * @param {string} req.body.lastName - User's last name
 * @param {string} [req.body.password] - Optional password (if not provided, user will be in firstLogin state)
 * @param {string} [req.body.companyName] - Optional company name
 * @param {string} [req.body.phone] - Optional phone number
 * @returns {Promise<Response>} JSON response with user data and optional JWT token
 * @throws {400} If user already exists or validation fails
 * @throws {500} If server error occurs
 * @example
 * // POST /api/register
 * // Request body: {
 * //   email: "user@example.com",
 * //   firstName: "John",
 * //   lastName: "Doe",
 * //   password: "securepassword123" // optional
 * // }
 * // Response: { success: true, token: "jwt.token.xyz", user: { ... } }
 */
export const registerUser = async (req: Request, res: Response) => {
    try {
        const body: Partial<RegistrationData> = req.body;

        // --- Validate required userData ---
        if (!body.userData) {
            return res.status(400).json({
                success: false,
                message: 'userData is required',
            });
        }

        const { email, firstName, lastName, password, phone } = body.userData;

        if (!email || !firstName || !lastName) {
            return res.status(400).json({
                success: false,
                message: 'Email, first name, and last name are required',
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address',
            });
        }

        // --- CHECK IF USER EXISTS BEFORE CREATING ---
        const normalizedEmail = email.toLowerCase().trim();
        const existingUser = await getUserByEmailDB(normalizedEmail);

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'An account with this email address already exists',
            });
        }

        // Validate password if provided
        if (password && password.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters long',
            });
        }

        let hashedPassword = null;
        let firstLogin = true;
        let tempPasswordResult: { hash: string; tempPassword: string } | null = null;

        if (password) {
            const saltRounds = 10;
            hashedPassword = await bcrypt.hash(password, saltRounds);
            firstLogin = false;
        } else {
            // Generate temporary password for first login flow
            tempPasswordResult = await utils.generateTempPassword(email);
            if (tempPasswordResult) {
                hashedPassword = tempPasswordResult.hash;
            }
        }

        // --- Generate email verification token ---
        const emailVerificationToken = utils.generateEmailVerificationToken();


        // --- Create user object ---
        const newUser = {
            ...body.userData,
            email: normalizedEmail,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            password: hashedPassword,
            phone: phone?.trim() || '',
            createdAt: new Date(),
            updatedAt: new Date(),
            firstLogin,
            isActive: false, // User is inactive until email is verified
            emailVerified: false,
            emailVerificationToken, // Store verification token
            emailVerificationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
            authProvider: body.userData.authProvider || '',
            authProviderId: body.userData.authProviderId || '',
            cards: []
        };


        // --- Persist user ---
        const createdUser = await createUserDB(newUser);
        if (!createdUser) {
            return res.status(500).json({
                success: false,
                message: 'Failed to create user account',
            });
        }

        // --- Handle businessData (optional) ---
        if (body.businessData) {
            const createdBusiness = await createBusinessDB({ ...body.businessData, userId: createdUser.insertedId });
            if (!createdBusiness) {
                return res.status(500).json({
                    success: false,
                    message: 'Failed to create business account',
                })
            }
        }

        // --- Handle vcardData (optional) ---
        if (body.vcardData) {
            const createdVCard = await createVCardDB({ ...body.vcardData, userId: createdUser.insertedId });
            if (!createdVCard) {
                return res.status(500).json({
                    success: false,
                    message: 'Failed to create VCard'
                })
            }
        }

        // --- Send email verification email ---
        try {
            await utils.sendEmailVerificationEmail(normalizedEmail, emailVerificationToken, firstName);
            passLogger.info(`Email verification sent to: ${normalizedEmail}`);
        } catch (emailError) {
            passLogger.error('Failed to send verification email', { error: emailError, email: normalizedEmail });
            // Don't fail the registration if email sending fails
            // The user account is created but they can request a new verification email
        }

        // --- Send temporary password email if applicable ---
        if (firstLogin && tempPasswordResult) {
            try {
                await utils.sendTempPasswordEmail(normalizedEmail, tempPasswordResult.tempPassword, firstName);
                passLogger.info(`Temporary password sent to: ${normalizedEmail}`);
            } catch (emailError) {
                passLogger.error('Failed to send temporary password email', { error: emailError, email: normalizedEmail });
            }
        }

        // --- Generate token ---
        // let token: string | null = null;
        // if (!firstLogin) {
        //     token = utils.generateJWT(createdUser);
        // }

        // --- Respond ---
        return res.status(201).json({
            success: true,
            message: 'Registration successful. Please check your email to verify your account before logging in.',
            user: {
                _id: createdUser.insertedId,
                email: normalizedEmail,
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                emailVerified: false,
                isActive: false,
            },
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Server error during registration',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};

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
 * @throws {400} If user hasn't verified email or set password
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

        const normalizedEmail = email.toLowerCase().trim();
        const user = await getUserByEmailDB(normalizedEmail);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Check if email is verified
        if (!user.emailVerified) {
            return res.status(400).json({
                success: false,
                message: 'Please verify your email address before logging in',
                requiresEmailVerification: true
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(400).json({
                success: false,
                message: 'Account is inactive. Please contact support.'
            });
        }

        // Ensure user has already set a password (not in firstLogin state)
        if (user.firstLogin) {
            return res.status(400).json({
                success: false,
                message: 'User must set password before login',
                requiresPasswordSetup: true
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Incorrect password' });
        }

        const token = utils.generateJWT(user);

        passLogger.info(`User logged in: ${normalizedEmail}`);

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                _id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                emailVerified: user.emailVerified,
                isActive: user.isActive,
            },
        });

    } catch (error: any) {
        passLogger.error('Error logging in user', { error: error.message });
        res.status(500).json({
            success: false,
            message: 'Server error during login',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
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


/**
 * Verifies user's email address using the verification token.
 * @async
 * @function verifyEmail
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {string} req.body.token - Email verification token
 * @returns {Promise<Response>} JSON response with verification status
 * @throws {400} If token is missing or invalid
 * @throws {404} If user not found
 * @throws {500} If server error occurs
 * @example
 * // POST /api/verify-email
 * // Request body: { token: "email-verification-token-xyz" }
 * // Response: { success: true, message: "Email verified successfully" }
 */
export const verifyEmail = async (req: Request, res: Response) => {
    try {
        const tokenRaw  = req.query.token;
        const token = tokenRaw.toString()

        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Verification token is required',
            });
        }

        // Find user by verification token
        const user = await utils.getUserByVerificationToken(token);

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired verification token',
            });
        }

        // Check if token has expired
        if (user.emailVerificationTokenExpires && new Date() > user.emailVerificationTokenExpires) {
            return res.status(400).json({
                success: false,
                message: 'Verification token has expired. Please request a new one.',
            });
        }

        // Update user as verified and active
        const updateData = {
            emailVerified: true,
            isActive: true,
            emailVerificationToken: null, // Clear the token
            emailVerificationTokenExpires: null,
            updatedAt: new Date(),
        };

        const updatedUser = await updateUserDB(user._id, updateData);

        if (!updatedUser) {
            return res.status(500).json({
                success: false,
                message: 'Failed to verify email',
            });
        }

        passLogger.info(`Email verified for user: ${user.email}`);

        return res.status(200).json({
            success: true,
            message: 'Email verified successfully! You can now log in.',
        });

    } catch (error: any) {
        passLogger.error('Error verifying email', { error: error.message });
        res.status(500).json({
            success: false,
            message: 'Server error during email verification',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};

/**
 * Resends email verification email.
 * @async
 * @function resendVerificationEmail
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {string} req.body.email - User's email address
 * @returns {Promise<Response>} JSON response with status
 * @throws {400} If email is missing or user already verified
 * @throws {404} If user not found
 * @throws {500} If server error occurs
 * @example
 * // POST /api/resend-verification
 * // Request body: { email: "user@example.com" }
 * // Response: { success: true, message: "Verification email sent" }
 */
export const resendVerificationEmail = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required',
            });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const user = await getUserByEmailDB(normalizedEmail);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        if (user.emailVerified) {
            return res.status(400).json({
                success: false,
                message: 'Email is already verified',
            });
        }

        // Generate new verification token
        const emailVerificationToken = utils.generateEmailVerificationToken();
        const emailVerificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Update user with new token
        const updateData = {
            emailVerificationToken,
            emailVerificationTokenExpires,
            updatedAt: new Date(),
        };

        const updatedUser = await updateUserDB(user._id, updateData);

        if (!updatedUser) {
            return res.status(500).json({
                success: false,
                message: 'Failed to generate new verification token',
            });
        }

        // Send verification email
        try {
            await utils.sendEmailVerificationEmail(normalizedEmail, emailVerificationToken, user.firstName);
            passLogger.info(`Verification email resent to: ${normalizedEmail}`);
        } catch (emailError) {
            passLogger.error('Failed to resend verification email', { error: emailError, email: normalizedEmail });
            return res.status(500).json({
                success: false,
                message: 'Failed to send verification email',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Verification email sent. Please check your inbox.',
        });

    } catch (error: any) {
        passLogger.error('Error resending verification email', { error: error.message });
        res.status(500).json({
            success: false,
            message: 'Server error while resending verification email',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};
