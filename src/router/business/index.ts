import {
    createBusinessDB,
    deleteBusinessDB,
    getBusinessByIdDB, getBusinessByUserIdDB,
    updateLogoDB,
    updateSocialHandlesDB
} from "../../database";
import logger from '../../logger/logger';


// Logging
const businessLogger = logger.child({ context: 'businessService' });

/**
 * Business service module handling all business-related operations.
 * @module businessService
 * @description Provides CRUD operations and additional business management functionality.
 */

/**
 * Deletes a business by its ID.
 * @async
 * @function deleteBusiness
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {string} req.params.businessId - The ID of the business to delete
 * @returns {Promise<void>} Resolves when the operation completes
 * @throws {Error} If the deletion fails
 * @example
 * // DELETE /business/:businessId
 * deleteBusiness(req, res);
 */
export const deleteBusiness = async (req: any, res: any) => {
    const businessId = req.params.businessId;
    businessLogger.info("Deleting business data");

    try {
        let value = await deleteBusinessDB(businessId)
        businessLogger.info(`Business document successfully removed! ${value}`);
        res.status(200).send(value);
    } catch (err) {
        businessLogger.error('Error deleting business', { error: err });
        res.status(500).send({ message: 'Error deleting business', error: err });
    }
};

/**
 * Creates a new business with the provided data.
 * @async
 * @function createBusiness
 * @param {Request} req - Express request object containing business data
 * @param {Response} res - Express response object
 * @param {Object} req.body - The business data to create
 * @returns {Promise<void>} Resolves when the operation completes
 * @throws {Error} If the creation fails
 * @example
 * // POST /business
 * createBusiness(req, res);
 */
export const createBusiness = async (req: any, res: any) => {
    businessLogger.info("Creating business data");

    try {
        let value = await createBusinessDB(req.body)
        businessLogger.info(`Business document successfully created! ${value}`);
        res.status(201).send(value);
    } catch (err) {
        businessLogger.error('Error creating business', { error: err });
        res.status(500).send({ message: 'Error creating business', error: err });
    }
};

/**
 * Retrieves a business by its ID.
 * @async
 * @function getBusiness
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {string} req.params.businessId - The ID of the business to retrieve
 * @returns {Promise<void>} Resolves when the operation completes
 * @throws {Error} If the retrieval fails
 * @example
 * // GET /business/:businessId
 * getBusiness(req, res);
 */
export const getBusiness = async (req: any, res: any) => {
    businessLogger.info("Retrieving business data");
    const businessId = req.params.businessId;

    try {
        let retrievedBusiness: any =  await getBusinessByIdDB(businessId)
        if (retrievedBusiness) {
            businessLogger.info(`Business document retrieved ${retrievedBusiness._id}`);
            res.status(200).send(retrievedBusiness);
        } else {
            businessLogger.info('No business document retrieved');
            res.status(404).send({ message: 'Business not found' });
        }
    } catch(err){
        businessLogger.error('Error retrieving business', { error: err });
        res.status(500).send({ message: 'Error retrieving business', error: err });
    }
};


/**
 * Retrieves a business by its associated user ID.
 * @async
 * @function getBusinessByUserId
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {string} req.params.userId - The user ID associated with the business
 * @returns {Promise<void>} Resolves when the operation completes
 * @throws {Error} If the retrieval fails
 * @example
 * // GET /business/user/:userId
 * getBusinessByUserId(req, res);
 */
export const getBusinessByUserId = async (req: any, res: any) => {
    businessLogger.info("Retrieving business data by user ID");
    const userId = req.params.userId;
    try {
        let retrievedBusiness: any = await getBusinessByUserIdDB(userId);

        if (retrievedBusiness) {
            businessLogger.info(`Business document retrieved for user ID ${userId}`);
            res.status(200).send(retrievedBusiness);
        } else {
            businessLogger.info('No business document found for given user ID');
            res.status(404).send({ message: 'Business not found' });
        }
    } catch (err: any) {
        businessLogger.error('Error retrieving business by user ID', { error: err });
        // Ensure to send error message properly
        res.status(500).send({ message: 'Error retrieving business', error: err.message }); // Return error message as string
    }
};

/**
 * Updates a business's social media handles.
 * @async
 * @function updateBusiness
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {string} req.params.businessId - The ID of the business to update
 * @param {Object} req.body.handle - The new social media handles
 * @returns {Promise<void>} Resolves when the operation completes
 * @throws {Error} If the update fails
 * @example
 * // PUT /business/social/:businessId
 * updateBusiness(req, res);
 */
export const updateBusiness = async (req: any, res: any) => {
    const businessId = req.params.businessId;
    const businessHandle = req.body.handle;

    try {
        let updatedBusiness = await updateSocialHandlesDB(businessId, businessHandle)
        businessLogger.info(`Business social handles updated for ID: ${businessId}`);
        res.status(200).send(updatedBusiness);
    }
    catch(err){
        businessLogger.error('Error updating business social handles', { error: err });
        res.status(500).send({ message: 'Error updating business social handles', error: err });
    }
};

/**
 * Updates a business's logo.
 * @async
 * @function updateBusinessLogo
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {string} req.params.businessId - The ID of the business to update
 * @param {Object} req.body - The new logo data
 * @returns {Promise<void>} Resolves when the operation completes
 * @throws {Error} If the update fails
 * @example
 * // PUT /business/logo/:businessId
 * updateBusinessLogo(req, res);
 */
export const updateBusinessLogo = async (req: any, res: any) => {
    const businessId = req.params.businessId;
    const logo = req.body;

        try{
            let updatedLogo = await updateLogoDB(businessId, logo)

            if (updatedLogo.modifiedCount > 0) {
                businessLogger.info("Logo Document updated");
                res.status(200).send("Logo Document updated");

            } else {
                businessLogger.info("Logo Document not updated");
                res.status(502).send("Logo Document not updated");
            }
            return res
        }
        catch(err){
            businessLogger.error('Error updating business logo', { error: err });
            res.status(500).send({ message: 'Error updating business logo', error: err });
            return res
        }

};

/**
 * Default export of all business service functions.
 * @type {Object}
 * @property {Function} createBusiness - Creates a new business
 * @property {Function} getBusiness - Retrieves a business by ID
 * @property {Function} getBusinessByUserId - Retrieves a business by user ID
 * @property {Function} updateBusiness - Updates business social handles
 * @property {Function} updateBusinessLogo - Updates business logo
 * @property {Function} deleteBusiness - Deletes a business
 */


export default {createBusiness, getBusiness, getBusinessByUserId, updateBusiness, updateBusinessLogo, deleteBusiness}