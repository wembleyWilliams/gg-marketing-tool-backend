import {
    createBusinessDB,
    deleteBusinessDB,
    getBusinessByIdDB,
    updateLogoDB,
    updateSocialHandlesDB
} from "../../database";
import logger from '../../logger/logger';

// Logging
const businessLogger = logger.child({ context: 'businessService' });

/**
 * Route handler for deleting a business by ID.
 * @param {Request} req - The request object containing the business ID.
 * @param {Response} res - The response object.
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
 * Route handler for creating a new business.
 * @param {Request} req - The request object containing business data.
 * @param {Response} res - The response object.
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
 * Route handler for retrieving a business by ID.
 * @param {Request} req - The request object containing the business ID.
 * @param {Response} res - The response object.
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
 * Route handler for modifying a business's social handles by ID.
 * @param {Request} req - The request object containing the business ID and new handles.
 * @param {Response} res - The response object.
 */
export const modifyBusiness = async (req: any, res: any) => {
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
 * Route handler for updating a business logo by ID.
 * @param {Request} req - The request object containing the business ID and logo data.
 * @param {Response} res - The response object.
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

export default {createBusiness, getBusiness, modifyBusiness, updateBusinessLogo, deleteBusiness}