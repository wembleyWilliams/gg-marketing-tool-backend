/**
 * @file Business verification utility functions
 * @module utilities/businessVerification
 */

import { getBusinessByIdDB } from "../database";

/**
 * Verifies if a business exists and is owned by the specified user
 * @async
 * @function verifyBusinessId
 * @param {string} userId - The ID of the user to verify ownership against
 * @param {string} businessId - The ID of the business to verify
 * @returns {Promise<{success: boolean, message: string}>} Verification result object containing:
 *          - success: Boolean indicating verification status
 *          - message: Descriptive message about the verification result
 * @throws {Error} May throw errors from database operations
 *
 * @example
 * const result = await verifyBusinessId('user123', 'business456');
 * if (result.success) {
 *   // Proceed with business operations
 * } else {
 *   // Handle verification failure
 * }
 */
export const verifyBusinessId = async (userId: string, businessId: string) => {
    // Validate input parameters
    if (!businessId) {
        return {
            success: false,
            message: 'No businessId provided'
        };
    }

    try {
        // Retrieve business from database
        const business = await getBusinessByIdDB(businessId);

        // Verify business exists and is owned by the user
        if (!business || business.userId.toString() !== userId.toString()) {
            return {
                success: false,
                message: 'User does not own business'
            };
        }

        // Return success if verification passes
        return {
            success: true,
            message: 'User - Business verified'
        };

    } catch (error) {
        // Log and rethrow any database errors
        console.error('Error verifying business ownership:', error);
        throw error;
    }
};