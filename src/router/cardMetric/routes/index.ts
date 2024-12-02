import {createCardMetric, deleteCardMetric, getCardMetric, updateCardMetric} from "../index";

const express = require('express')
const metric = express.Router()

metric.post('/create', createCardMetric)

metric.get('/:cardId', getCardMetric)

metric.get('/id/:cardMetricId', getCardMetric)

metric.put('/update/:cardId', updateCardMetric)

metric.delete('/delete/:cardId', deleteCardMetric)

export default metric;

