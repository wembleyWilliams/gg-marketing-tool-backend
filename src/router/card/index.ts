import {Request, Response} from 'express';
import logger from '../../logger/logger';
import {
    aggregateDataDB,
    createCardDB,
    createHashMappingDB,
    deleteCardDB,
    getCardByIdDB, getCardHashMappingByIdDB,
    updateCardDB
} from "../../database";
import {Card, Tap} from "../../common/types";
import {customAlphabet} from "nanoid";
import {nolookalikes} from "nanoid-dictionary";
import hashHandler from "../../utils/cardHashMapping";
import {verifyBusinessId} from "../../utils/verifyBusinessId";

const cardsLogger = logger.child({context: 'cardsService'});
/**
 * Creates a new card in the database.
 *
 * @param {Request} req - The request object from Express, containing the card data in `req.body`.
 * @param {Response} res - The response object from Express to send the response.
 * @returns {Promise<Response>} The response with status and message for card creation.
 *
 * @example
 * // Expected card data in `req.body`:
 * // {
 * //   "userId": "user-id",
 * //   "businessId": "business-id", Optional
 * //   "status": "active",
 * //   ...
 * // }
 */
export const createCard = async (req: Request, res: Response): Promise<Response | void> => {
    const cardData = req.body;

    try {
        const generateId = customAlphabet(nolookalikes, 12);
        const identifier = generateId();

        // Verify business ownership if businessId is provided
        if (cardData.businessId) {
            const verified = await verifyBusinessId(cardData.userId, cardData.businessId);
            if (!verified.success) {
                return res.status(403).send({
                    message: 'Verification Failed! User does not own business',
                    success: false
                });
            }
        }

        // Create card in database
        const response = await createCardDB(cardData);

        if (!response) {
            cardsLogger.error('Error card creation unsuccessful');
            return res.status(500).send({message: 'Error card creation unsuccessful'});
        }

        // Create hash mapping and send success response
        const cardId = response.insertedId.toString();
        const hashedId = await hashHandler.createSHA256Hash(cardId);
        await createHashMappingDB({cardId, hash: hashedId, identifier});

        return res.status(200).send({
            message: 'Success! Card created: Card created successfully',
            hashedId,
            identifier
        });

    } catch (err: any) {
        cardsLogger.error('Error inserting card information', {error: err});
        return res.status(500).send({message: 'Error inserting card information', error: err});
    }
};
/**
 * Retrieves a card by its ID.
 *
 * @param {Request} req - The request object from Express, with `cardId` in `req.params`.
 * @param {Response} res - The response object from Express to send the retrieved card data.
 * @returns {Promise<Response>} The response containing the card data if found, or an error message.
 *
 * @example
 * // Expected `req.params`:
 * // {
 * //   "cardId": "card-id"
 * // }
 */
export const getCard = async (req: Request, res: Response): Promise<void> => {
    const identifier = req.params.identifier;

    if (identifier) {
        const cardFromHashTable = await getCardHashMappingByIdDB(identifier)
        // @ts-ignore
        const card = await getCardByIdDB(cardFromHashTable?.cardId)
            .then((result) => {
                if (!result) {
                    cardsLogger.error('Card not found');
                    res.status(400).send({message: 'Unable to find card'});
                } else return result;
            })
            .catch((err: any) => {
                cardsLogger.error('Error retrieving card information', {error: err});
                res.status(500).send({message: 'Error retrieving card information', error: err});
            });
        res.status(200).send(card);
    } else {
        cardsLogger.error('Error retrieving card information: card ID not provided');
        res.status(400).send({message: 'Unable to find card ID'});
    }
};

/**
 * Updates a card's data by its ID.
 *
 * @param {Request} req - The request object from Express, with `cardId` in `req.params` and updated card data in `req.body`.
 * @param {Response} res - The response object from Express to send the response after updating.
 * @returns {Promise<void>} The response with the updated card data or an error message.
 *
 * @example
 * // Expected `req.params`:
 * // {
 * //   "cardId": "card-id"
 * // }
 * // Expected `req.body`:
 * // {
 * //   "status": "updated status",
 * //   "lastTap": "updated date",
 * //   ...
 * // }
 */
export const updateCard = async (req: Request, res: Response): Promise<void> => {
    const cardId = req.params.cardId;
    const updatedCardData = req.body;

    if (cardId) {
        try {
            const updatedCard = await updateCardDB(cardId, updatedCardData);
            if (!updatedCard) {
                cardsLogger.error('Card not found');
                res.status(400).send({message: 'Unable to find card'});
            } else {
                res.status(200).send(updatedCard);
            }
        } catch (err) {
            cardsLogger.error('Error updating card information', {error: err});
            res.status(500).send({message: 'Error updating card information', error: err});
        }
    } else {
        cardsLogger.error('Error updating card information: card ID not provided');
        res.status(400).send({message: 'Unable to find card ID'});
    }
};

/**
 * Deletes a card by its ID.
 *
 * @param {Request} req - The request object from Express, with `cardId` in `req.params`.
 * @param {Response} res - The response object from Express to confirm deletion or report an error.
 * @returns {Promise<void>} The response with a success or error message after deletion.
 *
 * @example
 * // Expected `req.params`:
 * // {
 * //   "cardId": "card-id"
 * // }
 */
export const deleteCard = async (req: Request, res: Response): Promise<void> => {
    const cardId = req.params.cardId;

    if (cardId) {
        try {
            const deletedCard = await deleteCardDB(cardId);
            if (!deletedCard) {
                cardsLogger.error('Card not found');
                res.status(400).send({message: 'Unable to find card'});
            } else {
                res.status(200).send(deletedCard);
            }
        } catch (err) {
            cardsLogger.error('Error deleting card', {error: err});
            res.status(500).send({message: 'Error deleting card', error: err});
        }
    } else {
        cardsLogger.error('Error deleting card: card ID not provided');
        res.status(400).send({message: 'Unable to find card ID'});
    }
};

export const incrementTap = async (req: Request, res: Response) => {
    const { identifier, source } = req.params;
    const info: any = req.body;

    // Early return for admin sources
    if (source && source === 'admin') {
        cardsLogger.info('Admin tap detected - skipping recording');
        return res.status(200).send({
            message: 'Tap Event Not Recorded! Service User Detected!'
        });
    }

    if (!identifier) {
        cardsLogger.warn('No identifier provided');
        return res.status(400).send({ message: 'Identifier is required' });
    }

    const cardFromHashTable = await getCardHashMappingByIdDB(identifier);
    if (!cardFromHashTable?.cardId) {
        cardsLogger.warn('Card mapping not found', { identifier });
        return res.status(404).send({ message: 'Card not found' });
    }

    const card = await getCardByIdDB(cardFromHashTable.cardId);
    if (!card?.status) {
        cardsLogger.warn('Card not active', { cardId: card?._id });
        return res.status(400).send({ message: 'Card not active' });
    }

    try {
        const newTap: Tap = {
            timestamp: new Date().toISOString(),
            location: {
                latitude: info.location.lat.toString(),
                longitude: info.location.lng.toString(),
                accuracy: info.location.accuracy?.toString() || 'unknown'
            },
            deviceInfo: {
                os: info.deviceInfo.os,
                browser: info.deviceInfo.browser,
                ip: info.deviceInfo.ip
            }
        };

        const updatedTapData = {
            tapCount: (card.tapCount || 0) + 1,
            taps: [...(card.taps || []), newTap]
        };

        const updatedCard = await updateCardDB(card._id, updatedTapData);
        if (!updatedCard) {
            cardsLogger.error('Card update failed', { cardId: card._id });
            return res.status(400).send({ message: 'Unable to update card taps' });
        }

        cardsLogger.info('Tap recorded successfully', {
            cardId: card._id,
            tapCount: updatedCard.tapCount
        });
        return res.status(200).send({
            message: 'Tap Event Recorded Successfully!',
            tapCount: updatedCard.tapCount
        });
    } catch (err) {
        cardsLogger.error('Error updating card tap information', {
            error: err,
            cardId: card._id
        });
        return res.status(500).send({
            message: 'Error updating card tap information',
            error: err
        });
    }
};

export const toggleCard = async (req: Request, res: Response) => {
    const cardId: string = req.params.cardId;

    if (cardId) {
        const card = await getCardByIdDB(cardId);
        let status = card?.status;

        let updatedStatus: { status: "active" | "inactive" } = {
            status: status === "active" ? "inactive" : "active"
        };

        try {
            const updatedCard = await updateCardDB(cardId, updatedStatus);

            if (!updatedCard) {
                cardsLogger.error('Card not found');
                res.status(400).send({ message: 'Unable to update card status' });
            } else {
                res.status(200).send({
                    message: `Card status updated to ${updatedStatus.status}`,
                    status: updatedCard.status
                });
            }
        } catch (err) {
            cardsLogger.error('Error updating card status', { error: err });
            res.status(500).send({
                message: 'Error updating card status',
                error: err
            });
        }
    } else {
        res.status(400).send({ message: 'Card ID is required' });
    }
};

export const aggregateCardData = async (req: Request, res: Response) => {
    let identifier = req.params.identifier;

    if (identifier) {

        let aggregatedData = await aggregateDataDB(identifier)
            .then((result) => {
                return result;
            })
            .catch((err: any) => {
                cardsLogger.error('Error aggregating data', {error: err});
                res.status(500).send({message: 'Error aggregating data', error: err});
            });

        res.status(200).send(aggregatedData);
    } else {
        cardsLogger.error('Error aggregating data: user ID not provided');
        res.status(400).send({message: 'Unable to find user ID'});
    }
};