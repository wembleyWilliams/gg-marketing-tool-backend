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
 * @async
 * @function createCard
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<Response>} Promise that resolves to the Express response
 * @throws {Error} If card creation fails
 * @description
 * Creates a new card with a unique identifier and hash mapping. Verifies business ownership if businessId is provided.
 * @example
 * // Request body example:
 * {
 *   "userId": "user123",
 *   "businessId": "business456", // Optional
 *   "status": "active",
 *   // other card properties...
 * }
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
 * Retrieves a card by its identifier.
 * @async
 * @function getCard
 * @param {Request} req - Express request object containing identifier in params
 * @param {Response} res - Express response object
 * @returns {Promise<void>} Promise that resolves when response is sent
 * @description
 * Fetches card details using the identifier which is mapped to the actual card ID in the database.
 * @example
 * // Request params example:
 * {
 *   "identifier": "abc123def456"
 * }
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
 * Updates a card's information by its ID.
 * @async
 * @function updateCard
 * @param {Request} req - Express request object containing cardId in params and update data in body
 * @param {Response} res - Express response object
 * @returns {Promise<void>} Promise that resolves when response is sent
 * @description
 * Updates the specified card with the provided data. Returns the updated card if successful.
 * @example
 * // Request params example:
 * {
 *   "cardId": "card123"
 * }
 * // Request body example:
 * {
 *   "status": "inactive",
 *   "lastTap": "2023-01-01T00:00:00Z"
 * }
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
 * @async
 * @function deleteCard
 * @param {Request} req - Express request object containing cardId in params
 * @param {Response} res - Express response object
 * @returns {Promise<void>} Promise that resolves when response is sent
 * @description
 * Removes the specified card from the database. Returns the deleted card if successful.
 * @example
 * // Request params example:
 * {
 *   "cardId": "card123"
 * }
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

/**
 * Records a tap event for a card and increments the tap count.
 * @async
 * @function incrementTap
 * @param {Request} req - Express request object containing identifier and source in params, and tap info in body
 * @param {Response} res - Express response object
 * @returns {Promise<Response>} Promise that resolves to the Express response
 * @description
 * Records tap details including location and device information. Skips recording for admin sources.
 * @example
 * // Request params example:
 * {
 *   "identifier": "abc123def456",
 *   "source": "mobile" // Optional, "admin" skips recording
 * }
 * // Request body example:
 * {
 *   "location": {
 *     "lat": 40.7128,
 *     "lng": -74.0060,
 *     "accuracy": 10
 *   },
 *   "deviceInfo": {
 *     "os": "iOS",
 *     "browser": "Safari",
 *     "ip": "192.168.1.1"
 *   }
 * }
 */

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

/**
 * Toggles a card's status between active and inactive.
 * @async
 * @function toggleCard
 * @param {Request} req - Express request object containing cardId in params
 * @param {Response} res - Express response object
 * @returns {Promise<void>} Promise that resolves when response is sent
 * @description
 * Switches the card's status (active ↔ inactive) and returns the updated status.
 * @example
 * // Request params example:
 * {
 *   "cardId": "card123"
 * }
 */
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

/**
 * Aggregates card data for a given identifier.
 * @async
 * @function aggregateCardData
 * @param {Request} req - Express request object containing identifier in params
 * @param {Response} res - Express response object
 * @returns {Promise<void>} Promise that resolves when response is sent
 * @description
 * Collects and combines various data points related to the card identified by the given identifier.
 * @example
 * // Request params example:
 * {
 *   "identifier": "abc123def456"
 * }
 */

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