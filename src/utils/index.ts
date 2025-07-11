/**
 * @file Authentication utility functions
 * @module utils/authUtils
 * @description Contains utility functions for password generation, password reset, and JWT generation
 */

import { getUserByEmailDB, updateUserDB } from "../database";
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { UserData } from "../common/types";
import jwt from 'jsonwebtoken';

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
        const user = await getUserByEmailDB(email);
        if (!user) {
            throw new Error('User not found');
        }

        // Generate a random 10-character password
        const tempPassword = crypto.randomBytes(12).toString('base64').slice(0, 10);

        // Hash it securely with bcrypt
        const hash = await bcrypt.hash(tempPassword, 12);

        // Update the user in the DB with the hashed password and firstLogin flag
        await updateUserDB(user._id, {
            password: hash,
            firstLogin: true,
            updatedAt: new Date(),
        } as unknown as Partial<UserData>);

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

        return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
    }
};