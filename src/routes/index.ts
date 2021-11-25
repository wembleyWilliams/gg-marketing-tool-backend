import {createBusiness, removeBusiness, retrieveBusiness} from "../database";
import bcrypt from 'bcrypt';
import {User} from "../common/types";

const log = require('loglevel');
log.setDefaultLevel("INFO")
var express = require('express')
var router = express.Router()

router.use(function timeLog(req: any, res: any, next: any) {
    var currentdate = new Date();
    var datetime = "Log Time: " + currentdate.getDate() + "/"
        + (currentdate.getMonth() + 1) + "/"
        + currentdate.getFullYear() + " @ "
        + currentdate.getHours() + ":"
        + currentdate.getMinutes() + ":"
        + currentdate.getSeconds();
    log.info(datetime)
    next();
});

router.get('/find/business/:businessId', (req: any, res: any) => {
    log.info("Retrieving business data")
    log.info(req)
    let businessId = req.params.businessId;
    //TODO: ACTIVATE SCRAPE HERE
    retrieveBusiness(businessId)
        .then((retrievedBusiness: any)=>{
            res.send(retrievedBusiness)
            log.info(`Business document retrieved ${retrievedBusiness._id}`)
        })
})

router.post('/create/business', (req: any, res: any) => {
    log.info("Creating business data");
    log.info(req)
    createBusiness(req.body)
        .then((value) => {
        log.info(`Business document successfully created! ${value}`);
        res.send(value);
    })
})

router.delete('/delete/business/:businessId', (req: any, res: any) => {
    let businessId = req.params.businessId;
    log.info("Deleting business data");
    removeBusiness(businessId)
        .then((value) => {
            log.info(`Business document successfully removed! ${value}`);
            res.send(value);
        })
    
})

router.post('/update/business/:businessId', (req: any, res: any) => {
    let businessId = req.params.businessId;
    log.info("Missing implementation")
})

export default router