import {
    createCard, getCard, updateCard, deleteCard, aggregateCardData,
} from '../index';

const express = require('express')
const card = express.Router()

card.post('/create', createCard)

card.delete('/delete/:cardId', deleteCard)

card.put('/update/:cardId', updateCard)

card.get('/:identifier', getCard)

card.get('/info/:cardId', aggregateCardData)


card.put('/incrementTap/:cardId',(req: any, res: any, next: any) => {
    const {incrementTap} = require('../index');
    return incrementTap(req, res, next)
})

// card.put('/toggle/:cardId',toggleCard)

export default card;