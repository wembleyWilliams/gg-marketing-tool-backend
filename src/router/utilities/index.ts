import { Request, Response } from 'express';
import generateContactCard from '../../utils/generateContactCard';
import logger from '../../logger/logger';
import { VCardData } from '../../common/types';
import {
    createVCardDB,
    deleteVCardDB,
    getCardHashMappingByIdDB,
    updateVCardDB,
} from '../../database';

const utilityLogger = logger.child({ context: 'utilityService' });

/**
 * @route POST /vcard/create
 * @desc Create a new virtual contact card (vCard)
 * @access Public or Authenticated
 */
export const createVCard = async (req: Request, res: Response) => {
    const vCardData: VCardData = req.body;

    try {
        const response = await createVCardDB(vCardData);
        res.status(200).send(`Success! VCard created: ${JSON.stringify(response)}`);
    } catch (err: any) {
        utilityLogger.error('Error inserting card information', { error: err });
        res.status(500).send({
            message: 'Error inserting card information',
            error: err.message ?? err,
        });
    }
};

/**
 * @route POST /vcard/get
 * @desc Generate and return a downloadable vCard file based on card hash
 * @access Public
 */
export const getVCard = async (req: Request, res: Response) => {
    const businessId = req.body.businessId;

    if (!businessId) {
        utilityLogger.error('Missing businessId in request');
        return res.status(400).send({ message: 'Missing businessId in request' });
    }

    try {
        const hashRecord = await getCardHashMappingByIdDB(businessId);
        if (!hashRecord?.cardId) {
            return res.status(404).send({ message: 'Card not found for this ID' });
        }

        utilityLogger.info(`Generating vCard for card ID: ${hashRecord.cardId}`);

        const vCard = await generateContactCard(hashRecord.cardId);

        res.setHeader('Content-Type', `text/vcard; name="${businessId}.vcf"`);
        res.setHeader('Content-Disposition', `inline; filename="${businessId}.vcf"`);
        return res.status(200).send(vCard);
    } catch (err: any) {
        utilityLogger.error('Error while generating virtual card', { error: err });
        return res.status(500).send({ message: 'Failed to generate vCard', error: err.message ?? err });
    }
};

/**
 * @route PUT /vcard/update
 * @desc Update an existing vCard entry
 * @access Authenticated
 */
export const updateVCard = async (req: Request, res: Response) => {
    const ownerId = req.body.ownerId;
    const cardToBeUpdated = req.body;

    if (!ownerId) {
        utilityLogger.error('Missing ownerId for vCard update');
        return res.status(400).send({ message: 'Missing ownerId' });
    }

    try {
        const updatedVCard = await updateVCardDB(ownerId, cardToBeUpdated);
        return res.status(200).send(updatedVCard);
    } catch (err: any) {
        utilityLogger.error('Error updating vCard information', { error: err });
        return res.status(500).send({ message: 'Error updating vCard', error: err.message ?? err });
    }
};

/**
 * @route DELETE /vcard/delete
 * @desc Delete a vCard by owner ID
 * @access Authenticated
 */
export const deleteVCard = async (req: Request, res: Response) => {
    const ownerId = req.body.ownerId;

    if (!ownerId) {
        utilityLogger.error('Missing ownerId for vCard deletion');
        return res.status(400).send({ message: 'Missing ownerId' });
    }

    try {
        const deletedVCard = await deleteVCardDB(ownerId);
        return res.status(200).send(deletedVCard);
    } catch (err: any) {
        utilityLogger.error('Error deleting vCard', { error: err });
        return res.status(500).send({ message: 'Error deleting vCard', error: err.message ?? err });
    }
};
