import {createUser} from "./routes";
const log = require('loglevel');
log.setDefaultLevel("INFO")
const express = require('express')
const user = express.Router()

user.post('/signup',createUser)

export default user