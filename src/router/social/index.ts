import {
    createSocialDB,
    deleteSocialDB,
    getSocialDB,
    getSocialByUserIdDB,
    updateSocialHandlesDB, updateSocialDB
} from "../../database";
import logger from '../../logger/logger';

// Logging
const socialLogger = logger.child({ context: 'socialService' });

/**
 * Route handler for creating a new social media handle.
 * @param {Request} req - The request object containing social media data.
 * @param {Response} res - The response object.
 */
export const createSocial = async (req: any, res: any) => {
    socialLogger.info("Creating social media profile");

    try {
        let value = await createSocialDB(req.body);
        socialLogger.info(`Social media handle successfully created! ${value}`);
        res.status(201).send(value);
    } catch (err) {
        socialLogger.error('Error creating social profile', { error: err });
        res.status(500).send({ message: 'Error creating social profile', error: err });
    }
};

/**
 * Route handler for retrieving a social media handle by ID.
 * @param {Request} req - The request object containing the social ID.
 * @param {Response} res - The response object.
 */
export const getSocial = async (req: any, res: any) => {
    socialLogger.info("Retrieving social media handle");
    const socialId = req.params.socialId;

    try {
        let retrievedSocial = await getSocialDB(socialId);
        if (retrievedSocial) {
            socialLogger.info(`Social media handle retrieved: ${retrievedSocial._id}`);
            res.status(200).send(retrievedSocial);
        } else {
            socialLogger.info('No social media handle retrieved');
            res.status(404).send({ message: 'Social profile not found' });
        }
    } catch (err) {
        socialLogger.error('Error retrieving social profile', { error: err });
        res.status(500).send({ message: 'Error retrieving social profile', error: err });
    }
};

/**
 * Route handler for retrieving social media handles by user ID.
 * @param {Request} req - The request object containing the user ID.
 * @param {Response} res - The response object.
 */
export const getSocialByUserId = async (req: any, res: any) => {
    socialLogger.info("Retrieving social media handles by user ID");
    const userId = req.params.userId;

    try {
        let socialHandles = await getSocialByUserIdDB(userId);
        if (socialHandles.length > 0) {
            socialLogger.info(`Social media handles retrieved for user ID: ${userId}`);
            res.status(200).send(socialHandles);
        } else {
            socialLogger.info('No social media handles found for the given user ID');
            res.status(404).send({ message: 'No social media handles found' });
        }
    } catch (err) {
        socialLogger.error('Error retrieving social media handles by user ID', { error: err });
        res.status(500).send({ message: 'Error retrieving social media handles', error: err });
    }
};

/**
 * Route handler for updating social media handles for a specific ID.
 * @param {Request} req - The request object containing the social ID and new handle.
 * @param {Response} res - The response object.
 */
export const updateSocial = async (req: any, res: any) => {
    const socialId = req.params.socialId;
    const profile = req.body.profile;

    try {
        let updatedSocial = await updateSocialDB(socialId, profile);
        socialLogger.info(`Social profile updated for ID: ${socialId}`);
        res.status(200).send(updatedSocial);
    } catch (err) {
        socialLogger.error('Error updating social profile', { error: err });
        res.status(500).send({ message: 'Error updating social profile', error: err });
        return  null
    }
};

/**
 * Route handler for deleting a social media handle by ID.
 * @param {Request} req - The request object containing the social ID.
 * @param {Response} res - The response object.
 */
export const deleteSocial = async (req: any, res: any) => {
    const socialId = req.params.socialId;
    socialLogger.info("Deleting social media handle");

    try {
        let value = await deleteSocialDB(socialId);
        socialLogger.info(`Social media handle successfully removed! ${value}`);
        res.status(200).send(value);
    } catch (err) {
        socialLogger.error('Error deleting social profile', { error: err });
        res.status(500).send({ message: 'Error deleting social profile', error: err });
    }
};

export default { createSocial, getSocial, getSocialByUserId, updateSocial, deleteSocial };
