import {getUserByEmailDB, updateUserDB} from "../database";
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import {UserData} from "../common/types";
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret'; // use env in production


/**
 * Generates a temporary password for a user, hashes it, and stores it in the DB.
 * @param email - The email of the user to assign the temp password to.
 * @returns { tempPassword: string, hash: string } - The raw password (for email) and its hash (for DB)
 */
export const utils = {
    generateTempPassword: async (email: string): Promise<{ tempPassword: string, hash: string }> => {
        const user = await getUserByEmailDB(email);
        if (!user) {

            throw new Error('User not found');
        }

        // 1. Generate a random 10-character password
        const tempPassword = crypto.randomBytes(12).toString('base64').slice(0, 10);

        // 2. Hash it securely
        const hash = await bcrypt.hash(tempPassword, 12);

        // 3. Update the user in the DB with the hashed password and firstLogin flag
        await updateUserDB(user._id, {
            password: hash,
            firstLogin: true,
            updatedAt: new Date(),
        } as unknown as Partial<UserData>);

        // 4. Return both plain and hashed password
        return {
            tempPassword,
            hash,
        };
    },
    setNewPassword: async (email: string, newPassword: string): Promise<void> => {
        const user = await getUserByEmailDB(email);
        if (!user) {
            throw new Error('User not found');
        }

        if (!user.firstLogin) {
            throw new Error('Password already set or not eligible for reset.');
        }

        // 1. Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 12);

        // 2. Update the user document
        await updateUserDB(user._id, {
            password: hashedPassword,
            firstLogin: false,
            updatedAt: new Date(),
        });
    },
    generateJWT: (user: any): string => {
        const payload = {
            _id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role||'admin',
        };

        return jwt.sign(payload, JWT_SECRET, {expiresIn: '7d'});
    }

}