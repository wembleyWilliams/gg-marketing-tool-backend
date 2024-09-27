import {getVCard} from "./routes";
const express = require('express')
const utility = express.Router()

utility.post('/contact-card', getVCard)

export default utility;