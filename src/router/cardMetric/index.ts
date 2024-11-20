import { Request, Response} from "express";
import logger from '../../logger/logger';
import {
    createCardMetricDB,
    getCardMetricByCardIdDB,
    deleteCardMetricDB,
    updateCardMetricDB
} from "../../database";

const cardMetricsLogger = logger.child({context: 'cardMetricsService'})

/**
 * Creates a new CardMetric in the database.
 *
 * @param {Request} req - The request object from Express, containing the card metric data in `req.body`.
 * @param {Response} res - The response object from Express to send the response.
 * @returns {Promise<Response>} The response with status and message for card metric creation.
 *
 * @example
 * // Expected card metric data in `req.body`:
 * // {
 * //   "cardId": "card-id",
 * //   "metricType": "click",
 * //   "value": 1,
 * //   "timestamp": "2024-11-17T10:00:00Z"
 * // }
 */
export const createCardMetric = async (req: Request, res: Response): Promise<Response | void> => {
    const cardMetricData = req.body;
    try {
        const response = await createCardMetricDB(cardMetricData);
        if (response) {
            res.status(200).send({
                message: `Success! CardMetric created successfully`,
                cardMetricId: response?.insertedId.toString(),
            });
            return res;
        } else {
            cardMetricsLogger.error('Error creating CardMetric');
            res.status(500).send({ message: 'Error creating CardMetric' });
        }
    } catch (err: any) {
        cardMetricsLogger.error('Error inserting CardMetric information', { error: err });
        res.status(500).send({ message: 'Error inserting CardMetric information', error: err });
    }
};


/**
 * Retrieves a CardMetric by its ID.
 *
 * @param {Request} req - The request object from Express, with `cardMetricId` in `req.params`.
 * @param {Response} res - The response object from Express to send the retrieved card metric data.
 * @returns {Promise<Response>} The response containing the card metric data if found, or an error message.
 *
 * @example
 * // Expected `req.params`:
 * // {
 * //   "cardMetricId": "card-metric-id"
 * // }
 */
export const getCardMetric = async (req: Request, res: Response): Promise<void> => {
    const cardMetricId = req.params.cardId;
    if (cardMetricId) {
        const cardMetric = await getCardMetricByCardIdDB(cardMetricId)
            .then((result) => {
                if (!result) {
                    cardMetricsLogger.error('CardMetric not found');
                    res.status(400).send({ message: 'Unable to find CardMetric' });
                } else return result;
            })
            .catch((err: any) => {
                cardMetricsLogger.error('Error retrieving CardMetric information', { error: err });
                res.status(500).send({ message: 'Error retrieving CardMetric information', error: err });
            });
        res.status(200).send(cardMetric);
    } else {
        cardMetricsLogger.error('Error retrieving CardMetric information: CardMetric ID not provided');
        res.status(400).send({ message: 'Unable to find CardMetric ID' });
    }
};


/**
 * Updates a CardMetric's data by card ID.
 *
 * @param {Request} req - The request object from Express, with `cardId` in `req.params` and updated data in `req.body`.
 * @param {Response} res - The response object from Express to send the response after updating.
 * @returns {Promise<void>} The response with the updated card metric data or an error message.
 *
 * @example
 * // Expected `req.params`:
 * // {
 * //   "cardId": "card-id"
 * // }
 * // Expected `req.body`:
 * // {
 * //   "metricType": "updated-type",
 * //   "value": 2,
 * //   "timestamp": "updated-date"
 * // }
 */
export const updateCardMetric = async (req: Request, res: Response): Promise<void> => {
    const cardId = req.params.cardId;
    const updatedCardMetricData = req.body;

    if (cardId) {
        try {
            const updatedCardMetric = await updateCardMetricDB(cardId, updatedCardMetricData);
            if (!updatedCardMetric) {
                cardMetricsLogger.error('CardMetric not found');
                res.status(400).send({ message: 'Unable to find CardMetric' });
            } else {
                res.status(200).send(updatedCardMetric);
            }
        } catch (err) {
            cardMetricsLogger.error('Error updating CardMetric information', { error: err });
            res.status(500).send({ message: 'Error updating CardMetric information', error: err });
        }
    } else {
        cardMetricsLogger.error('Error updating CardMetric information: CardMetric ID not provided');
        res.status(400).send({ message: 'Unable to find CardMetric ID' });
    }
};

/**
 * Deletes a CardMetric by its ID.
 *
 * @param {Request} req - The request object from Express, with `cardMetricId` in `req.params`.
 * @param {Response} res - The response object from Express to confirm deletion or report an error.
 * @returns {Promise<void>} The response with a success or error message after deletion.
 *
 * @example
 * // Expected `req.params`:
 * // {
 * //   "cardMetricId": "card-metric-id"
 * // }
 */
export const deleteCardMetric = async (req: Request, res: Response): Promise<void> => {
    const cardId = req.params.cardId;

    if (cardId) {
        try {
            const deletedCardMetric = await deleteCardMetricDB(cardId);
            if (!deletedCardMetric) {
                cardMetricsLogger.error('CardMetric not found');
                res.status(400).send({ message: 'Unable to find CardMetric' });
            } else {
                res.status(200).send(deletedCardMetric);
            }
        } catch (err) {
            cardMetricsLogger.error('Error deleting CardMetric', { error: err });
            res.status(500).send({ message: 'Error deleting CardMetric', error: err });
        }
    } else {
        cardMetricsLogger.error('Error deleting CardMetric: CardMetric ID not provided');
        res.status(400).send({ message: 'Unable to find CardMetric ID' });
    }
};

