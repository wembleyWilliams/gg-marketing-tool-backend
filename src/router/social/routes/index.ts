import {createSocial, deleteSocial, getSocial, getSocialByUserId, updateSocial} from "../index";

const express = require('express')
const social = express.Router()

social.get('/:socialId', getSocial)

social.get('/id/:userId', getSocialByUserId)

social.post('/update/:socialId', updateSocial)

social.post('/create', createSocial)

social.delete('/delete/:businessId', deleteSocial)

export default social;