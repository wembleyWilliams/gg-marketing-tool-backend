const log = require('loglevel');
log.setDefaultLevel("INFO")
const express = require('express')
const router = express.Router()

const user = require('./user')
const business = require('./business')

router.use(function timeLog(req: any, res: any, next: any) {
    const currentdate = new Date();
    const datetime = "Log Time: " + currentdate.getDate() + "/"
        + (currentdate.getMonth() + 1) + "/"
        + currentdate.getFullYear() + " @ "
        + currentdate.getHours() + ":"
        + currentdate.getMinutes() + ":"
        + currentdate.getSeconds();
    log.info(datetime)
    next();
});

router.use('/user', ()=>{});
router.use('/business', ()=>{});

export default router;