import {
    createBusiness,
    deleteBusiness,
    getBusiness,
    getBusinessByUserId,
    updateBusiness,
    updateBusinessLogo
} from "../index";

const express = require('express')
const business = express.Router()

business.get('/:businessId', getBusiness)

business.get('/user/:userId', getBusinessByUserId)

business.post('/update/:businessId', updateBusiness)

business.post('/create', createBusiness)

business.delete('/delete/:businessId', deleteBusiness)

business.post('/update/logo/:businessId', updateBusinessLogo)

export default business;