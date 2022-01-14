import {v4 as uuidv4} from 'uuid';
import {findUser, insertUser} from "../../../database";

const passport = require("passport")


//Logging
const log = require('loglevel');
log.setDefaultLevel("INFO")

export const loginUser = (req: any, res: any, next: any) => {
  log.info('Logging in user')
  
  passport.authenticate('local',
    (err: any, user: any, info: any) => {
      if (err) {
        res.status(401).send(err);
      } else if (!user) {
        res.status(401).send(info);
      } else {
        res.status(200).send(user)
        next();
      }
    })(req, res, next)
  
}

export const retrieveUser = (req: any, res: any) => {
  const user = {
    email: req.body.email
  }
  
  findUser(user.email)
    .then((user) => {
      if (user) {
        res.send(user)
      } else {
        log.info('No user found')
        res.send('No user found')
      }
    })
    .catch((err: any) => {
      log.error(err)
    })
}

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
