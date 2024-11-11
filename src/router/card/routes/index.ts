import {Request, Response} from 'express';
import logger from '../../../logger/logger';
import {createCardDB, deleteCardDB, getCardByIdDB, updateCardDB} from "../../../database";


const cardsLogger = logger.child({context: 'cardsService'});

export const createCard = async (req: Request, res: Response) => {
    const cardData = req.body;
    try {
        const response = await createCardDB(cardData);
        res.status(200).send(`Success! Card created: Card created successfully`);
        return res;
    } catch (err: any) {
        cardsLogger.error('Error inserting card information', {error: err});
        res.status(500).send({message: 'Error inserting card information', error: err});
    }
};

export const getCard = async (req: Request, res: Response) => {
    const cardId = req.params.cardId;
    if (cardId) {
        const card = await getCardByIdDB(cardId)
            .then((result) => {
                if (!result) {
                    cardsLogger.error('Card not found')
                    res.status(400).send({message: 'Unable to find card'})
                } else return result
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

export const updateCard = async (req: Request, res: Response) => {
    const cardId = req.params.cardId;
    const updatedCardData = req.body;

    if (cardId) {
        try {
            const updatedCard = await updateCardDB(cardId, updatedCardData)
            if (!updatedCard) {
                cardsLogger.error('Card not found')
                res.status(400).send({message: 'Unable to find card'})
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

export const deleteCard = async (req: Request, res: Response) => {
    const cardId = req.params.cardId;

    if (cardId) {

        try {
            const deletedCard = await deleteCardDB(cardId)
            if(!deletedCard){
                cardsLogger.error('Card not found')
                res.status(400).send({message: 'Unable to find card'})
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


