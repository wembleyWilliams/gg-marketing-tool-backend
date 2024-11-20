import {createVCard, deleteVCard, getVCard, updateVCard} from "../index";

const express = require('express')
const utility = express.Router()

utility.delete('/contact-card/delete', deleteVCard)

utility.post('/contact-card/create', createVCard)

utility.put('/contact-card/update', updateVCard)

utility.post('/contact-card', getVCard)


export default utility;