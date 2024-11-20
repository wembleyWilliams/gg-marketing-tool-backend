import {createCard, getCard, updateCard, deleteCard, aggregateCardData} from '../index';

const express = require('express')
const card = express.Router()

card.post('/create', createCard)

card.delete('/delete/:cardId', deleteCard)

card.put('/update/:cardId', updateCard)

card.get('/:cardId', getCard)

card.get('/info/:cardId', aggregateCardData)

export default card;