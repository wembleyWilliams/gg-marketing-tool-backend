import log from 'loglevel';
import {ObjectId} from "mongodb";
import {BusinessData, UserData, VCardData} from "../models/types";

log.setDefaultLevel("INFO")
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()

const uri = process.env.MONGODB_URI? process.env.MONGODB_URI:''
/**
 * Creates a new business in the database.
 *
 * @param {BusinessData} businessDetails - The business details to add.
 * @returns {Promise<Object>} - The newly created business record.
 */
export const createBusinessDB = async (businessDetails: BusinessData) => {
    const client = new MongoClient(encodeURI(uri), {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });

    let createdBusiness;
    log.info("Connecting to Database");

    createdBusiness = client.connect()
        .then(() => {
            log.info("Database connected");
            log.info("Attempting to add business record");
            return client.db("athenadb");
        })
        .then((db: any) => {
            return db.collection("businesses").insertOne(businessDetails);
        })
        .finally(() => {
            client.close();
            log.info("Database connection closed");
        });

    return createdBusiness;
};

/**
 * Updates a business record in the database.
 *
 * @param {ObjectId} id - The ID of the business to update.
 * @param {Partial<BusinessData>} updateDetails - The details to update.
 * @returns {Promise<Object>} - The updated business record.
 */
export const updateBusinessDB = async (id: ObjectId, updateDetails: Partial<BusinessData>) => {
    const client = new MongoClient(encodeURI(uri), {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });

    let updatedBusiness;
    log.info("Connecting to Database");

    updatedBusiness = client.connect()
        .then(() => {
            log.info("Database connected");
            log.info("Attempting to update business record");
            return client.db("athenadb");
        })
        .then((db: any) => {
            return db.collection("businesses").updateOne({ _id: id }, { $set: updateDetails });
        })
        .finally(() => {
            client.close();
            log.info("Database connection closed");
        });

    return updatedBusiness;
};

/**
 * Deletes a business record from the database.
 *
 * @param {ObjectId} id - The ID of the business to delete.
 * @returns {Promise<Object>} - The result of the deletion operation.
 */
export const deleteBusinessDB = async (id: ObjectId) => {
    const client = new MongoClient(encodeURI(uri), {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });

    let deleteResult;
    log.info("Connecting to Database");

    deleteResult = client.connect()
        .then(() => {
            log.info("Database connected");
            log.info("Attempting to delete business record");
            return client.db("athenadb");
        })
        .then((db: any) => {
            return db.collection("businesses").deleteOne({ _id: id });
        })
        .finally(() => {
            client.close();
            log.info("Database connection closed");
        });

    return deleteResult;
}

/**
 * Updates the social media handles for a business in the database.
 *
 * @param {string} businessId - The ID of the business to update.
 * @param {any} addedHandle - The social media handle to be added.
 * @returns {Promise<any>} The updated business document.
 */
export const updateSocialHandlesDB = async (businessId: string, addedHandle: any): Promise<any> => {
    const client = new MongoClient(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });

    let updatedBusiness;

    log.info("Connecting to Database");

    updatedBusiness = client.connect()
        .then(() => {
            log.info("Database connected");
            log.info("Attempting to update social media handles");
            return client.db("athenadb");
        })
        .then(async (db: any) => {
            let updatedDocument = await db.collection("businesses")
                .updateOne({ "_id": { $ne: `${new ObjectId(businessId)}` } }, { $push: { "businessHandles": addedHandle } });

            log.info("Document updated");
            log.info(updatedDocument);
            return updatedDocument;
        })
        .then((res: any) => {
            return res;
        })
        .catch((err: any) => {
            log.error(`Error connecting to database: ${err}`);
        })
        .finally(() => {
            client.close();
        });

    return updatedBusiness;
};

/**
 * Updates the logo for a business in the database.
 *
 * @param {string} businessId - The ID of the business to update.
 * @param {any} logo - The new logo object containing mime type and data.
 * @returns {Promise<any>} The updated business document.
 */
export const updateLogoDB = async (businessId: string, logo: any): Promise<any> => {
    const client = new MongoClient(encodeURI(uri), {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });

    log.info("Connecting to Database");

    return await client.connect()
        .then(() => {
            log.info("Database connected");
            log.info("Attempting to update user logo");
            return client.db("athenadb");
        })
        .then(async (db: any) => {
            return await db.collection("businesses")
                .updateOne(
                    { "_id": { $ne: `${new ObjectId(businessId)}` } },
                    {
                        $set: {
                            "logo": {
                                "mime": logo.mime,
                                "data": logo.data
                            }
                        }
                    },
                    { "upsert": false }
                );
        })
        .then((res: any) => {
            return res;
        })
        .catch((err: any) => {
            log.error(`Error connecting to database: ${err}`);
        })
        .finally(() => {
            client.close();
        });
};

/**
 * Retrieve a business record by id from the database.
 *
 * @returns {Promise<Object>} - The result of the read operation.
 * @param businessId - The ID of the business to retrieve.
 */
export const getBusinessByIdDB = async (businessId: string): Promise<object> => {
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
        return client.db("athenadb");
      })
      .then((db: any) => {
        return db.collection("businesses")
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

// CREATE VCard (POST)
/**
 * Inserts a new VCard into the MongoDB database.
 * @param vCardData The VCard object to be inserted.
 */
export const createVCardDB = async (vCardData: VCardData) => {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
        log.info("Connecting to Database");
        await client.connect();
        const db = client.db('athenadb');

        const result = await db.collection('vcards').insertOne(vCardData);
        log.info('VCard created:', result);
        return result;
    } catch (error) {
        log.error({ message: 'Error creating VCard', error });
        return null;
    } finally {
        await client.close();
        log.info("Connection closed");
    }
};

// READ VCard by ID (GET)
/**
 * Retrieves a VCard by its ID from the MongoDB database.
 * @param vCardId The ID of the VCard to be retrieved.
 */
export const getVCardByIdDB = async (vCardId: string) => {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
        log.info("Connecting to Database");
        await client.connect();
        const db = client.db('athenadb');

        const vCard = await db.collection('vcards').findOne({ "_id": new ObjectId(vCardId) });
        log.info('VCard found:', vCard);
        return vCard;
    } catch (error) {
        log.error({ message: 'Error retrieving VCard', error });
        return null;
    } finally {
        await client.close();
        log.info("Connection closed");
    }
};

// UPDATE VCard by ID (PUT)
/**
 * Updates a VCard in the MongoDB database by its ID.
 * @param vCardId The ID of the VCard to be updated.
 * @param updatedVCard The VCard object containing the new data to be set.
 */
export const updateVCardDB = async (vCardId: string, updatedVCard: Partial<VCardData>) => {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
        log.info("Connecting to Database");
        await client.connect();
        const db = client.db('athenadb');

        const result = await db.collection('vcards').updateOne(
            { "_id": new ObjectId(vCardId) },
            { $set: updatedVCard },
            { upsert: false }
        );
        log.info('VCard updated:', result);
        return result;
    } catch (error) {
        log.error({ message: 'Error updating VCard', error });
        return null;
    } finally {
        await client.close();
        log.info("Connection closed");
    }
};

// DELETE VCard by ID (DELETE)
/**
 * Deletes a VCard from the MongoDB database by its ID.
 * @param vCardId The ID of the VCard to be deleted.
 */
export const deleteVCardDB = async (vCardId: string) => {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
        log.info("Connecting to Database");
        await client.connect();
        const db = client.db('athenadb');

        const result = await db.collection('vcards').deleteOne({ "_id": new ObjectId(vCardId) });
        log.info('VCard deleted:', result);
        return result;
    } catch (error) {
        log.error({ message: 'Error deleting VCard', error });
        return null;
    } finally {
        await client.close();
        log.info("Connection closed");
    }
};

// LIST all VCards (GET)
/**
 * Retrieves all VCARDs from the MongoDB database.
 */
export const listVCardsDB = async () => {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
        log.info("Connecting to Database");
        await client.connect();
        const db = client.db('athenadb');

        const vCards = await db.collection('vcards').find().toArray();
        log.info('VCards found:', vCards);
        return vCards;
    } catch (error) {
        log.error({ message: 'Error listing VCARDs', error });
        return null;
    } finally {
        await client.close();
        log.info("Connection closed");
    }
};


// CREATE User (POST)
/**
 * Creates a new user in the MongoDB database.
 * @param newUser The User object to be created.
 */
export const createUserDB = async (newUser: UserData) => {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        console.log("Connecting to Database");
        await client.connect();
        const db = client.db('athenadb');

        newUser.createdAt = new Date();  // Set creation date
        newUser.updatedAt = new Date();  // Set update date

        const result = await db.collection('users').insertOne(newUser);
        console.log('User created:', result);
        return result;

    } catch (error) {
        console.error({ message: 'Error creating User', error });
        return null;
    } finally {
        await client.close();
        console.log("Connection closed");
    }
};

// READ User by ID (GET)
/**
 * Retrieves a user by their ID from the MongoDB database.
 * @param userId The ID of the user to be retrieved.
 */
export const getUserByIdDB = async (userId: string) => {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        console.log("Connecting to Database");
        await client.connect();
        const db = client.db('athenadb');

        const user = await db.collection('users').findOne({ "_id": new ObjectId(userId) });
        console.log('User found:', user);
        return user;

    } catch (error) {
        console.error({ message: 'Error retrieving User', error });
        return null;
    } finally {
        await client.close();
        console.log("Connection closed");
    }
};

// READ User by email (GET)
/**
 * Retrieves a user by their ID from the MongoDB database.
 * @param userEmail The email of the user to be retrieved.
 */
export const getUserByEmailDB = async (userEmail: string) => {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        console.log("Connecting to Database");
        await client.connect();
        const db = client.db('athenadb');

        const user = await db.collection('users').findOne({ "email": userEmail });
        console.log('User found:', user);
        return user;

    } catch (error) {
        console.error({ message: 'Error retrieving User', error });
        return null;
    } finally {
        await client.close();
        console.log("Connection closed");
    }
};

// UPDATE User by ID (PUT)
/**
 * Updates a user in the MongoDB database by their ID.
 * @param userId The ID of the user to be updated.
 * @param updatedUser The User object containing the new data to be set.
 */
export const updateUserDB = async (userId: string, updatedUser: Partial<UserData>) => {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        console.log("Connecting to Database");
        await client.connect();
        const db = client.db('athenadb');

        updatedUser.updatedAt = new Date();  // Update the update timestamp

        const result = await db.collection('users').updateOne(
            { "_id": new ObjectId(userId) },
            {
                $set: updatedUser
            },
            { "upsert": false }
        );

        console.log('User updated:', result);
        return result;

    } catch (error) {
        console.error({ message: 'Error updating User', error });
        return null;
    } finally {
        await client.close();
        console.log("Connection closed");
    }
};

// DELETE User by ID (DELETE)
/**
 * Deletes a user from the MongoDB database by their ID.
 * @param userId The ID of the user to be deleted.
 */
export const deleteUserDB = async (userId: string) => {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        console.log("Connecting to Database");
        await client.connect();
        const db = client.db('athenadb');

        const result = await db.collection('users').deleteOne({ "_id": new ObjectId(userId) });
        console.log('User deleted:', result);
        return result;

    } catch (error) {
        console.error({ message: 'Error deleting User', error });
        return null;
    } finally {
        await client.close();
        console.log("Connection closed");
    }
};

// LIST all Users (GET)
/**
 * Retrieves all users from the MongoDB database.
 */
export const listUsersDB = async () => {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        console.log("Connecting to Database");
        await client.connect();
        const db = client.db('athenadb');

        const users = await db.collection('users').find().toArray();
        console.log('Users found:', users);
        return users;

    } catch (error) {
        console.error({ message: 'Error listing Users', error });
        return null;
    } finally {
        await client.close();
        console.log("Connection closed");
    }
};

