import {
    createCard,
    getCard,
    updateCard,
    deleteCard,
    aggregateCardData,
    claimDevice,
    deactivateCard,
    removeCard,
    getCardIdentifier, toggleCard,
} from '../index';

const express = require('express');
const card = express.Router();

/**
 * Express router for card-related operations.
 * @module CardRouter
 * @description Handles all card-related CRUD operations and additional card functionality.
 */

/**
 * Route to create a new card.
 * @name POST /create
 * @function
 * @memberof module:CardRouter
 * @inner
 * @param {string} path - Express path
 * @param {function} middleware - createCard handler
 * @see {@link module:cardsService.createCard} for implementation details
 */
card.post('/create', createCard);

/**
 * Route to delete a card by ID.
 * @name DELETE /delete/:cardId
 * @function
 * @memberof module:CardRouter
 * @inner
 * @param {string} path - Express path with cardId parameter
 * @param {function} middleware - deleteCard handler
 * @param {string} req.params.cardId - The ID of the card to delete
 * @see {@link module:cardsService.deleteCard} for implementation details
 */
card.delete('/delete/:cardId', deleteCard);

/**
 * Route to update a card by ID.
 * @name PUT /update/:cardId
 * @function
 * @memberof module:CardRouter
 * @inner
 * @param {string} path - Express path with cardId parameter
 * @param {function} middleware - updateCard handler
 * @param {string} req.params.cardId - The ID of the card to update
 * @see {@link module:cardsService.updateCard} for implementation details
 */
card.put('/update/:cardId', updateCard);

/**
 * Route to get a card by identifier.
 * @name GET /:identifier
 * @function
 * @memberof module:CardRouter
 * @inner
 * @param {string} path - Express path with identifier parameter
 * @param {function} middleware - getCard handler
 * @param {string} req.params.identifier - The unique identifier of the card
 * @see {@link module:cardsService.getCard} for implementation details
 */
card.get('/:identifier', getCard);

/**
 * Route to get aggregated card data by identifier.
 * @name GET /info/:identifier
 * @function
 * @memberof module:CardRouter
 * @inner
 * @param {string} path - Express path with identifier parameter
 * @param {function} middleware - aggregateCardData handler
 * @param {string} req.params.identifier - The unique identifier of the card
 * @see {@link module:cardsService.aggregateCardData} for implementation details
 */
card.get('/info/:identifier', aggregateCardData);

/**
 * Route to increment tap count for a card.
 * @name PUT /incrementTap/:identifier/:source?
 * @function
 * @memberof module:CardRouter
 * @inner
 * @param {string} path - Express path with identifier and optional source parameters
 * @param {function} middleware - incrementTap handler
 * @param {string} req.params.identifier - The unique identifier of the card
 * @param {string} [req.params.source] - Optional source of the tap (e.g., 'admin')
 * @see {@link module:cardsService.incrementTap} for implementation details
 */
card.put('/incrementTap/:identifier/:source?', (req: any, res: any, next: any) => {
    const {incrementTap} = require('../index');
    return incrementTap(req, res, next);
});

card.post('/claim-device', claimDevice);
card.post('/toggle-device', toggleCard);
card.post('/remove-device', removeCard);
card.post('/get-identifier', getCardIdentifier)

// Currently commented out toggle route
// card.put('/toggle/:cardId', toggleCard)

export default card;