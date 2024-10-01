import {Request, Response} from 'express';
import generateContactCard from "../../../utils/generateContactCard";
import logger from '../../../logger/logger';
import {VCardData} from "../../../models/types";
import {createVCardDB, deleteVCardDB, updateVCardDB} from "../../../database";

const vCardLogger = logger.child({context:'vcardService'})

export const createVCard = async (req: Request, res: Response) => {
    let vCardData: VCardData = req.body

    let response = await createVCardDB(vCardData)
        .then((res)=>{
            return res
        })
        .catch((err: any) => {
            vCardLogger.error('Error inserting card information', { error: err });
            res.status(500).send({ message: 'Error inserting card information', error: err });
        })

    res.status(200).send(`Success!! VCard created: ${response}`);
}

export const getVCard = async (req: Request, res: Response) => {
    let ownerId = req.body.ownerId

    if(ownerId){
        //set content-type and disposition including desired filename
        res.set('Content-Type', `text/vcard; name="${req.body.ownerId}.vcf"`);
        res.set('Content-Disposition', `inline; filename="${req.body.ownerId}.vcf"`);

        let vCard = await generateContactCard(ownerId)
            .then((res)=>{
                return res
            })
            .catch((err: any) => {
                vCardLogger.error('Error retrieving card information', { error: err });
                res.status(500).send({ message: 'Error retrieving card information', error: err });
            })
        //send the response
        res.status(200).send(vCard);
    } else {
        vCardLogger.error('Error retrieving card information');
        res.status(500).send({message: 'Unable to find Id'})
    }
}

export const updateVCard = async (req: Request, res: Response) => {
    let ownerId = req.body.ownerId
    let cardToBeUpdated = req.body

    if(ownerId) {
        let updatedVCard = await updateVCardDB(ownerId, cardToBeUpdated)
            .then((res)=> {
                return res
            })
            .catch((err: any) => {
                vCardLogger.error('Error retrieving card information', { error: err });
                res.status(500).send({ message: 'Error retrieving card information', error: err });
            })

        res.status(200).send(updatedVCard)
    } else {
        vCardLogger.error('Error retrieving card information');
        res.status(500).send({message: 'Unable to find Id'})
    }

}

export const deleteVCard = async (req: Request, res: Response) => {
    let ownerId = req.body.ownerId
    if(ownerId) {
        let deletedVCard = await deleteVCardDB(ownerId)
            .then((res)=> {
                return res
            })
            .catch((err: any) => {
                vCardLogger.error('Error retrieving card information', { error: err });
                res.status(500).send({ message: 'Error retrieving card information', error: err });
            })

        res.status(200).send(deletedVCard)
    } else {
        vCardLogger.error('Error retrieving card information');
        res.status(500).send({message: 'Unable to find Id'})
    }
}