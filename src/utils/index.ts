/**
 * @file Authentication utility functions
 * @module utils/authUtils
 * @description Contains utility functions for password generation, password reset, and JWT generation
 */

import {createTokenDB, getUserByEmailDB, getUserByVerificationTokenDB, updateUserDB} from "../database";
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import {TokenData, UserData} from "../common/types";
import jwt from 'jsonwebtoken';
import {ObjectId} from "mongodb";

/**
 * JWT secret key from environment variables with fallback for development
 * @constant {string}
 */
const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret'; // use env in production

/**
 * Authentication utility functions
 * @namespace utils
 */
export const utils = {


    /**
     * Generates a temporary password for a user, hashes it, and stores it in the database
     * @async
     * @function generateTempPassword
     * @memberof utils
     * @param {string} email - The email of the user to assign the temporary password to
     * @returns {Promise<{tempPassword: string, hash: string}>} Object containing:
     *          - tempPassword: The plaintext temporary password (for email communication)
     *          - hash: The hashed password (stored in database)
     * @throws {Error} Will throw an error if user is not found
     *
     * @example
     * try {
     *   const { tempPassword, hash } = await utils.generateTempPassword('user@example.com');
     *   // Send tempPassword via email and store hash in DB
     * } catch (error) {
     *   // Handle error
     * }
     */
    generateTempPassword: async (email: string): Promise<{ tempPassword: string, hash: string }> => {
        // const user = await getUserByEmailDB(email);
        // if (!user) {
        //     throw new Error('User not found');
        // }

        // Generate a random 10-character password
        const tempPassword = crypto.randomBytes(12).toString('base64').slice(0, 10);

        // Hash it securely with bcrypt
        const hash = await bcrypt.hash(tempPassword, 12);

        // Update the user in the DB with the hashed password and firstLogin flag
        // await updateUserDB(user._id, {
        //     password: hash,
        //     firstLogin: true,
        //     emailVerified: true,
        //     updatedAt: new Date(),
        // } as unknown as Partial<UserData>);

        return {
            tempPassword,
            hash,
        };
    },

    /**
     * Sets a new password for a user during first login or password reset
     * @async
     * @function setNewPassword
     * @memberof utils
     * @param {string} email - The email of the user
     * @param {string} newPassword - The new password to set
     * @returns {Promise<void>}
     * @throws {Error} Will throw an error if:
     *          - User is not found
     *          - Password is already set (firstLogin flag is false)
     *
     * @example
     * try {
     *   await utils.setNewPassword('user@example.com', 'newSecurePassword123');
     * } catch (error) {
     *   // Handle error
     * }
     */
    setNewPassword: async (email: string, newPassword: string): Promise<void> => {
        const user = await getUserByEmailDB(email);
        if (!user) {
            throw new Error('User not found');
        }

        if (!user.firstLogin) {
            throw new Error('Password already set or not eligible for reset.');
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 12);

        // Update the user document
        await updateUserDB(user._id, {
            password: hashedPassword,
            firstLogin: false,
            updatedAt: new Date(),
        });
    },

    /**
     * Generates a JSON Web Token (JWT) for user authentication
     * @function generateJWT
     * @memberof utils
     * @param {object} user - The user object containing required properties
     * @param {string} user._id - The user's unique identifier
     * @param {string} user.email - The user's email address
     * @param {string} user.firstName - The user's first name
     * @param {string} user.lastName - The user's last name
     * @param {string} [user.role='admin'] - The user's role (defaults to 'admin')
     * @returns {string} Signed JWT token with 1 hour expiration
     *
     * @example
     * const token = utils.generateJWT({
     *   _id: '123',
     *   email: 'user@example.com',
     *   firstName: 'John',
     *   lastName: 'Doe',
     *   role: 'user'
     * });
     */
    generateJWT: (user: {
        _id: string;
        email: string;
        firstName: string;
        lastName: string;
        role?: string;
    }): string => {
        const payload = {
            _id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role || 'admin',
        };

        return jwt.sign(payload, JWT_SECRET, {expiresIn: '1h'});
    },
    getLastTapDate: (taps: Array<{ cardId: string; timestamp: string | Date }>): string | null => {
        if (!taps || taps.length === 0) {
            return null;
        }

        let latestTap: Date | null = null;

        for (const tap of taps) {
            const tapDate = new Date(tap.timestamp);

            if (!latestTap || tapDate > latestTap) {
                latestTap = tapDate;
            }
        }

        const date = new Date(latestTap)
        console.log(date)

        return latestTap ? latestTap.toString() : null;
    },

    /**
     * Generates a secure email verification token
     * @returns {string} A secure random token
     */
    generateEmailVerificationToken: (): string => {
        return crypto.randomBytes(32).toString('hex');
    },

    /**
     * Gets user by email verification token
     * @param {string} token - The verification token
     * @returns {Promise<any>} User object or null
     */
    getUserByVerificationToken: async (token: string) => {
        return await getUserByVerificationTokenDB(token);
    },

    generatePasswordResetToken: async (userId: ObjectId) => {
        // Generate raw token
        const tokenRaw = crypto.randomBytes(32).toString("hex");
        const tokenHash = await bcrypt.hash(tokenRaw, 10);

        const tokenData: TokenData = {
            userId,
            type: "password_reset",
            tokenHash,
            expiresAt: new Date(Date.now() + 1000 * 60 * 30), // 30 mins expiry
            createdAt: new Date(),
            used: false
        };

        await createTokenDB(tokenData);

        return tokenRaw; // send raw version in email
    },

    /**
     * Sends password reset email with temporary password to user
     * @param {string} email - User's email address
     * @param {string} tempPassword - Temporary password for reset
     * @param {string} firstName - User's first name
     * @returns {Promise<void>}
     */
    sendPasswordResetEmail: async (
        email: string,
        tempPassword: string,
        firstName: string
    ): Promise<void> => {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        const loginUrl = `${process.env.FRONTEND_URL}`;
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password`;

        const htmlContent = `
    <!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Password Reset - Your Temporary Access</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body { 
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
            line-height: 1.6; 
            color: #1a1a1a; 
            background: #f8f9fa;
            min-height: 100vh;
            padding: 20px 0;
        }
        
        .email-wrapper {
            background: #f8f9fa;
            min-height: 100vh;
            padding: 40px 20px;
        }
        
        .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
            border: 1px solid #e8e8e8;
        }
        
        .header-section {
            background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
            padding: 48px 40px 32px;
            text-align: center;
            position: relative;
        }
        
        .lock-icon {
            font-size: 48px;
            margin-bottom: 16px;
        }
        
        .header-title {
            color: white;
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
            letter-spacing: -0.02em;
        }
        
        .header-subtitle {
            color: rgba(255, 255, 255, 0.8);
            font-size: 16px;
            font-weight: 400;
        }
        
        .content-section {
            padding: 40px;
        }
        
        .greeting {
            font-size: 18px;
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 24px;
        }
        
        .main-text {
            font-size: 16px;
            color: #4a4a4a;
            margin-bottom: 32px;
            line-height: 1.7;
        }
        
        .temp-password-section {
            background: linear-gradient(135deg, #f0f8ff, #e6f3ff);
            border: 2px solid #FF4500;
            border-radius: 16px;
            padding: 24px;
            margin: 32px 0;
            text-align: center;
        }
        
        .temp-password-label {
            font-size: 14px;
            color: #4a4a4a;
            font-weight: 600;
            margin-bottom: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .temp-password-value {
            font-size: 24px;
            font-weight: 800;
            color: #1a1a1a;
            background: white;
            padding: 16px 24px;
            border-radius: 12px;
            border: 1px solid #e8e8e8;
            font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
            letter-spacing: 2px;
            word-break: break-all;
            margin-bottom: 16px;
        }
        
        .copy-instruction {
            font-size: 12px;
            color: #6a6a6a;
            font-style: italic;
        }
        
        .instructions-section {
            background: #f8f9fa;
            border-radius: 12px;
            padding: 24px;
            margin: 32px 0;
            border: 1px solid #e8e8e8;
        }
        
        .instructions-title {
            font-size: 16px;
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 16px;
        }
        
        .instruction-step {
            display: flex;
            align-items: flex-start;
            margin-bottom: 12px;
            font-size: 14px;
            color: #4a4a4a;
        }
        
        .step-number {
            background: #FF4500;
            color: white;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: 600;
            margin-right: 12px;
            flex-shrink: 0;
        }
        
        .cta-section {
            text-align: center;
            margin: 40px 0;
        }
        
        .login-button { 
            display: inline-block;
            background: #FF4500;
            color: white;
            padding: 16px 32px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 16px rgba(255, 69, 0, 0.25);
            position: relative;
            overflow: hidden;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-right: 12px;
        }
        
        .login-button:hover {
            background: #e03e00;
            transform: translateY(-1px);
            box-shadow: 0 6px 20px rgba(255, 69, 0, 0.35);
        }
        
        .security-warning {
            background: linear-gradient(135deg, #fff3e0, #ffe0b3);
            border: 1px solid #FF4500;
            border-radius: 12px;
            padding: 20px;
            margin: 32px 0;
            display: flex;
            align-items: flex-start;
        }
        
        .warning-icon {
            font-size: 20px;
            margin-right: 12px;
            margin-top: 2px;
        }
        
        .security-warning-text {
            font-size: 14px;
            color: #d84315;
            font-weight: 500;
            flex: 1;
        }
        
        .footer-section {
            background: #1a1a1a;
            color: white;
            padding: 32px 40px;
            text-align: center;
        }
        
        .footer-signature {
            font-weight: 600;
            color: white;
            margin-bottom: 8px;
            font-size: 16px;
        }
        
        .footer-text {
            font-size: 14px;
            color: rgba(255, 255, 255, 0.7);
            line-height: 1.6;
        }
        
        .divider {
            height: 1px;
            background: #e8e8e8;
            margin: 32px 0;
        }
        
        @media (max-width: 600px) {
            .email-wrapper {
                padding: 20px 10px;
            }
            
            .header-section {
                padding: 32px 24px 20px;
            }
            
            .content-section {
                padding: 32px 24px;
            }
            
            .footer-section {
                padding: 24px;
            }
            
            .header-title {
                font-size: 24px;
            }
            
            .temp-password-value {
                font-size: 20px;
                padding: 12px 16px;
            }
            
            .login-button {
                padding: 14px 28px;
                font-size: 15px;
                display: block;
                margin-bottom: 16px;
            }
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="container">
            <div class="header-section">
                <div class="lock-icon">🔒</div>
                <h1 class="header-title">Password Reset Request</h1>
                <p class="header-subtitle">Your temporary access is ready</p>
            </div>
            
            <div class="content-section">
                <div class="greeting">Hi ${firstName},</div>
                
                <div class="main-text">
                    We received a request to reset your password. No worries - we've got you covered! Use the temporary password below to log in and set up your new permanent password.
                </div>
                
                <div class="temp-password-section">
                    <div class="temp-password-label">Your Temporary Password</div>
                    <div class="temp-password-value">${tempPassword}</div>
                    <div class="copy-instruction">Copy this password exactly as shown</div>
                </div>
                
                <div class="instructions-section">
                    <div class="instructions-title">How to reset your password:</div>
                    <div class="instruction-step">
                        <div class="step-number">1</div>
                        <div>Click the "Login Now" button below or go to the login page</div>
                    </div>
                    <div class="instruction-step">
                        <div class="step-number">2</div>
                        <div>Enter your email address and the temporary password above</div>
                    </div>
                    <div class="instruction-step">
                        <div class="step-number">3</div>
                        <div>You'll be prompted to set a new permanent password</div>
                    </div>
                    <div class="instruction-step">
                        <div class="step-number">4</div>
                        <div>Choose a strong password and you're all set!</div>
                    </div>
                </div>
                
                <div class="cta-section">
                    <a href="${loginUrl}" class="login-button">
                        🚀 Login Now
                    </a>
                </div>
                
                <div class="security-warning">
                    <span class="warning-icon">⚠️</span>
                    <div class="security-warning-text">
                        <strong>Security Notice:</strong> This temporary password expires in 24 hours and can only be used once. If you didn't request this reset, please contact our support team immediately.
                    </div>
                </div>
                
                <div class="divider"></div>
                
                <div style="font-size: 14px; color: #6a6a6a; text-align: center;">
                    <strong>Didn't request a password reset?</strong> Your account is still secure. Someone may have entered your email by mistake. You can safely ignore this email.
                </div>
            </div>
            
            <div class="footer-section">
                <div class="footer-signature">
                    Secure by design - The GG Team
                </div>
                <div class="footer-text">
                    Questions about your account? Reply to this email and we'll help you out right away.
                    <br><br>
                    <em>This is an automated security email. Please keep this information confidential.</em>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
`;

        const textContent = `
GG - Password Reset Request

Hi ${firstName},

We received a request to reset your password. No worries - we've got you covered!

Your Temporary Password: ${tempPassword}

How to reset your password:
1. Go to: ${loginUrl}
2. Enter your email and the temporary password above
3. You'll be prompted to set a new permanent password
4. Choose a strong password and you're all set!

⚠️ Security Notice: This temporary password expires in 24 hours and can only be used once. If you didn't request this reset, please contact our support team immediately.

Didn't request a password reset? Your account is still secure. Someone may have entered your email by mistake. You can safely ignore this email.

Secure by design - The GG Team

Questions about your account? Reply to this email and we'll help you out right away.
`;

        const mailOptions = {
            from: process.env.FROM_EMAIL || process.env.SMTP_USER,
            to: email,
            subject: 'Password Reset - Your Temporary Access Code',
            text: textContent,
            html: htmlContent,
        };

        await transporter.sendMail(mailOptions);
    },

    /**
     * Sends email verification email to user
     * @param {string} email - User's email address
     * @param {string} token - Verification token
     * @param {string} firstName - User's first name
     * @returns {Promise<void>}
     */
    sendEmailVerificationEmail: async (
        email: string,
        token: string,
        firstName: string
    ): Promise<void> => {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

        const htmlContent = `
        <!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>🎉 Welcome! Let's verify your email</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body { 
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
            line-height: 1.6; 
            color: #1a1a1a; 
            background: #f8f9fa;
            min-height: 100vh;
            padding: 20px 0;
        }
        
        .email-wrapper {
            background: #f8f9fa;
            min-height: 100vh;
            padding: 40px 20px;
        }
        
        .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
            border: 1px solid #e8e8e8;
        }
        
        .header-section {
            background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
            padding: 48px 40px 32px;
            text-align: center;
            position: relative;
        }
        
        .brand-logo {
            margin-bottom: 24px;
        }
        
        .logo-cg {
            display: inline-block;
            font-size: 48px;
            font-weight: 800;
            position: relative;
        }
        
        .logo-c {
            color: #1a1a1a;
            background: white;
            padding: 8px 12px 8px 16px;
            border-radius: 50px 0 0 50px;
            margin-right: -4px;
        }
        
        .logo-g {
            color: white;
            background: #FF4500;
            padding: 8px 16px 8px 12px;
            border-radius: 0 50px 50px 0;
        }
        
        .emoji-burst {
            font-size: 32px;
            margin-bottom: 16px;
        }
        
        .header-title {
            color: white;
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
            letter-spacing: -0.02em;
        }
        
        .header-subtitle {
            color: rgba(255, 255, 255, 0.8);
            font-size: 16px;
            font-weight: 400;
        }
        
        .content-section {
            padding: 40px;
        }
        
        .greeting {
            font-size: 18px;
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 24px;
        }
        
        .main-text {
            font-size: 16px;
            color: #4a4a4a;
            margin-bottom: 32px;
            line-height: 1.7;
        }
        
        .cta-section {
            text-align: center;
            margin: 40px 0;
        }
        
        .verify-button { 
            display: inline-block;
            background: #FF4500;
            color: white;
            padding: 16px 32px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 16px rgba(255, 69, 0, 0.25);
            position: relative;
            overflow: hidden;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .verify-button::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
            transition: left 0.5s;
        }
        
        .verify-button:hover::before {
            left: 100%;
        }
        
        .verify-button:hover {
            background: #e03e00;
            transform: translateY(-1px);
            box-shadow: 0 6px 20px rgba(255, 69, 0, 0.35);
        }
        
        .alternative-section {
            background: #f8f9fa;
            border-radius: 12px;
            padding: 24px;
            margin: 32px 0;
            border: 1px solid #e8e8e8;
        }
        
        .alternative-title {
            font-size: 14px;
            font-weight: 600;
            color: #6a6a6a;
            margin-bottom: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .alternative-link {
            word-break: break-all;
            color: #FF4500;
            font-size: 14px;
            font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
            background: white;
            padding: 12px;
            border-radius: 8px;
            border: 1px solid #e8e8e8;
        }
        
        .security-notice {
            background: linear-gradient(135deg, #fff3e0, #ffe0b3);
            border: 1px solid #FF4500;
            border-radius: 12px;
            padding: 20px;
            margin: 32px 0;
            display: flex;
            align-items: flex-start;
        }
        
        .security-notice-icon {
            font-size: 20px;
            margin-right: 12px;
            margin-top: 2px;
        }
        
        .security-notice-text {
            font-size: 14px;
            color: #d84315;
            font-weight: 500;
            flex: 1;
        }
        
        .footer-section {
            background: #1a1a1a;
            color: white;
            padding: 32px 40px;
            text-align: center;
        }
        
        .footer-signature {
            font-weight: 600;
            color: white;
            margin-bottom: 8px;
            font-size: 16px;
        }
        
        .footer-text {
            font-size: 14px;
            color: rgba(255, 255, 255, 0.7);
            line-height: 1.6;
        }
        
        .cta-highlight {
            color: #FF4500;
            font-weight: 600;
        }
        
        .divider {
            height: 1px;
            background: #e8e8e8;
            margin: 32px 0;
        }
        
        @media (max-width: 600px) {
            .email-wrapper {
                padding: 20px 10px;
            }
            
            .header-section {
                padding: 32px 24px 20px;
            }
            
            .content-section {
                padding: 32px 24px;
            }
            
            .footer-section {
                padding: 24px;
            }
            
            .header-title {
                font-size: 24px;
            }
            
            .logo-cg {
                font-size: 40px;
            }
            
            .verify-button {
                padding: 14px 28px;
                font-size: 15px;
            }
        }
        
        .pulse-animation {
            animation: pulse 2s ease-in-out infinite;
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.9; }
        }
        
        .lets-go-text {
            color: #FF4500;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-left: 8px;
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="container">
            <div class="header-section">
                <!--<div class="brand-logo">
                    <div class="logo-cg">
                        <span class="logo-c">G</span><span class="logo-g">G</span>
                    </div>
                </div>-->
                <div class="emoji-burst">🎉</div>
                <h1 class="header-title">You're Almost There!</h1>
                <p class="header-subtitle">Just one quick step to unlock your account</p>
            </div>
            
            <div class="content-section">
                <div class="greeting">Hey ${firstName}! 👋</div>
                
                <div class="main-text">
                    <strong>Welcome to the CG family!</strong> We're absolutely thrilled to have you on board.
                    <br><br>
                    Your account is ready to go, but first we need to make sure this email address is really yours. Click the button below to verify your email and <span class="cta-highlight">let's get you connected</span>!
                </div>
                
                <div class="cta-section">
                    <a href="${verificationUrl}" class="verify-button pulse-animation">
                        ✅ Verify Email Address
                    </a>
                </div>
                
                <div class="security-notice">
                    <span class="security-notice-icon">⏰</span>
                    <div class="security-notice-text">
                        <strong>Quick heads up:</strong> This verification link expires in 24 hours for your security!
                    </div>
                </div>
                
                <div class="alternative-section">
                    <div class="alternative-title">Button not working? No worries!</div>
                    <div class="alternative-link">${verificationUrl}</div>
                </div>
                
                <div class="divider"></div>
                
                <div style="font-size: 14px; color: #6a6a6a; text-align: center;">
                    <strong>Didn't sign up?</strong> No problem! You can safely ignore this email. Someone might have entered your email address by mistake. 🤷‍♀️
                </div>
            </div>
            
            <div class="footer-section">
                <div class="footer-signature">
                    Made for efficiency by the GG Team
                </div>
                <div class="footer-text">
                    Questions? We're here to help! Just hit reply and we'll get back to you lightning fast!
                    <br><br>
                    <em>Ready to make connections? <span class="lets-go-text">Let's Go!</span></em>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
    `;

        const textContent = `
        
        
        GG - Let's Go! 🎉

You're Almost There, ${firstName}! 

Hey there! 👋

Welcome to the CG family! We're absolutely thrilled to have you on board and can't wait to help you make those meaningful connections.

Your account is ready to go, but first we need to make sure this email address is really yours. Please verify your email by visiting this link:

${verificationUrl}

⏰ Quick heads up: This verification link expires in 24 hours for your security!

If the link doesn't work, you can copy and paste it directly into your browser.

🤷‍♀️ Didn't sign up? No problem! You can safely ignore this email. Someone might have entered your email address by mistake.

Questions? We're here to help! Just reply to this email and we'll get back to you lightning fast! 

Made with ❤️ by the CG Team

Ready to make connections? Let's Go! 🚀

Total Connections Made: Growing every day with amazing people like you!
    `;

        const mailOptions = {
            from: process.env.FROM_EMAIL || process.env.SMTP_USER,
            to: email,
            subject: 'Verify Your Email Address',
            text: textContent,
            html: htmlContent,
        };

        await transporter.sendMail(mailOptions);
    },

    /**
     * Sends temporary password email to user
     * @param {string} email - User's email address
     * @param {string} tempPassword - Temporary password
     * @param {string} firstName - User's first name
     * @returns {Promise<void>}
     */
    sendTempPasswordEmail: async (
        email: string,
        tempPassword: string,
        firstName: string
    ): Promise<void> => {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        const loginUrl = `${process.env.FRONTEND_URL}/set-password`;

        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>Your Temporary Password</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .password-box { 
                    background-color: #f8f9fa; 
                    border: 1px solid #dee2e6; 
                    border-radius: 5px; 
                    padding: 15px; 
                    text-align: center; 
                    margin: 20px 0; 
                    font-family: monospace;
                    font-size: 18px;
                }
                .button { 
                    display: inline-block; 
                    background-color: #28a745; 
                    color: white; 
                    padding: 12px 30px; 
                    text-decoration: none; 
                    border-radius: 5px; 
                    margin: 20px 0; 
                }
                .footer { margin-top: 30px; font-size: 12px; color: #666; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Your Temporary Password</h1>
                </div>
                
                <p>Hi ${firstName},</p>
                
                <p>Your account has been created successfully! Since you didn't set a password during registration, we've generated a temporary password for you.</p>
                
                <p>Your temporary password is:</p>
                <div class="password-box">${tempPassword}</div>
                
                <p><strong>Important:</strong> After verifying your email, please use this temporary password to log in and set your permanent password.</p>
                
                <div style="text-align: center;">
                    <a href="${loginUrl}" class="button">Set Your Password</a>
                </div>
                
                <p><strong>Security Note:</strong> This temporary password will only work for setting your permanent password. Please change it as soon as you log in.</p>
                
                <div class="footer">
                    <p>Best regards,<br>Your App Team</p>
                    <p>This is an automated email. Please do not reply to this message.</p>
                </div>
            </div>
        </body>
        </html>
    `;

        const textContent = `
        Hi ${firstName},
        
        Your account has been created successfully! Since you didn't set a password during registration, we've generated a temporary password for you.
        
        Your temporary password is: ${tempPassword}
        
        Important: After verifying your email, please use this temporary password to log in and set your permanent password.
        
        You can set your password at: ${loginUrl}
        
        Security Note: This temporary password will only work for setting your permanent password. Please change it as soon as you log in.
        
        Best regards,
        Your App Team
    `;

        const mailOptions = {
            from: process.env.FROM_EMAIL || process.env.SMTP_USER,
            to: email,
            subject: 'Your Temporary Password - Please Set Your Permanent Password',
            text: textContent,
            html: htmlContent,
        };

        await transporter.sendMail(mailOptions);
    }

};