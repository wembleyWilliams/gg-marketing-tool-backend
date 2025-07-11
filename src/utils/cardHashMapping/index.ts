/**
 * @file Cryptographic hash utilities
 * @module utils/hashHandler
 * @description Provides secure hashing functionality using SHA-256 algorithm
 */

import * as crypto from "crypto";

/**
 * Cryptographic hash utilities namespace
 * @namespace hashHandler
 */
const hashHandler = {
    /**
     * Generates a SHA-256 hash of the input string
     * @async
     * @function createSHA256Hash
     * @memberof hashHandler
     * @param {string} inputString - The string to be hashed
     * @returns {Promise<string>} Hexadecimal representation of the SHA-256 hash
     * @throws {Error} May throw errors if hashing fails
     *
     * @example
     * // Hash a password
     * const hashedPassword = await hashHandler.createSHA256Hash('mySecurePassword123');
     * console.log(hashedPassword); // 'a591a...'
     *
     * @example
     * // Verify data integrity
     * const originalData = 'sensitive information';
     * const hash = await hashHandler.createSHA256Hash(originalData);
     * // Store hash for later verification
     */
    createSHA256Hash: async (inputString: string): Promise<string> => {
        if (!inputString || typeof inputString !== 'string') {
            throw new Error('Invalid input: inputString must be a non-empty string');
        }

        try {
            const hash = crypto.createHash('sha256');
            hash.update(inputString);

            return hash.digest('hex');
        } catch (error) {
            console.error('Hashing failed:', error);
            throw new Error('Failed to generate hash');
        }
    }
};

export default hashHandler;