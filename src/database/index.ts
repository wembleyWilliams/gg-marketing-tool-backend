import log from 'loglevel';
import {ObjectId} from "mongodb";
import {User, Business} from "../common/types";

log.setDefaultLevel("INFO")
const MongoClient = require('mongodb').MongoClient;

const uri = `mongodb+srv://businessAdmin:sOhtbQfLAk@gg-business-database.gn1zj.mongodb.net/business-database?retryWrites=true&w=majority`;

export const insertUser = async (user: User) => {
  const client = new MongoClient(encodeURI(uri),
    {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  let createdUser
  log.info("Connecting to Database")
  createdUser =
    client.connect()
      .then(()=>{
        log.info("Database connected")
        log.info("Attempting to add user record")
        return client.db("business-database")
      })
      .then((db: any) => {
        return db.collection("users")
                .insertOne(user)
      })
      .then((res: any) => {
        return res;
      })
      .catch((err: any) => {
        log.error(`Error connecting to database => ${err}`);
      })
      .finally(() => {
        client.close();
      });
  
  return createdUser;
}

export const insertBusiness = async (businessDetails: Business) => {
  const client = new MongoClient(encodeURI(uri),
    {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  let createdBusiness
  log.info("Connecting to Database")
  createdBusiness =
    client.connect()
      .then(() => {
        log.info("Database connected")
        log.info("Attempting to add business record")
        return client.db("business-database")
      })
      .then((db: any) => {
        return db.collection("business-information")
          .insertOne(businessDetails)
      })
      .then((res: any) => {
        return res;
      })
      .catch((err: any) => {
        log.error(`Error connecting to database => ${err}`);
      })
      .finally(() => {
        client.close();
      });
  return createdBusiness;
}

export const retrieveBusiness = async (businessId: string) => {
  const client = new MongoClient(uri,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  let retrievedBusiness;
  
  log.info("Connecting to Database")
  retrievedBusiness =
    client.connect()
      .then(() => {
        log.info("Database connected")
        log.info("Attempting to retrieve document")
        return client.db("business-database");
      })
      .then((db: any) => {
        return db.collection("business-information")
          .findOne({_id: new ObjectId(businessId)})
      })
      .then((res: any) => {
        return res;
      })
      .catch((err: any) => {
        log.error(`Error connecting to database ${err}`)
      })
      .finally(() => {
        client.close();
      });
  
  return retrievedBusiness;
}

export const removeBusiness = async (businessId: string) => {
  const client = new MongoClient(uri,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  let retrievedBusiness;
  
  log.info("Connecting to Database")
  retrievedBusiness =
    client.connect()
      .then(() => {
        log.info("Database connected")
        log.info("Attempting to retrieve document")
        return client.db("business-database");
      })
      .then((db: any) => {
        return db.collection("business-information")
          .deleteOne({_id: new ObjectId(businessId)})
      })
      .then((res: any) => {
        return res;
      })
      .catch((err: any) => {
        log.error(`Error connecting to database ${err}`)
      })
      .finally(() => {
        client.close();
      });
  return retrievedBusiness;
}