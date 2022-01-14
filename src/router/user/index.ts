import {createUser, loginUser, retrieveUser} from "./routes";
const log = require('loglevel');
log.setDefaultLevel("INFO")
const express = require('express')
const user = express.Router()

user.post('/auth/signup',createUser)
user.post('/auth/login',loginUser)
user.post('/find', retrieveUser)

export default user