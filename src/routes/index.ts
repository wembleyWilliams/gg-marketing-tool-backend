import {createBusiness, removeBusiness, retrieveBusiness} from "../database";

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

router.post('/find/business', (req: any, res: any) => {
    let businessId = req.body.businessId;
    retrieveBusiness(businessId)
        .then((retrievedBusiness: any)=>{
            res.send(retrievedBusiness)
            log.info(`Business document retrieved ${retrievedBusiness._id}`)
        })
})

router.post('/create/business', (req: any, res: any) => {
    log.info("Creating business data");
    createBusiness(req.body)
        .then((value) => {
        log.info(`Business document successfully created! ${value}`);
        res.send(value);
    })
})

router.delete('/delete/business', (req: any, res: any) => {
    let businessId = req.body.businessId;
    log.info("Deleting business data");
    removeBusiness(businessId)
        .then((value) => {
            log.info(`Business document successfully removed! ${value}`);
            res.send(value);
        })
    
})

router.post('/update/business', (req: any, res: any) => {
    let businessId = req.body.businessId;
    log.info("Missing implementation")
})

export default router