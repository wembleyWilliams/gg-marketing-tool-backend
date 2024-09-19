import {createBusinessDB, deleteBusinessDB, getBusinessByIdDB, updateLogoDB, updateSocialHandlesDB} from "../../../database";
import log from 'loglevel';

log.setDefaultLevel("INFO")


export const deleteBusiness = (req: any, res: any) => {
  let businessId = req.params.businessId;
  log.info("Deleting business data");
  deleteBusinessDB(businessId)
    .then((value) => {
      log.info(`Business document successfully removed! ${value}`);
      res.status(200).send(value);
    })
    .catch((err: any) => {
      log.error(err)
    })
  
}

export const createBusiness = (req: any, res: any) => {
  log.info("Creating business data");
  createBusinessDB(req.body)
    .then((value) => {
      log.info(`Business document successfully created! ${value}`);
      res.status(200).send(value);
    })
    .catch((err: any) => {
      log.error(err)
    })
}

export const getBusiness = (req: any, res: any) => {
  log.info("Retrieving business data")
  let businessId = req.params.businessId;
  //TODO: ACTIVATE SCRAPE HERE
  getBusinessByIdDB(businessId)
    .then((retrievedBusiness: any) => {
      res.status(200).send(retrievedBusiness)
      retrievedBusiness ? log.info(`Business document retrieved ${retrievedBusiness._id}`) : log.info('No business document retrieved')
    })
    .catch((err: any) => {
      log.error(err)
    })
}

export const modifyBusiness = (req: any, res: any) => {
  let businessId = req.params.businessId;
  let businessHandle = req.body.handle;
  // log.info("Missing implementation")
  // res.status(200).send("Missing implementation");
  
  updateSocialHandlesDB(businessId,businessHandle)
    .then((updatedBusiness: any) => {
      res.status(200).send(updatedBusiness)
    })
    .catch((err: any) => {
      log.error(err)
    })
}

export const updateBusinessLogo = (req: any, res: any) => {
  let businessId = req.params.businessId;
  let logo = req.body;
  
  updateLogoDB(businessId, logo)
    .then((updatedLogo: any) => {
      if (updatedLogo.modifiedCount > 0) {
        log.info("Logo Document updated");
        res.status(200).send("Logo Document updated")
      } else {
        res.status(502).send("Logo Document not updated")
        log.info("Logo Document not updated")
      }
      
    })
    .catch((err: any) => {
      log.error(err)
    })
}

