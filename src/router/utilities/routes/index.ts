import {Request, Response} from 'express';
import generateContactCard from "../../../utils/generateContactCard";
import logger from '../../../logger/logger';

const vCardLogger = logger.child({context:'vcardService'})

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