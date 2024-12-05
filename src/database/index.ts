import logger from '../logger/logger';
import {ObjectId} from "mongodb";
import {BusinessData, UserData, VCardData, Card} from "../common/types";

const dbLogger = logger.child({context: 'databaseService'})
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()

const uri = process.env.MONGODB_URI as string;
const dbname = process.env.MONGODB_DB_NAME as string;

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

    try {
        dbLogger.info("Connecting to Database");
        await client.connect();
        dbLogger.info("Database connected, inserting business data");

        const db = client.db(dbname);
        const result = await db.collection("businesses").insertOne(businessDetails);
        dbLogger.info("Business successfully inserted");
        return result;
    } catch (error) {
        dbLogger.error({message: 'Error creating business', error});
        throw error;  // Re-throw the error after logging
    } finally {
        await client.close();
        dbLogger.info("Database connection closed");
    }
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

    try {
        dbLogger.info("Connecting to Database");
        await client.connect();
        const db = client.db(dbname);

        dbLogger.info("Updating business with ID:", id);
        const result = await db.collection("businesses").updateOne({_id: id}, {$set: updateDetails});

        dbLogger.info("Business updated:", result);
        return result;
    } catch (error) {
        dbLogger.error({message: 'Error updating business', error});
        throw error;
    } finally {
        await client.close();
        dbLogger.info("Database connection closed");
    }
};

/**
 * Deletes a business record from the database.
 *
 * @param {ObjectId} id - The ID of the business to delete.
 * @returns {Promise<Object>} - The result of the deletion operation.
 */
export const deleteBusinessDB = async (id: string) => {
    const client = new MongoClient(encodeURI(uri), {useNewUrlParser: true, useUnifiedTopology: true});

    dbLogger.info("Connecting to Database");
    const objectId = new ObjectId(id)

    try {
        dbLogger.info("Connecting to Database");
        await client.connect();
        dbLogger.info("Database connected, removing business data");

        const db = client.db(dbname);
        const result = await db.collection("businesses").deleteOne({_id: objectId});
        dbLogger.info("Business successfully removed");
        return result;
    } catch (error) {
        dbLogger.error({message: 'Error removing business', error});
        throw error;  // Re-throw the error after logging
    } finally {
        await client.close();
        dbLogger.info("Database connection closed");
    }
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

    dbLogger.info("Connecting to Database");

    updatedBusiness = client.connect()
        .then(() => {
            dbLogger.info("Database connected");
            dbLogger.info("Attempting to update social media handles");
            return client.db(dbname);
        })
        .then(async (db: any) => {
            let updatedDocument = await db.collection("businesses")
                .updateOne({"_id": {$ne: `${new ObjectId(businessId)}`}}, {$push: {"businessHandles": addedHandle}});

            dbLogger.info("Document updated");
            dbLogger.info(updatedDocument);
            return updatedDocument;
        })
        .then((res: any) => {
            return res;
        })
        .catch((err: any) => {
            dbLogger.error(`Error connecting to database: ${err}`);
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
    const client = new MongoClient(encodeURI(uri), {useNewUrlParser: true, useUnifiedTopology: true});

    dbLogger.info("Connecting to Database");

    try {
        dbLogger.info("Database connected");
        dbLogger.info("Attempting to update card logo");
        await client.connect();
        const db = await client.db(dbname)
        const result = await db.collection("businesses")
            .updateOne(
                {"_id": {$ne: `${new ObjectId(businessId)}`}},
                {
                    $set: {
                        "logo": {
                            "mime": logo.mime,
                            "data": logo.data
                        }
                    }
                },
                {"upsert": false}
            );
        if (result) {
            dbLogger.info('Business updated: ' + result._id);
            return result;
        } else {
            dbLogger.info('Business not found');
            // throw new Error('Business not found');
        }
    } catch (err) {
        dbLogger.error(`Error connecting to database: ${err}`);
        throw err
    } finally {
        await client.close()
        dbLogger.info("Database connection closed");
    }

};

/**
 * Retrieve a business record by id from the database.
 *
 * @param businessId - The ID of the business to retrieve.
 */
export const getBusinessByIdDB = async (businessId: string) => {
    const client = new MongoClient(uri,
        {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
    try {
        await client.connect();
        const db = client.db(dbname);
        const businessIdDB = new ObjectId(businessId);

        dbLogger.info("Database connected");
        dbLogger.info("Attempting to retrieve document");

        const result = await db.collection("businesses").findOne({_id: businessIdDB});

        if (result) {
            dbLogger.info('Business retrieved: ' + result._id);
            return result;
        } else {
            dbLogger.info('Business not found');
            new Error('Business not found');
        }
    } catch (err: any) {
        dbLogger.error(`Error occurred: ${err.message}`);
        throw err; // Ensure the error is propagated
    } finally {
        await client.close();
    }
}

/**
 * Retrieve a business record by user ID from the database.
 *
 * @param userId - The ID of the user whose business to retrieve.
 */
export const getBusinessByUserIdDB = async (userId: string) => {
    const client = new MongoClient(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });

    try {
        await client.connect();
        const db = client.db(dbname);
        // const userObjectId = new ObjectId(userId);

        dbLogger.info("Database connected");
        dbLogger.info("Attempting to retrieve document by user ID");

        const result = await db.collection("businesses").findOne({userId: userId});

        if (result) {
            dbLogger.info('Business retrieved: ' + result._id);
            return result;
        } else {
            dbLogger.info('Business not found');
            new Error('Business not found');
        }
    } catch (err: any) {
        dbLogger.error(`Error occurred: ${err.message}`);
        throw err; // Ensure the error is propagated
    } finally {
        await client.close();
    }
};

// CREATE VCard (POST)
/**
 * Inserts a new VCard into the MongoDB database.
 * @param vCardData The VCard object to be inserted.
 */
export const createVCardDB = async (vCardData: any) => {
    const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});
    try {
        dbLogger.info("Connecting to Database");
        await client.connect();
        const db = client.db(dbname);

        const result = await db.collection('vcards').insertOne(vCardData);
        dbLogger.info('VCard created:', result);
        return result;
    } catch (error) {
        dbLogger.error({message: 'Error creating VCard', error});
        return null;
    } finally {
        await client.close();
        dbLogger.info("Connection closed");
    }
};

// READ VCard by ID (GET)
/**
 * Retrieves a VCard by its ID from the MongoDB database.
 * @param businessId The ID of the VCard to be retrieved.
 */
export const getVCardByIdDB = async (businessId: string) => {
    const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});
    try {
        dbLogger.info("Connecting to Database");
        await client.connect();
        const db = client.db(dbname);

        const vCard = await db.collection('vcards').findOne({"businessId": businessId});
        dbLogger.info('VCard found: ', businessId);
        return vCard;
    } catch (error) {
        dbLogger.error({message: 'Error retrieving VCard', error});
        return null;
    } finally {
        await client.close();
        dbLogger.info("Connection closed");
    }
};

// UPDATE VCard by ID (PUT)
/**
 * Updates a VCard in the MongoDB database by its Owner ID.
 * @param ownerId The ID of the VCard to be updated.
 * @param updatedVCard The VCard object containing the new data to be set.
 */
export const updateVCardDB = async (ownerId: string, updatedVCard: Partial<VCardData>) => {
    const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});
    try {
        dbLogger.info("Connecting to Database");
        await client.connect();
        const db = client.db(dbname);

        const result = await db.collection('vcards').updateOne(
            {"ownerId": ownerId},
            {$set: updatedVCard},
            {upsert: false}
        );
        dbLogger.info('VCard updated:', result);
        return result;
    } catch (error) {
        dbLogger.error({message: 'Error updating VCard', error});
        return null;
    } finally {
        await client.close();
        dbLogger.info("Connection closed");
    }
};

// DELETE VCard by ID (DELETE)
/**
 * Deletes a VCard from the MongoDB database by its ID.
 * @param vCardId The ID of the VCard to be deleted.
 */
export const deleteVCardDB = async (vCardId: string) => {
    const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});
    try {
        dbLogger.info("Connecting to Database");
        await client.connect();
        const db = client.db(dbname);
        const objectId = new ObjectId(vCardId)
        const result = await db.collection('vcards').deleteOne({"_id": objectId});

        dbLogger.info('VCard deleted!');
        return result;
    } catch (error) {
        dbLogger.error({message: 'Error deleting VCard', error});
        return null;
    } finally {
        await client.close();
        dbLogger.info("Connection closed");
    }
};

// LIST all VCards (GET)
/**
 * Retrieves all VCARDs from the MongoDB database.
 */
export const listVCardsDB = async () => {
    const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});
    try {
        dbLogger.info("Connecting to Database");
        await client.connect();
        const db = client.db(dbname);

        const vCards = await db.collection('vcards').find().toArray();
        dbLogger.info('VCards found:', vCards);
        return vCards;
    } catch (error) {
        dbLogger.error({message: 'Error listing VCARDs', error});
        return null;
    } finally {
        await client.close();
        dbLogger.info("Connection closed");
    }
};

// CREATE User (POST)
/**
 * Creates a new user in the MongoDB database.
 * @param newUser The User object to be created.
 */
export const createUserDB = async (newUser: UserData) => {
    const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});

    try {
        dbLogger.info("Connecting to Database");
        await client.connect();
        const db = client.db(dbname);

        newUser.createdAt = new Date();  // Set creation date
        newUser.updatedAt = new Date();  // Set update date

        const result = await db.collection('users').insertOne(newUser);
        dbLogger.info('User created:', result);
        return result;

    } catch (error) {
        dbLogger.error({message: 'Error creating User', error});
        return null;
    } finally {
        await client.close();
        dbLogger.info("Connection closed");
    }
};

// READ User by ID (GET)
/**
 * Retrieves a user by their ID from the MongoDB database.
 * @param userId The ID of the user to be retrieved.
 */
export const getUserByIdDB = async (userId: string) => {
    const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});

    try {
        dbLogger.info("Connecting to Database");
        await client.connect();
        const db = client.db(dbname);

        const user = await db.collection('users').findOne({_id: new ObjectId(userId)});
        dbLogger.info('User found:', user);
        return user;

    } catch (error) {
        dbLogger.error({message: 'Error retrieving User', error});
        return null;
    } finally {
        await client.close();
        dbLogger.info("Connection closed");
    }
};

// READ User by email (GET)
/**
 * Retrieves a user by their ID from the MongoDB database.
 * @param userEmail The email of the user to be retrieved.
 */
export const getUserByEmailDB = async (userEmail: string) => {
    const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});

    try {
        dbLogger.info("Connecting to Database");
        await client.connect();
        const db = client.db(dbname);

        const user = await db.collection('users').findOne({"email": userEmail});
        dbLogger.info('User found:', user);
        return user;

    } catch (error) {
        dbLogger.error({message: 'Error retrieving User', error});
        return null;
    } finally {
        await client.close();
        dbLogger.info("Connection closed");
    }
};

// UPDATE User by ID (PUT)
/**
 * Updates a user in the MongoDB database by their ID.
 * @param userId The ID of the user to be updated.
 * @param updatedUser The User object containing the new data to be set.
 */
export const updateUserDB = async (userId: string, updatedUser: Partial<UserData>) => {
    const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});

    try {
        dbLogger.info("Connecting to Database");
        await client.connect();
        const db = client.db(dbname);

        updatedUser.updatedAt = new Date();  // Update the update timestamp

        const result = await db.collection('users').updateOne(
            {"_id": new ObjectId(userId)},
            {
                $set: updatedUser
            },
            {"upsert": false}
        );

        dbLogger.info('User updated:', result);
        return result;

    } catch (error) {
        dbLogger.error({message: 'Error updating User', error});
        return null;
    } finally {
        await client.close();
        dbLogger.info("Connection closed");
    }
};

// DELETE User by ID (DELETE)
/**
 * Deletes a user from the MongoDB database by their ID.
 *
 * @param userId The ID of the user to be deleted.
 */
export const deleteUserDB = async (userId: string) => {
    const client = new MongoClient(encodeURI(uri), {useNewUrlParser: true, useUnifiedTopology: true});

    try {
        dbLogger.info("Connecting to Database");
        await client.connect();
        const db = client.db(dbname);

        dbLogger.info('Deleting user with ID:', userId);
        const result = await db.collection('users').deleteOne({_id: new ObjectId(userId)});

        dbLogger.info('User deleted:', result);
        return result;
    } catch (error) {
        dbLogger.error({message: 'Error deleting user', error});
        throw error;
    } finally {
        await client.close();
        dbLogger.info("Database connection closed");
    }
};

/**
 * Retrieves all users from the MongoDB database.
 */
export const listUsersDB = async () => {
    const client = new MongoClient(encodeURI(uri), {useNewUrlParser: true, useUnifiedTopology: true});

    try {
        dbLogger.info("Connecting to Database");
        await client.connect();
        const db = client.db(dbname);

        dbLogger.info('Fetching all users');
        const users = await db.collection('users').find().toArray();

        dbLogger.info('Users found:', users);
        return users;
    } catch (error) {
        dbLogger.error({message: 'Error listing users', error});
        throw error;
    } finally {
        await client.close();
        dbLogger.info("Database connection closed");
    }
};

/**
 * Performs a simple connection health test with the MongoDB database.
 *
 * This function attempts to connect to the MongoDB database and returns
 * the connection status, the database connection state, the server uptime,
 * and a timestamp of when the health check was performed. It also logs
 * the connection status and any errors that occur during the process.
 *
 * @async
 * @function healthDB
 * @returns {Promise<{ status: string, dbConnection: string, uptime: number, timestamp: Date }>}
 * - An object containing:
 *   - `status`: A string indicating whether the MongoDB connection is 'healthy' or 'unhealthy'.
 *   - `dbConnection`: A string indicating the current connection state to the database ('connected' or 'disconnected').
 *   - `uptime`: A number representing the uptime of the Node.js process in seconds.
 *   - `timestamp`: A Date object representing the time when the health check was performed.
 *
 * @throws {Error} Throws an error if the connection to the MongoDB database fails.
 */
export const healthDB = async () => {
    const client = new MongoClient(encodeURI(uri), {useNewUrlParser: true, useUnifiedTopology: true});
    try {
        const status = client ? 'healthy' : 'unhealthy'; // Correct Mongoose instance reference

        dbLogger.info("DB connection established successfully");
        return {
            status,
            dbConnection: client ? 'connected' : 'disconnected',
            uptime: process.uptime(),
            timestamp: new Date(),
        };
    } catch (error) {
        dbLogger.error({message: 'Failed to connect to MongoDB Atlas ', error});
        throw error;
    } finally {
        await client.close();
        dbLogger.info("Database connection closed");
    }
};

/**
 * Inserts a new social media record into the socials collection.
 *
 * @param {any} socialData - The social media data to be inserted.
 * @returns {Promise<any>} The result of the insertion operation.
 */
export const createSocialDB = async (socialData: any): Promise<any> => {
    const client = new MongoClient(encodeURI(uri), {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    try {
        await client.connect();
        const db = client.db(dbname);
        const result = await db.collection('socials').insertOne(socialData);
        return {insertedId: result.insertedId};
    } catch (error) {
        console.error('Error inserting social data:', error);
        throw new Error('Insert failed');
    } finally {
        client.close();
    }
};

/**
 * Retrieves a social media record by the user's ID.
 *
 * @param {string} userId - The ID of the user to retrieve the social media records for.
 * @returns {Promise<any[]>} A list of social media records for the user.
 */
export const getSocialByUserIdDB = async (userId: string): Promise<any[]> => {
    const client = new MongoClient(encodeURI(uri), {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    try {
        await client.connect();
        const db = client.db(dbname);
        return await db.collection('socials').find({userId: userId}).toArray();

    } catch (error) {
        console.error('Error fetching social data by user ID:', error);
        throw new Error('Find failed');
    } finally {
        client.close();
    }
};

/**
 * Retrieves a social media record by the business's ID.
 *
 * @param {string} businessId - The ID of the business to retrieve the social media records for.
 * @returns {Promise<any[]>} A list of social media records for the business.
 */
export const getSocialByBusinessIdDB = async (businessId: string): Promise<any[]> => {
    const client = new MongoClient(encodeURI(uri), {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    try {
        await client.connect();
        const db = client.db(dbname);
        return await db.collection('socials').find({businessId: businessId}).toArray();

    } catch (error) {
        console.error('Error fetching social data by business ID:', error);
        throw new Error('Find failed');
    } finally {
        client.close();
    }
};


/**
 * Retrieves a social media record by its ID.
 *
 * @param {string} socialId - The ID of the social media record to retrieve.
 * @returns {Promise<any>} The social media record.
 */
export const getSocialDB = async (socialId: string): Promise<any> => {
    const client = new MongoClient(encodeURI(uri), {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    try {
        await client.connect();
        const db = client.db(dbname);
        return await db.collection('socials').findOne({_id: new ObjectId(socialId)});

    } catch (error) {
        console.error('Error fetching social data:', error);
        throw new Error('Find failed');
    } finally {
        client.close();
    }
};

/**
 * Retrieves all social media records associated with a user.
 *
 * @param {string} userId - The ID of the user to retrieve social media records for.
 * @returns {Promise<any[]>} A list of social media records for the user.
 */
export const getAllSocialsForUserDB = async (userId: string): Promise<any[]> => {
    const client = new MongoClient(encodeURI(uri), {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    try {
        await client.connect();
        const db = client.db(dbname);
        return await db.collection('socials').find({user_id: userId}).toArray();
    } catch (error) {
        console.error('Error fetching user social data:', error);
        throw new Error('Find failed');
    } finally {
        client.close();
    }
};

/**
 * Updates a social media record by its ID.
 *
 * @param {string} socialId - The ID of the social media record to update.
 * @param {any} updatedData - The updated data for the social media record.
 * @returns {Promise<any>} The result of the update operation.
 */
export const updateSocialDB = async (socialId: string, updatedData: any): Promise<any> => {
    const client = new MongoClient(encodeURI(uri), {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    try {
        await client.connect();
        const db = client.db(dbname);
        const result = await db.collection('socials').updateOne(
            {"_id": socialId},
            {$set: updatedData}
        );
        return {modifiedCount: result.modifiedCount};
    } catch (error) {
        console.error('Error updating social data:', error);
        throw new Error('Update failed');
    } finally {
        client.close();
    }
};

/**
 * Deletes a social media record by its ID.
 *
 * @param {string} socialId - The ID of the social media record to delete.
 * @returns {Promise<any>} The result of the delete operation.
 */
export const deleteSocialDB = async (socialId: string): Promise<any> => {
    const client = new MongoClient(encodeURI(uri), {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    try {
        await client.connect();
        const db = client.db(dbname);
        const result = await db.collection('socials').deleteOne({"_id": socialId});
        return {deletedCount: result.deletedCount};
    } catch (error) {
        console.error('Error deleting social data:', error);
        throw new Error('Delete failed');
    } finally {
        client.close();
    }
};

/**
 * Inserts a new Card into the MongoDB database.
 * @param cardData The Card object to be inserted.
 */
export const createCardDB = async (cardData: any) => {
    const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});
    try {
        dbLogger.info("Connecting to Database");
        await client.connect();
        const db = client.db(dbname);

        const result = await db.collection('cards').insertOne(cardData);
        dbLogger.info('Card created successfully!', result);
        return result;
    } catch (error) {
        dbLogger.error({message: 'Error creating Card', error});
        return null;
    } finally {
        await client.close();
        dbLogger.info("Connection closed");
    }
};

/**
 * Retrieves a Card by its ID from the MongoDB database.
 * @param cardId The ID of the Card to be retrieved.
 */
export const getCardByIdDB = async (cardId: string) => {
    const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});
    try {
        dbLogger.info("Connecting to Database");
        await client.connect();
        const db = client.db(dbname);

        const objectId = new ObjectId(cardId)
        const card = await db.collection('cards').findOne({"_id": objectId});
        dbLogger.info('Card found:', card);
        return card;
    } catch (error) {
        dbLogger.error({message: 'Error retrieving Card', error});
        return null;
    } finally {
        await client.close();
        dbLogger.info("Connection closed");
    }
};

/**
 * Updates a Card in the MongoDB database by its ID.
 * @param cardId The ID of the Card to be updated.
 * @param updatedCard The Card object containing the new data to be set.
 */
export const updateCardDB = async (cardId: string, updatedCard: Partial<Card>) => {
    const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});
    try {
        dbLogger.info("Connecting to Database");
        await client.connect();
        const db = client.db(dbname);
        const objectId = new ObjectId(cardId)
        const result = await db.collection('cards').updateOne(
            {"_id": objectId},
            {$set: updatedCard},
            {upsert: false}
        );
        dbLogger.info('Card updated:', result);
        return result;
    } catch (error) {
        dbLogger.error({message: 'Error updating Card', error});
        return null;
    } finally {
        await client.close();
        dbLogger.info("Connection closed");
    }
};

/**
 * Deletes a Card from the MongoDB database by its ID.
 * @param cardId The ID of the Card to be deleted.
 */
export const deleteCardDB = async (cardId: string) => {
    const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});
    try {
        dbLogger.info("Connecting to Database");
        await client.connect();
        const db = client.db(dbname);

        const result = await db.collection('cards').deleteOne({"_id": cardId});
        dbLogger.info('Card deleted:', result);
        return result;
    } catch (error) {
        dbLogger.error({message: 'Error deleting Card', error});
        return error;
    } finally {
        await client.close();
        dbLogger.info("Connection closed");
    }
};

/**
 * Retrieves all Cards from the MongoDB database.
 */
export const listCardsDB = async () => {
    const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});
    try {
        dbLogger.info("Connecting to Database");
        await client.connect();
        const db = client.db(dbname);

        const cards = await db.collection('cards').find().toArray();
        dbLogger.info('Cards found:', cards);
        return cards;
    } catch (error) {
        dbLogger.error({message: 'Error listing Cards', error});
        return null;
    } finally {
        await client.close();
        dbLogger.info("Connection closed");
    }
};

/**
 * Inserts a new mapping of a card's hash and its MongoDB ID.
 * @param {Object} mappingData - The data containing cardId and its corresponding hash.
 * @param {ObjectId} mappingData.cardId - The original MongoDB ID of the card.
 * @param {string} mappingData.hash - The generated hash for the card.
 * @param {string} mappingData.shortenedHash - The shortened hash for the card.
 * @returns {Promise<any>} The result of the insert operation.
 */
export const createHashMappingDB = async (mappingData: {
    cardId: string | undefined;
    identifier: string;
    hash: string
}): Promise<any> => {
    const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});
    try {
        dbLogger.info("Connecting to Database");
        await client.connect();
        const db = client.db(dbname);

        const result = await db.collection('cardHashMappings').insertOne(mappingData);
        dbLogger.info('Hash mapping created successfully', result);
        return result;
    } catch (error) {
        dbLogger.error({message: 'Error creating hash mapping', error});
        throw new Error('Failed to create hash mapping');
    } finally {
        await client.close();
        dbLogger.info("Connection closed");
    }
};

/**
 * Retrieves a mapping entry by its hash.
 * @param {string} hash - The hash to search for in the database.
 * @returns {Promise<any>} The mapping data containing the original card ID if found.
 */
export const getHashMappingByHashDB = async (hash: string): Promise<any> => {
    const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});
    try {
        dbLogger.info("Connecting to Database");
        await client.connect();
        const db = client.db(dbname);

        const mapping = await db.collection('cardHashMapping').findOne({hash});
        dbLogger.info('Hash mapping found:', mapping);
        return mapping;
    } catch (error) {
        dbLogger.error({message: 'Error retrieving hash mapping', error});
        throw new Error('Failed to retrieve hash mapping');
    } finally {
        await client.close();
        dbLogger.info("Connection closed");
    }
};

/**
 * Updates an existing hash mapping entry by its cardId.
 * @param cardId
 * @param {Partial<{hash: string}>} updatedData - The updated hash data.
 * @returns {Promise<any>} The result of the update operation.
 */
export const updateHashMappingDB = async (cardId: string, updatedData: Partial<{ hash: string }>): Promise<any> => {
    const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});
    try {
        dbLogger.info("Connecting to Database");
        await client.connect();
        const db = client.db(dbname);

        const result = await db.collection('cardHashMapping').updateOne(
            {cardId},
            {$set: updatedData}
        );
        dbLogger.info('Hash mapping updated:', result);
        return result;
    } catch (error) {
        dbLogger.error({message: 'Error updating hash mapping', error});
        throw new Error('Failed to update hash mapping');
    } finally {
        await client.close();
        dbLogger.info("Connection closed");
    }
};

/**
 * Deletes a hash mapping entry by its cardId.
 * @param cardId - The MongoDB ID of the card to delete the hash mapping for.
 * @returns {Promise<any>} The result of the delete operation.
 */
export const deleteHashMappingDB = async (cardId: string): Promise<any> => {
    const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});
    try {
        dbLogger.info("Connecting to Database");
        await client.connect();
        const db = client.db(dbname);

        const result = await db.collection('cardHashMapping').deleteOne({cardId});
        dbLogger.info('Hash mapping deleted:', result);
        return result;
    } catch (error) {
        dbLogger.error({message: 'Error deleting hash mapping', error});
        throw new Error('Failed to delete hash mapping');
    } finally {
        await client.close();
        dbLogger.info("Connection closed");
    }
};

/**
 * Retrieves all hash mappings from the database.
 * @returns {Promise<any[]>} An array of all hash mappings.
 */
export const listHashMappingsDB = async (): Promise<any[]> => {
    const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});
    try {
        dbLogger.info("Connecting to Database");
        await client.connect();
        const db = client.db(dbname);

        const mappings = await db.collection('cardHashMapping').find().toArray();
        dbLogger.info('Hash mappings retrieved:', mappings);
        return mappings;
    } catch (error) {
        dbLogger.error({message: 'Error listing hash mappings', error});
        throw new Error('Failed to list hash mappings');
    } finally {
        await client.close();
        dbLogger.info("Connection closed");
    }
};


/**
 * Inserts a new CardMetric into the MongoDB database.
 * @param cardMetricData The CardMetric object to be inserted.
 * @returns The result of the insertion operation.
 */
export const createCardMetricDB = async (cardMetricData: any) => {
    const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});
    try {
        dbLogger.info("Connecting to Database");
        await client.connect();
        const db = client.db(dbname);

        const result = await db.collection('cardMetrics').insertOne(cardMetricData);
        dbLogger.info('CardMetric created:', result);
        return result;
    } catch (error) {
        dbLogger.error({message: 'Error creating CardMetric', error});
        return null;
    } finally {
        await client.close();
        dbLogger.info("Connection closed");
    }
};

/**
 * Retrieves a CardMetric by its ID from the MongoDB database.
 * @param cardMetricId The ID of the CardMetric to be retrieved.
 * @returns The CardMetric object if found, otherwise null.
 */
export const getCardMetricByIdDB = async (cardMetricId: string) => {
    const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});
    try {
        dbLogger.info("Connecting to Database");
        await client.connect();
        const db = client.db(dbname);

        const cardMetric = await db.collection('cardMetrics').findOne({"_id": cardMetricId});
        dbLogger.info('CardMetric found:', cardMetric);
        return cardMetric;
    } catch (error) {
        dbLogger.error({message: 'Error retrieving CardMetric', error});
        return null;
    } finally {
        await client.close();
        dbLogger.info("Connection closed");
    }
};

/**
 * Retrieves a CardMetric by its cardId from the MongoDB database.
 * @param cardId The ID of the Card associated with the CardMetric to be retrieved.
 * @returns The CardMetric object if found, otherwise null.
 */
export const getCardMetricByCardIdDB = async (cardId: string) => {
    const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});
    try {
        dbLogger.info("Connecting to Database");
        await client.connect();
        const db = client.db(dbname);

        // Querying by cardId
        const cardMetric = await db.collection('cardMetrics').findOne({"cardId": cardId});
        dbLogger.info('CardMetric found:', cardMetric);
        return cardMetric;
    } catch (error) {
        dbLogger.error({message: 'Error retrieving CardMetric by cardId', error});
        return null;
    } finally {
        await client.close();
        dbLogger.info("Connection closed");
    }
};


/**
 * Updates a CardMetric in the MongoDB database by its ID.
 * @param cardMetricId The ID of the CardMetric to be updated.
 * @param updatedCardMetric The CardMetric object containing the new data to be set.
 * @returns The result of the update operation.
 */
export const updateCardMetricDB = async (cardMetricId: string, updatedCardMetric: Partial<any>) => {
    const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});
    try {
        dbLogger.info("Connecting to Database");
        await client.connect();
        const db = client.db(dbname);

        const result = await db.collection('cardMetrics').updateOne(
            {"cardId": cardMetricId},
            {$set: updatedCardMetric},
            {upsert: false}
        );
        dbLogger.info('CardMetric updated:', result);
        return result;
    } catch (error) {
        dbLogger.error({message: 'Error updating CardMetric', error});
        return null;
    } finally {
        await client.close();
        dbLogger.info("Connection closed");
    }
};

/**
 * Deletes a CardMetric from the MongoDB database by its ID.
 * @param cardId The associated cardID of the CardMetric to be deleted.
 * @returns The result of the delete operation.
 */
export const deleteCardMetricDB = async (cardId: string) => {
    const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});
    try {
        dbLogger.info("Connecting to Database");
        await client.connect();
        const db = client.db(dbname);

        const result = await db.collection('cardMetrics').deleteOne({"cardId": cardId});
        dbLogger.info('CardMetric deleted:', result);
        return result;
    } catch (error) {
        dbLogger.error({message: 'Error deleting CardMetric', error});
        return error;
    } finally {
        await client.close();
        dbLogger.info("Connection closed");
    }
};

/**
 * Retrieves all CardMetrics from the MongoDB database.
 * @returns An array of CardMetrics.
 */
export const listCardMetricsDB = async () => {
    const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});
    try {
        dbLogger.info("Connecting to Database");
        await client.connect();
        const db = client.db(dbname);

        const cardMetrics = await db.collection('cardMetrics').find().toArray();
        dbLogger.info('CardMetrics found:', cardMetrics);
        return cardMetrics;
    } catch (error) {
        dbLogger.error({message: 'Error listing CardMetrics', error});
        return null;
    } finally {
        await client.close();
        dbLogger.info("Connection closed");
    }
};

/**
 * Retrieves a CardHashMapping by its ID from the MongoDB database.
 * @param mappingId The ID of the CardHashMapping to be retrieved.
 * @returns The CardHashMapping object if found, otherwise null.
 */
export const getCardHashMappingByIdDB = async (mappingId: string) => {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
        dbLogger.info("Connecting to Database");
        await client.connect();
        const db = client.db(dbname);

        const cardHashMapping = await db.collection('cardHashMappings').findOne({ "identifier": mappingId });
        dbLogger.info('CardHashMapping found');
        return cardHashMapping;
    } catch (error) {
        dbLogger.error({ message: 'Error retrieving CardHashMapping', error });
        return null;
    } finally {
        await client.close();
        dbLogger.info("Connection closed");
    }
};

/**
 * Retrieves a CardHashMapping by its cardId from the MongoDB database.
 * @param cardId The ID of the card associated with the CardHashMapping to be retrieved.
 * @returns The CardHashMapping object if found, otherwise null.
 */
export const getCardHashMappingByCardIdDB = async (cardId: string) => {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
        dbLogger.info("Connecting to Database");
        await client.connect();
        const db = client.db(dbname);

        const cardHashMapping = await db.collection('cardHashMappings').findOne({ "cardId": cardId });
        dbLogger.info('CardHashMapping found:', cardHashMapping);
        return cardHashMapping;
    } catch (error) {
        dbLogger.error({ message: 'Error retrieving CardHashMapping by cardId', error });
        return null;
    } finally {
        await client.close();
        dbLogger.info("Connection closed");
    }
};

/**
 * Updates a CardHashMapping in the MongoDB database by its ID.
 * @param mappingId The ID of the CardHashMapping to be updated.
 * @param updatedCardHashMapping The object containing the new data to be set.
 * @returns The result of the update operation.
 */
export const updateCardHashMappingDB = async (mappingId: string, updatedCardHashMapping: Partial<any>) => {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
        dbLogger.info("Connecting to Database");
        await client.connect();
        const db = client.db(dbname);

        const result = await db.collection('cardHashMappings').updateOne(
            { "_id": mappingId },
            { $set: updatedCardHashMapping },
            { upsert: false }
        );
        dbLogger.info('CardHashMapping updated:', result);
        return result;
    } catch (error) {
        dbLogger.error({ message: 'Error updating CardHashMapping', error });
        return null;
    } finally {
        await client.close();
        dbLogger.info("Connection closed");
    }
};

/**
 * Deletes a CardHashMapping from the MongoDB database by its ID.
 * @param mappingId The ID of the CardHashMapping to be deleted.
 * @returns The result of the delete operation.
 */
export const deleteCardHashMappingDB = async (mappingId: string) => {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
        dbLogger.info("Connecting to Database");
        await client.connect();
        const db = client.db(dbname);

        const result = await db.collection('cardHashMappings').deleteOne({ "_id": mappingId });
        dbLogger.info('CardHashMapping deleted:', result);
        return result;
    } catch (error) {
        dbLogger.error({ message: 'Error deleting CardHashMapping', error });
        return error;
    } finally {
        await client.close();
        dbLogger.info("Connection closed");
    }
};

/**
 * Retrieves all CardHashMappings from the MongoDB database.
 * @returns An array of CardHashMappings.
 */
export const listCardHashMappingsDB = async () => {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
        dbLogger.info("Connecting to Database");
        await client.connect();
        const db = client.db(dbname);

        const cardHashMappings = await db.collection('cardHashMappings').find().toArray();
        dbLogger.info('CardHashMappings found:', cardHashMappings);
        return cardHashMappings;
    } catch (error) {
        dbLogger.error({ message: 'Error listing CardHashMappings', error });
        return null;
    } finally {
        await client.close();
        dbLogger.info("Connection closed");
    }
};

/**
 * Retrieves consolidated business data by aggregating across multiple collections.
 *
 * @param identifier The ID of the user whose data needs to be retrieved.
 * @returns A promise resolving to the consolidated data from businesses, users, roles, socials, and vcards collections.
 */
export const aggregateDataDB = async (identifier: string) => {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        dbLogger.info("Connecting to Database");
        await client.connect();
        const db = client.db(dbname);
        const cardFromHashTable = await getCardHashMappingByIdDB(identifier)
        const cardId = cardFromHashTable?.cardId
        if (cardId) {
            dbLogger.info(`Aggregating data for card ID: ${cardId}`);

            const result = await db.collection('cards').aggregate([
                {
                    $match: { _id: new ObjectId(cardId) } // Ensure `cardId` matches type and value
                },
                {
                    $addFields: {
                        convertedBusinessId: { $toObjectId: "$businessId" }, // Convert string `businessId` to ObjectId
                        convertedUserId: { $toObjectId: "$userId" } // Convert string `userId` to ObjectId
                    }
                },
                {
                    $lookup: {
                        from: "businesses",
                        localField: "convertedBusinessId", // Use converted field
                        foreignField: "_id",
                        as: "businessData"
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "convertedUserId", // Use converted field
                        foreignField: "_id",
                        as: "userData"
                    }
                },
                {
                    $lookup: {
                        from: "roles",
                        localField: "convertedUserId", // Use converted field
                        foreignField: "userId",
                        as: "roleData"
                    }
                },
                {
                    $lookup: {
                        from: "socials",
                        localField: "userId",
                        foreignField: "userId",
                        as: "socialsData"
                    }
                },
                {
                    $lookup: {
                        from: "vcards",
                        localField: "_id",
                        foreignField: "cardId",
                        as: "vcardData"
                    }
                },
                {
                    $lookup: {
                        from: "cardMetrics",
                        localField: "_id",
                        foreignField: "cardId",
                        as: "metricsData"
                    }
                },
                {
                    $lookup: {
                        from: "cardHashMapping",
                        localField: "_id",
                        foreignField: "cardId",
                        as: "hashMappingData"
                    }
                },
                {
                    $project: {
                        _id: 1,
                        userId: 1,
                        businessId: 1,
                        status: 1,
                        tapCount: 1,
                        lastTap: 1,
                        taps: 1,
                        createdAt: 1,
                        deactivatedAt: 1,
                        businessData: { $arrayElemAt: ["$businessData", 0] },
                        userData: { $arrayElemAt: ["$userData", 0] },
                        roleData: { $arrayElemAt: ["$roleData", 0] },
                        socialsData: 1,
                        vcardData: { $arrayElemAt: ["$vcardData", 0] },
                        metricsData: { $arrayElemAt: ["$metricsData", 0] },
                        hashMappingData: { $arrayElemAt: ["$hashMappingData", 0] }
                    }
                }
            ]).toArray();

            dbLogger.info('Data aggregation successful: 1 Record affected');
            return result;
        } else {
            dbLogger.error(`Data aggregation unsuccessful. Card ID: ${cardId}`);
        }

    } catch (error) {
        dbLogger.error({ message: 'Error aggregating data', error });
        throw error;
    } finally {
        await client.close();
        dbLogger.info("Database connection closed");
    }
};

