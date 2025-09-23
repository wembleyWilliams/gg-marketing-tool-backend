import logger from '../logger/logger';
import {ObjectId} from "mongodb";
import {BusinessData, UserData, VCardData, Card, HashMap, TokenData} from "../common/types";
import {utils} from "../utils";

const dbLogger = logger.child({context: 'databaseService'})
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()

const uri = process.env.MONGODB_URI as string;
const dbname = process.env.MONGODB_DB_NAME as string;

/**
 * Database service module for handling all MongoDB operations.
 * @module databaseService
 * @description Provides CRUD operations for:
 * - Businesses
 * - Users
 * - VCards
 * - Cards
 * - Social media
 * - Metrics and analytics
 * - Hash mappings
 */


/**
 * Creates a new token in the database.
 * @async
 * @function createTokenDB
 * @param {TokenData} tokenDetails - The token details to create
 * @returns {Promise<InsertOneResult>} MongoDB insert result
 * @throws {Error} If database operation fails
 */
export const createTokenDB = async (tokenDetails: TokenData) => {
    const client = new MongoClient(encodeURI(uri), {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    try {
        dbLogger.info("Connecting to Database");
        await client.connect();

        const db = client.db(dbname);
        const result = await db.collection("tokens").insertOne(tokenDetails);
        dbLogger.info(`Token created: ${result.insertedId.toString()}`);
        return result;
    } catch (error) {
        dbLogger.error({ message: "Error creating token", error });
        throw error;
    } finally {
        await client.close();
        dbLogger.info("Database connection closed");
    }
};

/**
 * Retrieves a token by ID.
 * @async
 * @function getTokenByIdDB
 * @param {string} tokenId - Token ID to retrieve
 * @returns {Promise<TokenData|null>} Token document or null
 * @throws {Error} If database operation fails
 */
export const getTokenByIdDB = async (tokenId: string) => {
    const client = new MongoClient(encodeURI(uri), {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    try {
        await client.connect();
        const db = client.db(dbname);
        const objectId = new ObjectId(tokenId);

        dbLogger.info("Database connected, retrieving token");

        const result = await db.collection("tokens").findOne({ _id: objectId });
        if (result) {
            dbLogger.info("Token retrieved: " + result._id);
            return result;
        } else {
            dbLogger.info("Token not found");
            return null;
        }
    } catch (error: any) {
        dbLogger.error(`Error occurred: ${error.message}`);
        throw error;
    } finally {
        await client.close();
    }
};

/**
 * Retrieves a token by user ID.
 * @async
 * @function getTokenByUserIdDB
 * @param {string} userId - User ID to find token for
 * @returns {Promise<TokenData|null>} Token document or null
 * @throws {Error} If database operation fails
 */
export const getTokenByUserIdDB = async (userId: string) => {
    const client = new MongoClient(encodeURI(uri), {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    try {
        await client.connect();
        const db = client.db(dbname);

        dbLogger.info("Database connected, retrieving token by userId");

        const result = await db.collection("tokens").findOne({ userId: new ObjectId(userId) });
        if (result) {
            dbLogger.info("Token retrieved: " + result._id);
            return result;
        } else {
            dbLogger.info("Token not found");
            return null;
        }
    } catch (error: any) {
        dbLogger.error(`Error occurred: ${error.message}`);
        throw error;
    } finally {
        await client.close();
    }
};

/**
 * Updates a token record in the database.
 * @async
 * @function updateTokenDB
 * @param {string|ObjectId} id - Token ID to update
 * @param {Partial<TokenData>} updateDetails - Fields to update
 * @returns {Promise<UpdateResult>} MongoDB update result
 * @throws {Error} If database operation fails
 */
export const updateTokenDB = async (id: string | ObjectId, updateDetails: Partial<TokenData>) => {
    const client = new MongoClient(encodeURI(uri), {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    try {
        dbLogger.info("Connecting to Database");
        await client.connect();

        const db = client.db(dbname);
        const objectId = typeof id === "string" ? new ObjectId(id) : id;

        dbLogger.info(`Updating token with ID: ${id}`);

        // Destructure to remove _id from updates
        const { _id, ...updateData } = updateDetails;

        const result = await db.collection("tokens").updateOne(
            { _id: objectId },
            { $set: { ...updateData } }
        );

        dbLogger.info(`Token updated (${id}) successfully!`);
        return result;
    } catch (error) {
        dbLogger.error({ message: "Error updating token", error });
        throw error;
    } finally {
        await client.close();
        dbLogger.info("Database connection closed");
    }
};

/**
 * Deletes a token record from the database.
 * @async
 * @function deleteTokenDB
 * @param {string} id - Token ID to delete
 * @returns {Promise<DeleteResult>} MongoDB delete result
 * @throws {Error} If database operation fails
 */
export const deleteTokenDB = async (id: string) => {
    const client = new MongoClient(encodeURI(uri), {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    const objectId = new ObjectId(id);

    try {
        dbLogger.info("Connecting to Database");
        await client.connect();

        const db = client.db(dbname);
        const result = await db.collection("tokens").deleteOne({ _id: objectId });
        dbLogger.info("Token successfully removed");
        return result;
    } catch (error) {
        dbLogger.error({ message: "Error removing token", error });
        throw error;
    } finally {
        await client.close();
        dbLogger.info("Database connection closed");
    }
};

/**
 * Creates a new business in the database.
 * @async
 * @function createBusinessDB
 * @param {BusinessData} businessDetails - The business details to create
 * @returns {Promise<InsertOneResult>} MongoDB insert result
 * @throws {Error} If database operation fails
 */
export const createBusinessDB = async (businessDetails: BusinessData) => {
    const client = new MongoClient(encodeURI(uri), {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });

    try {
        dbLogger.info("Connecting to Database");
        await client.connect();

        const db = client.db(dbname);
        const result = await db.collection("businesses").insertOne(businessDetails);
        dbLogger.info(`Business created: ${result.insertedId.toString()}`);
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
 * @async
 * @function updateBusinessDB
 * @param {string|ObjectId} id - Business ID to update
 * @param {Partial<BusinessData>} updateDetails - Fields to update
 * @returns {Promise<UpdateResult>} MongoDB update result
 * @throws {Error} If database operation fails
 */
export const updateBusinessDB = async (id: string | ObjectId, updateDetails: Partial<BusinessData>) => {
    const client = new MongoClient(encodeURI(uri), {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });

    try {
        dbLogger.info("Connecting to Database");
        await client.connect();
        const db = client.db(dbname);
        const objectId = typeof id === 'string' ? new ObjectId(id) : id;
        dbLogger.info(`Updating business with ID: ${id}`);

        // Destructure to remove _id from updateDetails
        const { _id, ...updateData } = updateDetails;

        const result = await db.collection("businesses").updateOne(
            { _id: objectId },
            {
                $set: { ...updateData } // Use the updateData without _id
            }
        );


        dbLogger.info(`Business updated (${result.insertedId}) successfully!`);
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
 * @async
 * @function deleteBusinessDB
 * @param {string} id - Business ID to delete
 * @returns {Promise<DeleteResult>} MongoDB delete result
 * @throws {Error} If database operation fails
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
 * Updates social media handles for a business.
 * @async
 * @function updateSocialHandlesDB
 * @param {string} businessId - Business ID to update
 * @param {any} addedHandle - New social media handle
 * @returns {Promise<any>} Updated document
 * @throws {Error} If database operation fails
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
 * Updates a business logo.
 * @async
 * @function updateLogoDB
 * @param {string} businessId - Business ID to update
 * @param {any} logo - New logo data
 * @returns {Promise<any>} Update result
 * @throws {Error} If database operation fails
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
 * Retrieves a business by ID.
 * @async
 * @function getBusinessByIdDB
 * @param {string} businessId - Business ID to retrieve
 * @returns {Promise<BusinessData|null>} Business document or null
 * @throws {Error} If database operation fails
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
 * Retrieves a business by user ID.
 * @async
 * @function getBusinessByUserIdDB
 * @param {string} userId - User ID to find business for
 * @returns {Promise<BusinessData|null>} Business document or null
 * @throws {Error} If database operation fails
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
 * Creates a new VCard in the database.
 * @async
 * @function createVCardDB
 * @param {any} vCardData - VCard data to insert
 * @returns {Promise<string|null>} Inserted ID or null
 * @throws {Error} If database operation fails
 */
export const createVCardDB = async (vCardData: any) => {
    const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});
    try {
        dbLogger.info("Connecting to Database");
        await client.connect();
        const db = client.db(dbname);

        const defaultVCard = {
            version: 3.0,
            note: "This contact card was created using a Digital Business Card from GG Marketing",
            logo: {
                url: "",
                mediaType: "image/png",
                base64: false
            },
            photo: {
                url: "",
                mediaType: "image/jpeg",
                base64: false
            },
            role: "Owner",
            // Set nickname to firstname if it exists in vCardData
            nickname: vCardData?.firstname || ""
        };

        // Merge provided data with defaults (provided data overrides defaults)
        const completeVCard = {
            ...defaultVCard,
            ...vCardData,
            // Ensure nested objects are properly merged
            logo: {
                ...defaultVCard.logo,
                ...vCardData?.logo
            },
            photo: {
                ...defaultVCard.photo,
                ...vCardData?.photo
            }
        };


        const result = await db.collection('vcards').insertOne(completeVCard);
        const insertedId = result.insertedId.toString();
        dbLogger.info(`VCard created: ${insertedId}`);
        return insertedId;
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
 * Retrieves a VCard by card ID.
 * @async
 * @function getVCardByIdDB
 * @param {string} cardId - VCard ID to retrieve
 * @returns {Promise<VCardData|null>} VCard document or null
 * @throws {Error} If database operation fails
 */
export const getVCardByIdDB = async (cardId: string) => {
    const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});
    try {
        dbLogger.info("Connecting to Database");
        await client.connect();
        const db = client.db(dbname);

        const vCard = await db.collection('vcards').findOne({"cardId": cardId});
        dbLogger.info(`VCard found: ${vCard._id}`);
        return vCard;
    } catch (error) {
        dbLogger.error({message: 'Error retrieving VCard', error});
        return null;
    } finally {
        await client.close();
        dbLogger.info("Connection closed");
    }
};

// READ VCard by ID (GET)
/**
 * Retrieves a VCard by MongoDB ID.
 * @async
 * @function getVCardDB
 * @param {string} id - MongoDB ID to retrieve
 * @returns {Promise<VCardData|null>} VCard document or null
 * @throws {Error} If database operation fails
 */
export const getVCardDB = async (id: string) => {
    const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});
    try {
        dbLogger.info("Connecting to Database");
        await client.connect();
        const db = client.db(dbname);

        const vCard = await db.collection('vcards').findOne({"_id": new ObjectId(id)});
        dbLogger.info(`VCard found: ${vCard._id}`);
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
 * Updates a VCard by card ID.
 * @async
 * @function updateVCardDB
 * @param {string} cardId - VCard ID to update
 * @param {Partial<VCardData>} updatedVCard - Fields to update
 * @returns {Promise<UpdateResult|null>} Update result or null
 * @throws {Error} If database operation fails
 */
export const updateVCardDB = async (cardId: string, updatedVCard: Partial<VCardData>) => {
    const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});
    try {
        dbLogger.info("Connecting to Database");
        await client.connect();
        const db = client.db(dbname);

        const result = await db.collection('vcards').updateOne(
            {"cardId": cardId},
            {$set: {...updatedVCard}},
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

// UPDATE VCard by ID (PUT)
/**
 * Updates a VCard by MongoDB ID.
 * @async
 * @function updateVCardByIdDB
 * @param {string} id - MongoDB ID to update
 * @param {Partial<VCardData>} updatedVCard - Fields to update
 * @returns {Promise<UpdateResult|null>} Update result or null
 * @throws {Error} If database operation fails
 */
export const updateVCardByIdDB = async (id: string, updatedVCard: Partial<VCardData>) => {
    const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});
    try {
        dbLogger.info("Connecting to Database");
        await client.connect();
        const db = client.db(dbname);

        const result = await db.collection('vcards').updateOne(
            {"_id": new ObjectId(id)},
            {$set: {...updatedVCard}},
            {upsert: false}
        );
        dbLogger.info(`'VCard updated: ${result.upsertedId.toString()}`);
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
 * Deletes a VCard by ID.
 * @async
 * @function deleteVCardDB
 * @param {string} vCardId - VCard ID to delete
 * @returns {Promise<DeleteResult|null>} Delete result or null
 * @throws {Error} If database operation fails
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
 * Lists all VCards in database.
 * @async
 * @function listVCardsDB
 * @returns {Promise<VCardData[]|null>} Array of VCards or null
 * @throws {Error} If database operation fails
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
 * Creates a new user in database.
 * @async
 * @function createUserDB
 * @param {UserData} newUser - User data to create
 * @returns {Promise<InsertOneResult|null>} Insert result or null
 * @throws {Error} If database operation fails
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
        dbLogger.info(`User created: ${result.insertedId.toString()}`);
        return result;

    } catch (error) {
        dbLogger.error({message: 'Error creating User', error});
        return null;
    } finally {
        await client.close();
        dbLogger.info("Connection closed");
    }
};

/**
 * Finds or creates an OAuth user.
 * @async
 * @function findOrCreateOAuthUserDB
 * @param {any} profile - OAuth profile data
 * @param {string} provider - Auth provider name
 * @returns {Promise<UserData|null>} User document or null
 * @throws {Error} If database operation fails
 */
export const findOrCreateOAuthUserDB = async (
    profile: any,
    provider: string
) => {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        dbLogger.info("Connecting to Database");
        await client.connect();
        const db = client.db(dbname);

        const {
            emails: email,
            id: authProviderId,
            name: fullName,
            photos: photo
        } = profile;

        dbLogger.info("Searching for existing user");
        let user: UserData = await db.collection('users').findOne({
            authProvider: provider,
            authProviderId: authProviderId
        });

        if (user) {
            dbLogger.info('User found:', user);
            return user;
        }

        dbLogger.info("User not found. Creating new user");
        const newUser: UserData = {
            cards: [],
            emailVerified: false,
            isActive: true,
            address: {
                street: "",
                city: "",
                state: "",
                postalCode: "",
                country: "",
                label:""
            },
            dob: "",
            firstName: fullName.givenName,
            lastName: fullName.familyName,
            phone: "",
            email: email[0],
            password: null,
            authProvider: provider,
            authProviderId: authProviderId,
            profilePicture: photo[0],
            createdAt: new Date(),
            updatedAt: new Date(),
            firstLogin: true
        };

        const result = await db.collection('users').insertOne(newUser);
        dbLogger.info('New user created:', result.insertedId);
        return newUser; // The newly created user document

    } catch (error) {
        dbLogger.error({ message: 'Error finding or creating OAuth User', error });
        return null;
    } finally {
        await client.close();
        dbLogger.info("Connection closed");
    }
};

// READ User by ID (GET)
/**
 * Retrieves a user by ID.
 * @async
 * @function getUserByIdDB
 * @param {string} userId - User ID to retrieve
 * @returns {Promise<UserData|null>} User document or null
 * @throws {Error} If database operation fails
 */
export const getUserByIdDB = async (userId: string) => {
    const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});

    try {
        dbLogger.info("Connecting to Database");
        await client.connect();
        const db = client.db(dbname);

        const user = await db.collection('users').findOne({_id: new ObjectId(userId)});
        if (user) {
            dbLogger.info('User found:', user._id);
        } else {
            dbLogger.info("No user found with that email");
        }
        return user;

    } catch (error) {
        dbLogger.error({message: 'Error retrieving User', error});
        return null;
    } finally {
        await client.close();
        dbLogger.info("Connection closed");
    }
}

// READ User by email (GET)
/**
 * Retrieves a user by email.
 * @async
 * @function getUserByEmailDB
 * @param {string} userEmail - Email to search for
 * @returns {Promise<UserData|null>} User document or null
 * @throws {Error} If database operation fails
 */
export const getUserByEmailDB = async (userEmail: string) => {
    const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});

    try {
        dbLogger.info("Connecting to Database");
        await client.connect();
        const db = client.db(dbname);

        const user = await db.collection('users').findOne({ email: userEmail });

        if (user) {
            dbLogger.info(`User found with userId: ${user._id}`);
        } else {
            dbLogger.info("No user found with that email");
        }
        return user;

    } catch (error) {
        dbLogger.error({message: 'Error retrieving User', error});
        return null;
    } finally {
        await client.close();
        dbLogger.info("Connection closed");
    }
};

/**
 * Gets a user by their email verification token
 * @param {string} token - The email verification token
 * @returns {Promise<any>} User object or null if not found
 */
export const getUserByVerificationTokenDB = async (token: string) => {
    const client = new MongoClient(encodeURI(uri), {useNewUrlParser: true, useUnifiedTopology: true});
    try {
        dbLogger.info("Connecting to Database");
        await client.connect();
        const db = client.db(dbname);

        const user = await db.collection('users').findOne({
            emailVerificationToken: token,
            emailVerificationTokenExpires: { $gt: new Date() } // Token hasn't expired
        });

        return user;
    } catch (error) {
        console.error('Error getting user by verification token:', error);
        return null;
    }
};

// UPDATE User by ID (PUT)
/**
 * Updates a user by ID.
 * @async
 * @function updateUserDB
 * @param {string} userId - User ID to update
 * @param {Partial<UserData>} updatedUser - Fields to update
 * @returns {Promise<UpdateResult|null>} Update result or null
 * @throws {Error} If database operation fails
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
 * Deletes a user by ID.
 * @async
 * @function deleteUserDB
 * @param {string} userId - User ID to delete
 * @returns {Promise<DeleteResult>} Delete result
 * @throws {Error} If database operation fails
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
 * Lists all users in database.
 * @async
 * @function listUsersDB
 * @returns {Promise<UserData[]>} Array of users
 * @throws {Error} If database operation fails
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
}

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
 * Creates a new social media record.
 * @async
 * @function createSocialDB
 * @param {any} socialData - Social data to create
 * @returns {Promise<any>} Insert result
 * @throws {Error} If database operation fails
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
 * Gets social media by user ID.
 * @async
 * @function getSocialByUserIdDB
 * @param {string} userId - User ID to search for
 * @returns {Promise<any[]>} Array of social records
 * @throws {Error} If database operation fails
 */
export const getSocialByUserIdDB = async (userId: string): Promise<any[]> => {
    const client = new MongoClient(encodeURI(uri), {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    try {
        dbLogger.info("Connecting to Socials Database");
        await client.connect();
        const db = client.db(dbname);
        const socials = await db.collection('socials').find({userId: userId}).toArray();
        dbLogger.info(`Number of Social(s) found : ${JSON.stringify(socials.length)}`);
        return socials;
    } catch (error) {
        dbLogger.error('Error fetching social data by user ID:', error);
        throw new Error('Find failed');
    } finally {
        client.close();
    }
};

/**
 * Gets social media by business ID.
 * @async
 * @function getSocialByBusinessIdDB
 * @param {string} businessId - Business ID to search for
 * @returns {Promise<any[]>} Array of social records
 * @throws {Error} If database operation fails
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
 * Gets a social media record by ID.
 * @async
 * @function getSocialDB
 * @param {string} socialId - Social record ID
 * @returns {Promise<any>} Social document
 * @throws {Error} If database operation fails
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
 * Gets all social media for a user.
 * @async
 * @function getAllSocialsForUserDB
 * @param {string} userId - User ID to search for
 * @returns {Promise<any[]>} Array of social records
 * @throws {Error} If database operation fails
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
 * Updates a social media record.
 * @async
 * @function updateSocialDB
 * @param {string} socialId - Social record ID to update
 * @param {any} updatedData - Fields to update
 * @returns {Promise<any>} Update result
 * @throws {Error} If database operation fails
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
            {"_id": new ObjectId(socialId)},
            {$set: updatedData}
        );
        return {modifiedCount: result.modifiedCount};
    } catch (error) {
        console.error('Error updating social data:', error);
        throw new Error('Update failed');
    } finally {
        await client.close();
        dbLogger.info("Connection closed");
    }
};

/**
 * Deletes a social media record.
 * @async
 * @function deleteSocialDB
 * @param {string} socialId - Social record ID to delete
 * @returns {Promise<any>} Delete result
 * @throws {Error} If database operation fails
 */
export const deleteSocialDB = async (socialId: string): Promise<any> => {
    const client = new MongoClient(encodeURI(uri), {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    try {
        await client.connect();
        const db = client.db(dbname);
        const result = await db.collection('socials').deleteOne(
            {"_id": new ObjectId(socialId)}
        );
        return {deletedCount: result.deletedCount};
    } catch (error) {
        console.error('Error deleting social data:', error);
        throw new Error('Delete failed');
    } finally {
        await client.close();
        dbLogger.info("Connection closed");
    }
};

/**
 * Creates a new card in database.
 * @async
 * @function createCardDB
 * @param {Card} cardData - Card data to create
 * @returns {Promise<InsertOneResult|null>} Insert result or null
 * @throws {Error} If database operation fails
 */
export const createCardDB = async (cardData: Card) => {
    const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});
    try {
        dbLogger.info("Connecting to Card Database");
        await client.connect();
        const db = client.db(dbname);

        const result = await db.collection('cards').insertOne(cardData);
        dbLogger.info(`Card created : ${result.insertedId.toString()}`);
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
 * Gets a card by ID.
 * @async
 * @function getCardByIdDB
 * @param {string} cardId - Card ID to retrieve
 * @returns {Promise<Card|null>} Card document or null
 * @throws {Error} If database operation fails
 */
export const getCardByIdDB = async (cardId: string) => {
    const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});
    try {
        dbLogger.info("Connecting to Card Database");
        await client.connect();
        const db = client.db(dbname);

        const objectId = new ObjectId(cardId)
        const card = await db.collection('cards').findOne({"_id": objectId});
        dbLogger.info(`Card found : ${card._id.toString()}`);
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
 * Updates a card by ID.
 * @async
 * @function updateCardDB
 * @param {string} cardId - Card ID to update
 * @param {Partial<Card>} updatedCard - Fields to update
 * @returns {Promise<UpdateResult|null>} Update result or null
 * @throws {Error} If database operation fails
 */
export const updateCardDB = async (cardId: string, updatedCard: Partial<Card>) => {
    const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});
    try {
        dbLogger.info("Connecting to Card Database");
        await client.connect();
        const db = client.db(dbname);
        const objectId = new ObjectId(cardId)
        const result = await db.collection('cards').updateOne(
            {"_id": objectId},
            {$set: updatedCard},
            {upsert: false}
        );
        dbLogger.info(`Card(s) updated: ${result.modifiedCount.toString()}`);
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
 * Deletes a card by ID.
 * @async
 * @function deleteCardDB
 * @param {string} cardId - Card ID to delete
 * @returns {Promise} Delete result
 * @throws {Error} If database operation fails
 */
export const deleteCardDB = async (cardId: string) => {
    const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});
    try {
        dbLogger.info("Connecting to Card Database");
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
 * Lists all cards in database.
 * @async
 * @function listCardsDB
 * @returns {Promise<Card[]|null>} Array of cards or null
 * @throws {Error} If database operation fails
 */
export const listCardsDB = async () => {
    const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});
    try {
        dbLogger.info("Connecting to Card Database");
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

export const listCardsForUserDB = async (userId) => {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
        dbLogger.info("Connecting to Card Database");
        await client.connect();
        const db = client.db(dbname);

        // Count how many cards belong to this user
        const cardCount = await db.collection("cards").countDocuments({
            userId: userId
        });

        dbLogger.info(`User ${userId} has ${cardCount} cards`);
        return cardCount;
    } catch (error) {
        dbLogger.error({ message: "Error counting Cards for user", error });
        return null;
    } finally {
        await client.close();
        dbLogger.info("Connection closed");
    }
};

/**
 * Retrieves all card identifiers (hash mappings) associated with a user ID, with optional pagination, sorting, and filters.
 *
 * @param {string} userId - The user ID to filter by.
 * @param {Object} options - Optional query parameters.
 * @param {string} [options.sort] - Sort string like "createdAt:desc".
 * @param {number} [options.start=0] - Pagination start index.
 * @param {number} [options.limit=20] - Max number of results to return.
 * @param {Object} [options.where={}] - Additional filter conditions.
 * @returns {Promise<{ data: HashMap[]; total: number } | null>} Object containing array of identifiers and total count.
 */
export const getAllCardIdentifiersByUserIdDB = async (
    userId: string,
    options: {
        sort?: string;
        start?: number;
        limit?: number;
        where?: Record<string, any>;
    } = {}
): Promise<{ data: HashMap[]; total: number } | null> => {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        dbLogger.info(`Connecting to database to retrieve card identifiers for userId: ${userId}`);
        await client.connect();
        const db = client.db(dbname);

        const query = { userId, ...options.where };
        const sortObj: any = {};

        if (options.sort) {
            const [field, direction] = options.sort.split(":");
            sortObj[field] = direction === "desc" ? -1 : 1;
        }

        const collection = db.collection("cardHashMappings");

        const total = await collection.countDocuments(query);

        const data = await collection
            .find(query)
            .skip(options.start || 0)
            .limit(options.limit || 20)
            .sort(sortObj)
            .project({ _id: 0, cardId: 1, hash: 1, identifier: 1 }) // Only return necessary fields
            .toArray();

        dbLogger.info(`Found ${data.length} card identifier(s) for userId: ${userId}`);
        return { data, total };
    } catch (error) {
        dbLogger.error({ message: "Error retrieving card identifiers by userId", userId, error });
        return null;
    } finally {
        await client.close();
        dbLogger.info("Database connection closed");
    }
};


/**
 * Retrieves all cards associated with a user ID, supporting pagination, sorting, and filtering.
 *
 * @param {string} userId - The user ID to filter by.
 * @param {Object} options - Optional settings.
 * @param {string} [options.sort] - Sort string like "createdAt:desc".
 * @param {number} [options.start=0] - Offset for pagination.
 * @param {number} [options.limit=20] - Limit for pagination.
 * @param {Object} [options.where={}] - Additional filter conditions.
 * @returns {Promise<Card[]|null>} - Array of cards or null on failure.
 */
/**
 * Retrieves paginated and filtered cards associated with a specific user ID from the database.
 *
 * @async
 * @function getAllCardsByUserIdDB
 * @param {string} userId - The unique identifier of the user.
 * @param {object} options - Query options including sort, start, limit, and filters.
 * @param {string} [options.sort] - Sort order in "field:direction" format (e.g., "createdAt:desc").
 * @param {number} [options.start=0] - Pagination start index.
 * @param {number} [options.limit=20] - Number of results to return.
 * @param {Record<string, any>} [options.where] - Additional filter conditions.
 * @returns {Promise<{ data: Card[]; total: number } | null>} Object with card array and total count.
 *
 * @throws {Error} If the database operation fails.
 */
export const getAllCardsByUserIdDB = async (
    userId: string,
    options: {
        sort?: string;
        start?: number;
        limit?: number;
        where?: Record<string, any>;
    } = {}
): Promise<{ data: Card[]; total: number } | null> => {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        dbLogger.info(`Connecting to database to retrieve cards for userId: ${userId}`);
        await client.connect();
        const db = client.db(dbname);

        const query = { userId, ...options.where };
        const sortObj: any = {};

        if (options.sort) {
            const [field, direction] = options.sort.split(':');
            sortObj[field] = direction === 'desc' ? -1 : 1;
        }

        const collection = db.collection("cards");

        // const total = await collection.countDocuments(query);

        const data = await collection
            .find(query)
            .skip(options.start || 0)
            .limit(options.limit || 20)
            .sort(sortObj)
            .toArray();

        dbLogger.info(`Found ${data.length} card(s) for userId: ${userId}`);
        return data;
    } catch (error) {
        dbLogger.error({ message: "Error retrieving cards by userId", userId, error });
        return null;
    } finally {
        await client.close();
        dbLogger.info("Database connection closed");
    }
};

/**
 * Creates a hash mapping for a card.
 * @async
 * @function createHashMappingDB
 * @param {Object} mappingData - Mapping data to create
 * @param {string} mappingData.cardId - Card ID to map
 * @param {string} mappingData.identifier - Short identifier
 * @param {string} mappingData.hash - Full hash value
 * @param {string} mappingData.userId - Attached User
 * @returns {Promise<any>} Insert result
 * @throws {Error} If database operation fails
 */
export const createHashMappingDB = async (mappingData: {
    cardId: string | undefined;
    userId: string;
    identifier: string;
    hash: string
}): Promise<any> => {
    const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});
    try {
        dbLogger.info("Connecting to HashMapping Database");
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
 * Gets hash mapping by card ID.
 * @async
 * @function getCardHashMappingByCardIdDB
 * @param {string} cardId - Card ID to search for
 * @returns {Promise<any>} Mapping document
 * @throws {Error} If database operation fails
 */
export const getCardHashMappingByCardIdDB = async (cardId: string): Promise<any> => {
    const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});
    try {
        dbLogger.info("Connecting to HashMapping Database");
        await client.connect();
        const db = client.db(dbname);

        const mapping = await db.collection('cardHashMappings').findOne(cardId);
        dbLogger.info('Hash found:', mapping);
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
 * Updates a hash mapping.
 * @async
 * @function updateHashMappingDB
 * @param {string} cardId - Card ID to update mapping for
 * @param {Partial<{hash: string}>} updatedData - Fields to update
 * @returns {Promise<any>} Update result
 * @throws {Error} If database operation fails
 */
export const updateHashMappingDB = async (cardId: string, updatedData: Partial<{ hash: string }>): Promise<any> => {
    const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});
    try {
        dbLogger.info("Connecting to HashMapping Database");
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
 * Deletes a hash mapping.
 * @async
 * @function deleteHashMappingDB
 * @param {string} cardId - Card ID to delete mapping for
 * @returns {Promise<any>} Delete result
 * @throws {Error} If database operation fails
 */
export const deleteHashMappingDB = async (cardId: string): Promise<any> => {
    const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});
    try {
        dbLogger.info("Connecting to HashMapping Database");
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
 * Lists all hash mappings.
 * @async
 * @function listHashMappingsDB
 * @returns {Promise<any[]>} Array of mappings
 * @throws {Error} If database operation fails
 */
export const listHashMappingsDB = async (): Promise<any[]> => {
    const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});
    try {
        dbLogger.info("Connecting to HashMapping Database");
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
 * Creates a card metric record.
 * @async
 * @function createCardMetricDB
 * @param {any} cardMetricData - Metric data to create
 * @returns {Promise<any>} Insert result
 * @throws {Error} If database operation fails
 */
export const createCardMetricDB = async (cardMetricData: any) => {
    const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});
    try {
        dbLogger.info("Connecting to CardMetric Database");
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
 * Gets card metrics by ID.
 * @async
 * @function getCardMetricByIdDB
 * @param {string} cardMetricId - Metric ID to retrieve
 * @returns {Promise<any>} Metric document
 * @throws {Error} If database operation fails
 */
export const getCardMetricByIdDB = async (cardMetricId: string) => {
    const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});
    try {
        dbLogger.info("Connecting to CardMetric Database");
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
 * Gets card metrics by card ID.
 * @async
 * @function getCardMetricByCardIdDB
 * @param {string} cardId - Card ID to search for
 * @returns {Promise<any>} Metric document
 * @throws {Error} If database operation fails
 */
export const getCardMetricByCardIdDB = async (cardId: string) => {
    const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});
    try {
        dbLogger.info("Connecting to CardMetric Database");
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
 * Updates card metrics.
 * @async
 * @function updateCardMetricDB
 * @param {string} cardMetricId - Metric ID to update
 * @param {Partial<any>} updatedCardMetric - Fields to update
 * @returns {Promise<any>} Update result
 * @throws {Error} If database operation fails
 */
export const updateCardMetricDB = async (cardMetricId: string, updatedCardMetric: Partial<any>) => {
    const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});
    try {
        dbLogger.info("Connecting to CardMetric Database");
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
 * Deletes card metrics.
 * @async
 * @function deleteCardMetricDB
 * @param {string} cardId - Card ID to delete metrics for
 * @returns {Promise<any>} Delete result
 * @throws {Error} If database operation fails
 */
export const deleteCardMetricDB = async (cardId: string) => {
    const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});
    try {
        dbLogger.info("Connecting to CardMetric Database");
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
 * Lists all card metrics.
 * @async
 * @function listCardMetricsDB
 * @returns {Promise<any[]>} Array of metrics
 * @throws {Error} If database operation fails
 */
export const listCardMetricsDB = async () => {
    const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});
    try {
        dbLogger.info("Connecting to CardMetric Database");
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
 * Gets hash mapping by identifier.
 * @async
 * @function getCardHashMappingByIdDB
 * @param {string} mappingId - Mapping identifier
 * @returns {Promise<any>} Mapping document
 * @throws {Error} If database operation fails
 */
export const getCardHashMappingByIdDB = async (mappingId: string) => {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
        dbLogger.info("Connecting to CardMetric Database");
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
 * Gets hash mapping by hash value.
 * @async
 * @function getHashMappingByHashDB
 * @param {string} hash - Hash value to search for
 * @returns {Promise<any>} Mapping document
 * @throws {Error} If database operation fails
 */

export const getHashMappingByHashDB = async (hash: string): Promise<any> => {
    const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});
    try {
        dbLogger.info("Connecting to HashMapping Database");
        await client.connect();
        const db = client.db(dbname);

        const mapping = await db.collection('cardHashMappings').findOne({hash});
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
 * Gets hash mappings by card ID.
 * @async
 * @function getCardHashMappingsByCardIdDB
 * @param {string} cardId - Card ID to search for
 * @returns {Promise<any>} Mapping document
 * @throws {Error} If database operation fails
 */
export const getCardHashMappingsByCardIdDB = async (cardId: string) => {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
        dbLogger.info("Connecting to HashMapping Database");
        await client.connect();
        const db = client.db(dbname);

        const cardHashMapping = await db.collection('cardHashMappings').findOne({ cardId: cardId });
        dbLogger.info(`CardHashMapping found: ${cardHashMapping.identifier.toString()}`);
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
 * Updates hash mappings.
 * @async
 * @function updateCardHashMappingsDB
 * @param {string} mappingId - Mapping ID to update
 * @param {Partial<any>} updatedCardHashMapping - Fields to update
 * @returns {Promise<any>} Update result
 * @throws {Error} If database operation fails
 */
export const updateCardHashMappingsDB = async (mappingId: string, updatedCardHashMapping: Partial<any>) => {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
        dbLogger.info("Connecting to HashMapping Database");
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
 * Deletes hash mappings.
 * @async
 * @function deleteCardHashMappingsDB
 * @param {string} mappingId - Mapping ID to delete
 * @returns {Promise<any>} Delete result
 * @throws {Error} If database operation fails
 */
export const deleteCardHashMappingsDB = async (mappingId: string) => {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
        dbLogger.info("Connecting to HashMapping Database");
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
 * Lists all hash mappings.
 * @async
 * @function listCardHashMappingsDB
 * @returns {Promise<any[]>} Array of mappings
 * @throws {Error} If database operation fails
 */
export const listCardHashMappingsDB = async () => {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
        dbLogger.info("Connecting to HashMapping Database");
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
 * Creates an activity record.
 * @async
 * @function createActivityDB
 * @param {any} activityData - Activity data to create
 * @returns {Promise<any>} Insert result
 * @throws {Error} If database operation fails
 */
export const createActivityDB = async (activityData: any) => {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
        dbLogger.info("Connecting to Activities Database");
        await client.connect();
        const db = client.db(dbname);

        const result = await db.collection('activities').insertOne(activityData);
        dbLogger.info('Activity created:', result);
        return result;
    } catch (error) {
        dbLogger.error({ message: 'Error creating Activity', error });
        return null;
    } finally {
        await client.close();
        dbLogger.info("Connection closed");
    }
};

/**
 * Gets an activity by ID.
 * @async
 * @function getActivityByIdDB
 * @param {string} activityId - Activity ID to retrieve
 * @returns {Promise<any>} Activity document
 * @throws {Error} If database operation fails
 */
export const getActivityByIdDB = async (activityId: string) => {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
        dbLogger.info("Connecting to Activities Database");
        await client.connect();
        const db = client.db(dbname);

        const activity = await db.collection('activities').findOne({ _id: new ObjectId(activityId) });
        dbLogger.info(`Activity found: ${activity._id}`);
        return activity;
    } catch (error) {
        dbLogger.error({ message: 'Error retrieving Activity', error });
        return null;
    } finally {
        await client.close();
        dbLogger.info("Connection closed");
    }
};

/**
 * Gets activities by card ID.
 * @async
 * @function getActivitiesByCardIdDB
 * @param {string} cardId - Card ID to search for
 * @returns {Promise<any[]>} Array of activity documents
 * @throws {Error} If database operation fails
 */
export const getActivitiesByCardIdDB = async (cardId: string) => {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
        dbLogger.info("Connecting to Activities Database");
        await client.connect();
        const db = client.db(dbname);

        const activities = await db.collection('activities').find({ cardId }).toArray();
        dbLogger.info('Activities found:', activities);
        return activities;
    } catch (error) {
        dbLogger.error({ message: 'Error retrieving Activities by cardId', error });
        return null;
    } finally {
        await client.close();
        dbLogger.info("Connection closed");
    }
};

/**
 * Gets activities by user ID.
 * @async
 * @function getActivitiesByUserIdDB
 * @param {string} userId - User ID to search for
 * @returns {Promise<any[]>} Array of activity documents
 * @throws {Error} If database operation fails
 */
export const getActivitiesByUserIdDB = async (userId: string) => {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
        dbLogger.info("Connecting to Activities Database");
        await client.connect();
        const db = client.db(dbname);

        const activities = await db.collection('activities').find({ userId: new ObjectId(userId) }).toArray();
        dbLogger.info(`Activities for userId ${userId} found (${ activities.length}) activities`);
        return activities;
    } catch (error) {
        dbLogger.error({ message: 'Error retrieving Activities by userId', error });
        return null;
    } finally {
        await client.close();
        dbLogger.info("Connection closed");
    }
};

/**
 * Gets activities by business ID.
 * @async
 * @function getActivitiesByBusinessIdDB
 * @param {string} businessId - Business ID to search for
 * @returns {Promise<any[]>} Array of activity documents
 * @throws {Error} If database operation fails
 */
export const getActivitiesByBusinessIdDB = async (businessId: string) => {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
        dbLogger.info("Connecting to Activities Database");
        await client.connect();
        const db = client.db(dbname);

        const activities = await db.collection('activities').find({ businessId: new ObjectId(businessId) }).toArray();
        dbLogger.info(`Activities for businessId ${businessId} found (${ activities.length}) activities`);
        return activities;
    } catch (error) {
        dbLogger.error({ message: 'Error retrieving Activities by businessId', error });
        return null;
    } finally {
        await client.close();
        dbLogger.info("Connection closed");
    }
};

/**
 * Gets activities by type (e.g., "card", "user", "business").
 * @async
 * @function getActivitiesByTypeDB
 * @param {string} type - Activity type to search for
 * @returns {Promise<any[]>} Array of activity documents
 * @throws {Error} If database operation fails
 */
export const getActivitiesByTypeDB = async (type: string) => {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
        dbLogger.info("Connecting to Activities Database");
        await client.connect();
        const db = client.db(dbname);

        const activities = await db.collection('activities').find({ type }).toArray();
        dbLogger.info(`Activities of type ${type} found:`, activities);
        return activities;
    } catch (error) {
        dbLogger.error({ message: `Error retrieving Activities by type: ${type}`, error });
        return null;
    } finally {
        await client.close();
        dbLogger.info("Connection closed");
    }
};

/**
 * Updates an activity.
 * @async
 * @function updateActivityDB
 * @param {string} activityId - Activity ID to update
 * @param {Partial<any>} updatedActivity - Fields to update
 * @returns {Promise<any>} Update result
 * @throws {Error} If database operation fails
 */
export const updateActivityDB = async (activityId: string, updatedActivity: Partial<any>) => {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
        dbLogger.info("Connecting to Activities Database");
        await client.connect();
        const db = client.db(dbname);

        const result = await db.collection('activities').updateOne(
            { _id: new ObjectId(activityId) },
            { $set: updatedActivity },
            { upsert: false }
        );
        dbLogger.info('Activity updated:', result);
        return result;
    } catch (error) {
        dbLogger.error({ message: 'Error updating Activity', error });
        return null;
    } finally {
        await client.close();
        dbLogger.info("Connection closed");
    }
};

/**
 * Deletes an activity.
 * @async
 * @function deleteActivityDB
 * @param {string} activityId - Activity ID to delete
 * @returns {Promise<any>} Delete result
 * @throws {Error} If database operation fails
 */
export const deleteActivityDB = async (activityId: string) => {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
        dbLogger.info("Connecting to Activities Database");
        await client.connect();
        const db = client.db(dbname);

        const result = await db.collection('activities').deleteOne({ _id: new ObjectId(activityId) });
        dbLogger.info('Activity deleted:', result);
        return result;
    } catch (error) {
        dbLogger.error({ message: 'Error deleting Activity', error });
        return error;
    } finally {
        await client.close();
        dbLogger.info("Connection closed");
    }
};

/**
 * Lists all activities.
 * @async
 * @function listActivitiesDB
 * @returns {Promise<any[]>} Array of activity documents
 * @throws {Error} If database operation fails
 */
export const listActivitiesDB = async () => {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    try {
        dbLogger.info("Connecting to Activities Database");
        await client.connect();
        const db = client.db(dbname);

        const activities = await db.collection('activities').find().toArray();
        dbLogger.info('Activities found:', activities);
        return activities;
    } catch (error) {
        dbLogger.error({ message: 'Error listing Activities', error });
        return null;
    } finally {
        await client.close();
        dbLogger.info("Connection closed");
    }
};

export const getTotalTapsByUser = async (userId: string) => {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    dbLogger.info("Connecting to Cards Database");
    await client.connect();
    const db = client.db(dbname);
    const result = await db.collection("cards").aggregate([
        { $match: { userId: userId } },
        { $group: {
                _id: "$userId",
                totalTaps: { $sum: "$tapCount" }
            }}
    ]).toArray();

    return result.length > 0 ? result[0].totalTaps : 0;
}

export const getUserLastTapDB = async (userId: string): Promise<string> => {
    const client = new MongoClient(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    } as any);

    try {
        await client.connect();
        const db = client.db(dbname);

        // grab all cards for this user
        const cards = await db.collection("cards")
            .find({ userId: userId })
            .toArray();

        if (!cards || cards.length === 0) {
            return null; // no cards = no taps
        }

        // flatten taps from all cards
        const allTaps = cards.flatMap(card => card.taps || []);

        if (allTaps.length === 0) {
            return null; // no taps recorded
        }

        // use util to calculate the last tap
        return utils.getLastTapDate(allTaps);

    } catch (err) {
        dbLogger?.error("Error fetching user last tap", err);
        throw err;
    } finally {
        await client.close();
    }
};

// export const aggregateDashboardData = async (userId: string) => {
//     const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
//
// }

/**
 * Aggregates data across collections for a card.
 * @async
 * @function aggregateDataDB
 * @param {string} identifier - Card identifier
 * @returns {Promise<any>} Aggregated data
 * @throws {Error} If database operation fails
 */
export const aggregateDataDB = async (identifier: string) => {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        dbLogger.info("Connecting to Aggregation Database");
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

