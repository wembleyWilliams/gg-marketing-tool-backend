import {createBusiness, deleteBusiness, getBusiness, updateBusiness} from "./routes";
const log = require('loglevel');
log.setDefaultLevel("INFO")
const express = require('express')
const business = express.Router()

business.get('/:businessId', getBusiness)

business.post('/update/:businessId', updateBusiness)

business.post('/create', createBusiness)

business.delete('/delete/:businessId', deleteBusiness)

export default business;