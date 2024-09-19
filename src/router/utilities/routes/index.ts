import log from 'loglevel';
import {Request, Response} from 'express';
import generateContactCard from "../../../utils/generateContactCard";

log.setDefaultLevel("INFO")

export const getVCard = async (req: Request, res: Response) => {

    let vCard = await generateContactCard(req.body.userId)
        .then((res)=>{
            return res
            })

    //set content-type and disposition including desired filename
    res.set('Content-Type', `text/vcard; name="${req.body.userId}.vcf"`);
    res.set('Content-Disposition', `inline; filename="${req.body.userId}.vcf"`);

    //send the response
    console.log('Sending VCard')
    console.log(vCard)
    res.send(vCard);
}