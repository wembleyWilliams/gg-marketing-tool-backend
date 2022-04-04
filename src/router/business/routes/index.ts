import {insertBusiness, removeBusiness, retrieveBusiness, updateLogo, updateSocialHandles} from "../../../database";
import log from 'loglevel';

log.setDefaultLevel("INFO")


export const deleteBusiness = (req: any, res: any) => {
  let businessId = req.params.businessId;
  log.info("Deleting business data");
  removeBusiness(businessId)
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
  insertBusiness(req.body)
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
  retrieveBusiness(businessId)
    .then((retrievedBusiness: any) => {
      res.status(200).send(retrievedBusiness)
      log.info(`Business document retrieved ${retrievedBusiness._id}`)
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
  
  updateSocialHandles(businessId,businessHandle)
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
  
  updateLogo(businessId, logo)
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