import {getVCard} from "./routes";
const log = require('loglevel');
log.setDefaultLevel("INFO")
const express = require('express')
const utility = express.Router()

utility.post('/contact-card', getVCard)

export default utility;