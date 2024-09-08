import {createBusiness, deleteBusiness, getBusiness, modifyBusiness, updateBusinessLogo, getContactCard} from "./routes";
const log = require('loglevel');
log.setDefaultLevel("INFO")
const express = require('express')
const business = express.Router()

business.get('/:businessId', getBusiness)

business.post('/update/:businessId', modifyBusiness)

business.post('/create', createBusiness)

business.delete('/delete/:businessId', deleteBusiness)

business.post('/update/logo/:businessId', updateBusinessLogo)

business.post('/contact-card', getContactCard)

export default business;