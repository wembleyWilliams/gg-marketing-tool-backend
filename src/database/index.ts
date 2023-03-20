import log from 'loglevel';
import {ObjectId} from "mongodb";
import {User, Business, businessHandle, Logo} from "../common/types";
import {data} from "cheerio/lib/api/attributes";

log.setDefaultLevel("INFO")
const MongoClient = require('mongodb').MongoClient;

// const uri = `mongodb+srv://businessAdmin:sOhtbQfLAk@gg-business-database.gn1zj.mongodb.net/business-database?retryWrites=true&w=majority`;
// const uri = `mongodb://businessAdmin:sOhtbQfLAk@gg-business-database-shard-00-00.gn1zj.mongodb.net:27017,gg-business-database-shard-00-01.gn1zj.mongodb.net:27017,gg-business-database-shard-00-02.gn1zj.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-jd39z0-shard-0&authSource=admin&retryWrites=true&w=majority`

const uri = `mongodb+srv://dbAdmin:mt130nSfBUP7Rcre@cluster0.ucpoax2.mongodb.net/?retryWrites=true&w=majority`

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
          .findOne({'email': email})
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
              {$push: {"businessHandles": addedHandle}})
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

export const updateLogo = async (businessId: string, logo: any) => {
  const client = new MongoClient(encodeURI(uri),
    {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  log.info("Connecting to Database")
  let updatedLogo =
    await client.connect()
      .then(() => {
        log.info("Database connected")
        log.info("Attempting to update user logo")
        return client.db("business-database")
      })
      .then(async (db: any) => {
        let updatedLogoDocument =
        await db.collection("business-information")
          .updateOne(
            {"_id": {$ne: `${new ObjectId(businessId)}`}},
            {
              $set: {
                "logo": {
                  "mime": logo.mime, "data": logo.data
                }
              }
            },
            {"upsert": false})
        return updatedLogoDocument
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
  
  return updatedLogo;
}

export const retrieveBusiness = async (businessId: string) => {
    const client = new MongoClient(uri,
        {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

  // try {
  //     log.info("Connecting to Database")
  //     log.info("Database connected")
  //     log.info("Attempting to retrieve document")
  //     const database = client.db("Kratos")
  //     const businesses = database.collection("Business-Information")
  //     const retrievedBusiness = await businesses.findOne({_id: new ObjectId(businessId)})
  //     console.log(retrievedBusiness)
  // } finally {
  //       await client.close();
  //   }




  let retrievedBusiness =
    client.connect()
      .then(() => {
        log.info("Database connected")
        log.info("Attempting to retrieve document")
        return client.db("Kratos").collection("Business-Information");
      })
      .then((db: any) => {
        const info = db.findOne({_id: new ObjectId(businessId)})
          return info;
      })
      .then((res: any) => {
          console.log(res)
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

// import { MongoClient } from "mongodb";
//
// // Replace the uri string with your MongoDB deployment's connection string.
// const uri = "<connection string uri>";
//
// const client = new MongoClient(uri);
//
// interface IMDB {
//     rating: number;
//     votes: number;
//     id: number;
// }
//
// export interface Movie {
//     title: string;
//     year: number;
//     released: Date;
//     plot: string;
//     type: "movie" | "series";
//     imdb: IMDB;
// }
//
// type MovieSummary = Pick<Movie, "title" | "imdb">;
//
// async function run(): Promise<void> {
//     try {
//         const database = client.db("sample_mflix");
//         // Specifying a Schema is always optional, but it enables type hinting on
//         // finds and inserts
//         const movies = database.collection<Movie>("movies");
//
//         const movie = await movies.findOne<MovieSummary>(
//             { title: "The Room" },
//             {
//                 sort: { rating: -1 },
//                 projection: { _id: 0, title: 1, imdb: 1 },
//             }
//         );
//         console.log(movie);
//     } finally {
//         await client.close();
//     }
// }
// run().catch(console.dir);


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