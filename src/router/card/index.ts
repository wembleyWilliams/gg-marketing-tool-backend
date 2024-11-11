import {createCard, getCard, updateCard, deleteCard} from './routes';

const express = require('express')
const card = express.Router()

card.post('/create', createCard)

card.delete('/delete/:cardId', deleteCard)

card.put('/update/:cardId', updateCard)

card.get('/info/:cardId', getCard)

export default card;