import { v4 as uuidv4 } from 'uuid';
import {insertUser} from "../../../database";
const log = require('loglevel');
log.setDefaultLevel("INFO")

export const createUser = (req: any, res: any) => {
  log.info('Registering user')
  const user = {
    userId: uuidv4(),
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    businessName: req.body.businessName,
    email: req.body.email,
    password: req.body.password,
    profilePicture: req.body.profilePicture
  }
  
  insertUser(user)
    .then((res) => {
      log.info(`User successfully created!`);
      return res
    })
    .catch((err: any) => {
      log.error(err);
    })
  
  res.send(user)
}
