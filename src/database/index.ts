import log from 'loglevel';
import {ObjectId} from "mongodb";
import {User, Business, businessHandle} from "../common/types";

log.setDefaultLevel("INFO")
const MongoClient = require('mongodb').MongoClient;

// const uri = `mongodb+srv://businessAdmin:sOhtbQfLAk@gg-business-database.gn1zj.mongodb.net/business-database?retryWrites=true&w=majority`;
const uri = `mongodb://businessAdmin:sOhtbQfLAk@gg-business-database-shard-00-00.gn1zj.mongodb.net:27017,gg-business-database-shard-00-01.gn1zj.mongodb.net:27017,gg-business-database-shard-00-02.gn1zj.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-jd39z0-shard-0&authSource=admin&retryWrites=true&w=majority`

export const findUser = async (email: string) => {
  const client = new MongoClient(encodeURI(uri),
    {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  
  let retrievedUser
  log.info("Connecting to Database")
  retrievedUser =
    await client.connect()
      .then(() => {
        log.info("Database connected")
        log.info("Attempting to find user record")
        return client.db("business-database")
      })
      .then((db: any) => {
        return db
          .collection("users")
          .findOne({'email': email })
      })
      .then((res: any) => {
        log.info("User found")
        return res;
      })
      .catch((err: any) => {
        log.error(`Error connecting to database => ${err}`);
        return err;
      })
      .finally(() => {
        client.close();
      });
  return retrievedUser;
}

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
      .then(() => {
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

export const updateSocialHandles = async (businessId: string, addedHandle: businessHandle) => {
  const client = new MongoClient(uri,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  
  let updatedBusiness;
  
  log.info("Connecting to Database")
  updatedBusiness =
    client.connect()
      .then(() => {
        log.info("Database connected")
        log.info("Attempting to update social media handles")
        return client.db("business-database");
      })
      .then(async (db: any) => {
        let updatedDocument =
          await db.collection("business-information")
          .updateOne({"_id": {$ne: `${new ObjectId(businessId)}`}},
            { $push: { "businessHandles": addedHandle }})
        log.info("Document updated");
        log.info(updatedDocument)
        return updatedDocument
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
  
  return updatedBusiness;
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