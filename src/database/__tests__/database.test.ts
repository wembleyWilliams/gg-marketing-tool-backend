import * as db from '../index';
import {BusinessData, VCardData} from "../../models/types";
import {ObjectId} from "mongodb";
import {aggregateDataDB, getBusinessByUserIdDB} from "../index";
import {getBusinessByUserId} from "../../router/business";


const MongoClient = require('mongodb').MongoClient;
jest.mock('mongodb');
// jest.mock('./dbLogger');

// Mock data
const businessData: BusinessData = {
    industry: "Technology",
    phone: "123-456-7890",
    _id: "60a2b91b2b8c9e1234567890",
    name: "Tech Solutions LLC",
    description: "A leading provider of tech solutions for businesses.",
    website: '',
    userId: "6719b3a31eac0bf46b6dakjd",
    createdAt: "",
    updatedAt: "",
    logo: {
        mediaType: "base64EncodedLogoData",
        base64: true
    },
    // contact: {
    //     firstname: "Jane",
    //     lastname: "Smith",
    //     phoneNumbers: [{
    //         countryCode: "+1",
    //         digits: "1234567890",
    //         label: "Work",
    //         number: "123-456-7890"
    //     }],
    //     emails: [{
    //         email: "jane.smith@techsolutions.com",
    //         label: "Work"
    //     }],
    //     addresses: [{
    //         city: "New York",
    //         country: "USA",
    //         isoCountryCode: "US",
    //         label: "Work",
    //         postalCode: "10001",
    //         region: "NY",
    //         street: "456 Tech Blvd"
    //     }],
    //     contactType: "Business"
    // },
    address: {
        label: "home",
        street: "456 Tech Blvd",
        city: "New York",
        state: "NY",
        postalCode: "10001",
        country: "USA"
    },
    contactEmail: "contact@techsolutions.com",
    socials: [{
        userId: "123test",
        businessId: "123test",
        platform: "LinkedIn",
        profileName: "Tech Solutions",
        profileUrl: "https://linkedin.com/company/tech-solutions",
        created_at: "test",
        updated_at: "test"
    }]
};

describe('BUSINESS Table CRUD Operations', () => {
    describe('createBusinessDB', () => {
        let mockClient: any;
        beforeEach(() => {
            mockClient = {
                connect: jest.fn(),
                db: jest.fn().mockReturnValue({
                    collection: jest.fn().mockReturnValue({
                        insertOne: jest.fn().mockResolvedValue({insertedId: 'mockedId'}),
                    }),
                }),
                close: jest.fn(),
            };
            MongoClient.mockReturnValue(mockClient);
        });

        it('should insert business data into the database', async () => {
            const result = await db.createBusinessDB(businessData);
            expect(mockClient.connect).toHaveBeenCalledTimes(1);
            expect(mockClient.db().collection().insertOne).toHaveBeenCalledWith(businessData);
            expect(result).toEqual({insertedId: 'mockedId'});
            expect(mockClient.close).toHaveBeenCalledTimes(1);
        });

        it('should log an error if insertion fails', async () => {
            mockClient.db().collection().insertOne.mockRejectedValue(new Error('Insert failed'));
            await expect(db.createBusinessDB(businessData)).rejects.toThrow('Insert failed');
        });
    });

    describe('updateBusinessDB', () => {

        const mockId = new ObjectId('1234');
        const updateDetails = {name: "Test Name"};
        let mockClient: any;

        beforeEach(() => {
            mockClient = {
                connect: jest.fn(),
                db: jest.fn().mockReturnValue({
                    collection: jest.fn().mockReturnValue({
                        updateOne: jest.fn().mockResolvedValue({matchedCount: 1, modifiedCount: 1}),
                    }),
                }),
                close: jest.fn(),
            };
            MongoClient.mockReturnValue(mockClient);
        });

        it('should update a business by ID in the database', async () => {
            const result = await db.updateBusinessDB(mockId, updateDetails);
            expect(mockClient.connect).toHaveBeenCalledTimes(1);
            expect(mockClient.db().collection().updateOne).toHaveBeenCalledWith({_id: mockId}, {$set: updateDetails});
            expect(result).toEqual({matchedCount: 1, modifiedCount: 1});
            expect(mockClient.close).toHaveBeenCalledTimes(1);
        });

        it('should throw an error if update fails', async () => {
            mockClient.db().collection().updateOne.mockRejectedValue(new Error('Update failed'));
            await expect(db.updateBusinessDB(mockId, updateDetails)).rejects.toThrow('Update failed');
        });
    });

    describe('deleteBusinessDB', () => {
        jest.mock('mongodb', () => ({
            MongoClient: jest.fn(),
        }));
        let mockClient: any;
        const mockId = '1234';
        beforeEach(() => {
            mockClient = {
                connect: jest.fn(),
                db: jest.fn().mockReturnValue({
                    collection: jest.fn().mockReturnValue({
                        deleteOne: jest.fn().mockResolvedValue({deletedCount: 1}),
                    }),
                }),
                close: jest.fn(),
            };
            MongoClient.mockReturnValue(mockClient);
        });

        it('should delete a business by ID from the database', async () => {
            const result = await db.deleteBusinessDB(mockId);
            expect(mockClient.connect).toHaveBeenCalledTimes(1);
            expect(mockClient.db().collection().deleteOne).toHaveBeenCalled();
            expect(result).toEqual({deletedCount: 1});
            expect(mockClient.close).toHaveBeenCalledTimes(1);
        });

        it('should throw an error if deletion fails', async () => {
            mockClient.db().collection().deleteOne.mockRejectedValue(new Error('Delete failed'));
            await expect(db.deleteBusinessDB(mockId)).rejects.toThrow('Delete failed');
        });
    });

    describe('getBusinessByIdDB', () => {
        const mockId = '60a2b91b2b8c9e1234567890';
        let mockClient: any;

        beforeEach(() => {
            mockClient = {
                connect: jest.fn(),
                db: jest.fn().mockReturnValue({
                    collection: jest.fn().mockReturnValue({
                        findOne: jest.fn().mockResolvedValue({_id: mockId}), // Ensure it's returning ObjectId
                    }),
                }),
                close: jest.fn(),
            };
            MongoClient.mockReturnValue(mockClient);
        });

        it('should retrieve a business by ID from the database', async () => {
            const result = await db.getBusinessByIdDB(mockId);
            expect(mockClient.connect).toHaveBeenCalledTimes(1);
            // Ensure that the query uses the ObjectId type
            expect(mockClient.db().collection().findOne).toHaveBeenCalled();

            // Compare the string value of the _id
            expect(result._id.toString()).toBe(mockId);
        });

        it('should log an error if retrieval fails', async () => {
            mockClient.db().collection().findOne.mockRejectedValue(new Error('Find failed'));
            await expect(db.getBusinessByIdDB(mockId)).rejects.toThrow('Find failed');
        });
    });

    describe('getBusinessByUserIdDB', () => {
        let mockClient: any;
        const mockUserId = 'mockUserId';
        const mockBusinessData: BusinessData = {
            industry: "Technology",
            phone: "123-456-7890",
            _id: "60a2b91b2b8c9e1234567890",
            name: "Tech Solutions LLC",
            description: "A leading provider of tech solutions for businesses.",
            website: '',
            userId: mockUserId,
            createdAt: "",
            updatedAt: "",
            logo: {
                mediaType: "base64EncodedLogoData",
                base64: true
            },
            // contact: {
            //     firstname: "Jane",
            //     lastname: "Smith",
            //     phoneNumbers: [{
            //         countryCode: "+1",
            //         digits: "1234567890",
            //         label: "Work",
            //         number: "123-456-7890"
            //     }],
            //     emails: [{
            //         email: "jane.smith@techsolutions.com",
            //         label: "Work"
            //     }],
            //     addresses: [{
            //         city: "New York",
            //         country: "USA",
            //         isoCountryCode: "US",
            //         label: "Work",
            //         postalCode: "10001",
            //         region: "NY",
            //         street: "456 Tech Blvd"
            //     }],
            //     contactType: "Business"
            // },
            address: {
                label: "home",
                street: "456 Tech Blvd",
                city: "New York",
                state: "NY",
                postalCode: "10001",
                country: "USA"
            },
            contactEmail: "contact@techsolutions.com",
            socials: [{
                userId: "123test",
                businessId: "123test",
                platform: "LinkedIn",
                profileName: "Tech Solutions",
                profileUrl: "https://linkedin.com/company/tech-solutions",
                created_at: "test",
                updated_at: "test"
            }]
        };

        beforeEach(() => {
            mockClient = {
                connect: jest.fn(),
                db: jest.fn().mockReturnValue({
                    collection: jest.fn().mockReturnValue({
                        findOne: jest.fn().mockResolvedValue(mockBusinessData), // Mock successful find
                    }),
                }),
                close: jest.fn(),
            };
            MongoClient.mockReturnValue(mockClient);
        });

        afterEach(() => {
            jest.clearAllMocks(); // Clear mocks after each test
        });

        it('should retrieve a business by user ID from the database', async () => {
            const result = await db.getBusinessByUserIdDB(mockUserId); // Call the function being tested
            const mockUserObjectId = new ObjectId(mockUserId);
            expect(mockClient.connect).toHaveBeenCalledTimes(1); // Check if connect was called
            expect(mockClient.db().collection().findOne).toHaveBeenCalled(); // Check if findOne was called with the correct userId
            expect(result).toEqual(mockBusinessData); // Check if the result is as expected
            expect(mockClient.close).toHaveBeenCalledTimes(1); // Ensure that the connection is closed
        });

        it('should log an error if retrieval fails', async () => {
            const mockError = new Error('Find failed');
            mockClient.db().collection().findOne.mockRejectedValue(mockError); // Mock error during retrieval

            await expect(db.getBusinessByUserIdDB(mockUserId)).rejects.toThrow('Find failed'); // Expect function to throw the error
            expect(mockClient.close).toHaveBeenCalledTimes(1); // Ensure that the connection is closed
        });
    });
});

describe('updateLogoDB', () => {
    jest.mock('mongodb', () => ({
        MongoClient: jest.fn(),
        ObjectId: jest.fn((id) => id), // Mock ObjectId to return the id string
    }));

    const mockLogger = {
        info: jest.fn(),
        error: jest.fn(),
    };

    const mockBusinessId = '60a2b91b2b8c9e1234567890';
    const mockLogo = {
        mime: 'image/png',
        data: 'mockImageData',
    };
    let mockClient: any;

    beforeEach(() => {
        mockClient = {
            connect: jest.fn().mockResolvedValue(true),
            db: jest.fn().mockReturnValue({
                collection: jest.fn().mockReturnValue({
                    updateOne: jest.fn().mockResolvedValue({matchedCount: 1, modifiedCount: 1}),
                }),
            }),
            close: jest.fn(),
        };
        MongoClient.mockReturnValue(mockClient);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should connect to the database and update the business logo', async () => {
        const result = await db.updateLogoDB(mockBusinessId, mockLogo);

        expect(mockClient.connect).toHaveBeenCalledTimes(1);
        expect(mockClient.db().collection().updateOne).toHaveBeenCalledWith(
            {"_id": {$ne: `${new ObjectId(mockBusinessId)}`}},
            {
                $set: {
                    "logo": {
                        "mime": mockLogo.mime,
                        "data": mockLogo.data
                    }
                }
            },
            {"upsert": false}
        );

        expect(result).toEqual({matchedCount: 1, modifiedCount: 1});
        expect(mockClient.close).toHaveBeenCalledTimes(1);
    });

    it('should log an error if the update fails', async () => {
        mockClient.db().collection().updateOne.mockRejectedValue(new Error('Find failed'));
        await expect(db.updateLogoDB(mockBusinessId, mockLogo)).rejects.toThrow('Find failed');
        expect(mockClient.close).toHaveBeenCalledTimes(1);

    });
});

describe('VCARD table CRUD Operations', () => {

    describe('createVCardDB', () => {
        jest.mock('mongodb', () => ({
            MongoClient: jest.fn(),
        }));

        let mockClient: any;
        const mockVCardData = {name: 'John Doe', phone: '123-456-7890', email: 'johndoe@example.com'};

        beforeEach(() => {
            mockClient = {
                connect: jest.fn(),
                db: jest.fn().mockReturnValue({
                    collection: jest.fn().mockReturnValue({
                        insertOne: jest.fn().mockResolvedValue({insertedId: 'mockVCardId'}),
                    }),
                }),
                close: jest.fn(),
            };
            MongoClient.mockReturnValue(mockClient);
        });

        it('should insert vCard data into the database', async () => {
            const result = await db.createVCardDB(mockVCardData);
            expect(mockClient.db().collection().insertOne).toHaveBeenCalledWith(mockVCardData);
            expect(mockClient.connect).toHaveBeenCalledTimes(1);
            expect(result).toEqual({insertedId: 'mockVCardId'});
        });

        it('should return null if an error occurs', async () => {
            mockClient.db().collection().insertOne.mockRejectedValue(new Error('Insert failed'));
            const result = await db.createVCardDB(mockVCardData);
            expect(result).toBeNull();
        });
    });

    describe('getVCardByIdDB', () => {

        let mockClient: any;
        const mockOwnerId = '60a2b91b2b8c9e1234567890';
        const mockVCardData = {
            ownerId: mockOwnerId,
            name: 'John Doe',
            phone: '123-456-7890',
            email: 'johndoe@example.com'
        };

        beforeEach(() => {
            mockClient = {
                connect: jest.fn(),
                db: jest.fn().mockReturnValue({
                    collection: jest.fn().mockReturnValue({
                        findOne: jest.fn().mockResolvedValue(mockVCardData),
                    }),
                }),
                close: jest.fn(),
            };
            MongoClient.mockReturnValue(mockClient);
        });

        it('should retrieve a VCard by owner ID from the database', async () => {
            const result = await db.getVCardByIdDB(mockOwnerId);

            expect(mockClient.connect).toHaveBeenCalledTimes(1);
            expect(mockClient.db().collection().findOne).toHaveBeenCalledWith({ownerId: mockOwnerId});
            expect(result).toEqual(mockVCardData);
        });

        it('should return null if an error occurs', async () => {
            mockClient.db().collection().findOne.mockRejectedValue(new Error('Find failed'));

            const result = await db.getVCardByIdDB(mockOwnerId);

            expect(result).toBeNull();
        });
    });

    describe('updateVCardDB', () => {
        let mockClient: any;
        const mockOwnerId = '60a2b91b2b8c9e1234567890';
        const mockUpdatedVCard: Partial<VCardData> = {formattedName: 'Jane Doe', cellPhone: '987-654-3210'};
        const mockUpdateResult = {modifiedCount: 1};

        beforeEach(() => {
            mockClient = {
                connect: jest.fn(),
                db: jest.fn().mockReturnValue({
                    collection: jest.fn().mockReturnValue({
                        updateOne: jest.fn().mockResolvedValue(mockUpdateResult),
                    }),
                }),
                close: jest.fn(),
            };
            MongoClient.mockReturnValue(mockClient);
        });

        it('should update a VCard by owner ID in the database', async () => {
            const result = await db.updateVCardDB(mockOwnerId, mockUpdatedVCard);

            expect(mockClient.connect).toHaveBeenCalledTimes(1);
            expect(mockClient.db().collection().updateOne).toHaveBeenCalledWith(
                {ownerId: mockOwnerId},
                {$set: mockUpdatedVCard},
                {upsert: false}
            );
            expect(result).toEqual(mockUpdateResult);
        });

        it('should return null if an error occurs', async () => {
            mockClient.db().collection().updateOne.mockRejectedValue(new Error('Update failed'));

            const result = await db.updateVCardDB(mockOwnerId, mockUpdatedVCard);

            expect(result).toBeNull();
        });
    });

    describe('deleteVCardDB', () => {
        let mockClient: any;
        const mockVCardId = '60a2b91b2b8c9e1234567890';
        const mockDeleteResult = {deletedCount: 1};

        beforeEach(() => {

            mockClient = {
                connect: jest.fn(),
                db: jest.fn().mockReturnValue({
                    collection: jest.fn().mockReturnValue({
                        deleteOne: jest.fn().mockResolvedValue(mockDeleteResult),
                    }),
                }),
                close: jest.fn(),
            };
            MongoClient.mockReturnValue(mockClient);
        });

        it('should delete a VCard by ID from the database', async () => {
            const result = await db.deleteVCardDB(mockVCardId);
            // const objectId = new ObjectId(mockVCardId)
            expect(mockClient.connect).toHaveBeenCalledTimes(1);
            expect(mockClient.db().collection().deleteOne).toHaveBeenCalled();
            expect(result).toEqual({deletedCount: 1});
        });

        it('should return null if an error occurs', async () => {
            mockClient.db().collection().deleteOne.mockRejectedValue(new Error('Delete failed'));

            const result = await db.deleteVCardDB(mockVCardId);

            expect(result).toBeNull();
        });
    });

    describe('listVCardsDB', () => {
        let mockClient: any;
        const mockVCards = [
            {_id: '60a2b91b2b8c9e1234567890', name: 'John Doe'},
            {_id: '60a2b91b2b8c9e1234567891', name: 'Jane Doe'},
        ];

        beforeEach(() => {
            mockClient = {
                connect: jest.fn(),
                db: jest.fn().mockReturnValue({
                    collection: jest.fn().mockReturnValue({
                        find: jest.fn().mockReturnValue({
                            toArray: jest.fn().mockResolvedValue(mockVCards),
                        }),
                    }),
                }),
                close: jest.fn(),
            };
            MongoClient.mockReturnValue(mockClient);
        });

        it('should list all VCARDs from the database', async () => {
            const result = await db.listVCardsDB();

            expect(mockClient.connect).toHaveBeenCalledTimes(1);
            expect(mockClient.db().collection().find().toArray).toHaveBeenCalled();
            expect(result).toEqual(mockVCards);
        });

        it('should return null if an error occurs', async () => {
            mockClient.db().collection().find().toArray.mockRejectedValue(new Error('Find failed'));

            const result = await db.listVCardsDB();

            expect(result).toBeNull();
        });
    });

})

describe('USER table CRUD Operations', () => {
    describe('createUserDB', () => {
        let mockClient: any;
        const newUser: any = {name: 'John Doe', email: 'john@example.com'};

        beforeEach(() => {
            mockClient = {
                connect: jest.fn(),
                db: jest.fn().mockReturnValue({
                    collection: jest.fn().mockReturnValue({
                        insertOne: jest.fn().mockResolvedValue({insertedId: '60a2b91b2b8c9e1234567890'}),
                    }),
                }),
                close: jest.fn(),
            };
            MongoClient.mockReturnValue(mockClient);
        });

        it('should create a new user in the database', async () => {
            const result = await db.createUserDB(newUser);

            expect(mockClient.connect).toHaveBeenCalledTimes(1);
            expect(mockClient.db().collection('users').insertOne).toHaveBeenCalledWith(expect.objectContaining(newUser));
            expect(result).toEqual({insertedId: '60a2b91b2b8c9e1234567890'});
        });

        it('should return null if an error occurs', async () => {
            mockClient.db().collection('users').insertOne.mockRejectedValue(new Error('Insert failed'));

            const result = await db.createUserDB(newUser);
            expect(result).toBeNull();
        });
    });

    describe('getUserByIdDB', () => {
        let mockClient: any;
        const mockId = '60a2b91b2b8c9e1234567890';

        beforeEach(() => {
            mockClient = {
                connect: jest.fn(),
                db: jest.fn().mockReturnValue({
                    collection: jest.fn().mockReturnValue({
                        findOne: jest.fn().mockResolvedValue({_id: new ObjectId(mockId), name: 'John Doe'}),
                    }),
                }),
                close: jest.fn(),
            };
            MongoClient.mockReturnValue(mockClient);
        });

        it('should retrieve a user by their ID', async () => {
            const result = await db.getUserByIdDB(mockId);

            expect(mockClient.connect).toHaveBeenCalledTimes(1);
            expect(result).toMatchObject({name: 'John Doe'});
        });

        it('should return null if an error occurs', async () => {
            mockClient.db().collection('users').findOne.mockRejectedValue(new Error('Find failed'));

            const result = await db.getUserByIdDB(mockId);
            expect(result).toBeNull();
        });
    });

    describe('getUserByEmailDB', () => {
        let mockClient: any;
        const userEmail = 'john@example.com';

        beforeEach(() => {
            mockClient = {
                connect: jest.fn(),
                db: jest.fn().mockReturnValue({
                    collection: jest.fn().mockReturnValue({
                        findOne: jest.fn().mockResolvedValue({email: userEmail}),
                    }),
                }),
                close: jest.fn(),
            };
            MongoClient.mockReturnValue(mockClient);
        });

        it('should retrieve a user by their email', async () => {
            const result = await db.getUserByEmailDB(userEmail);

            expect(mockClient.connect).toHaveBeenCalledTimes(1);
            expect(result).toMatchObject({email: userEmail});
        });

        it('should return null if an error occurs', async () => {
            mockClient.db().collection('users').findOne.mockRejectedValue(new Error('Find failed'));

            const result = await db.getUserByEmailDB(userEmail);
            expect(result).toBeNull();
        });
    });

    describe('updateUserDB', () => {
        let mockClient: any;
        const mockId = '60a2b91b2b8c9e1234567890';
        const updatedUser = {name: 'John Updated', email: 'john.updated@example.com'};

        beforeEach(() => {
            mockClient = {
                connect: jest.fn(),
                db: jest.fn().mockReturnValue({
                    collection: jest.fn().mockReturnValue({
                        updateOne: jest.fn().mockResolvedValue({modifiedCount: 1}),
                    }),
                }),
                close: jest.fn(),
            };
            MongoClient.mockReturnValue(mockClient);
        });

        it('should update a user by their ID', async () => {
            const result = await db.updateUserDB(mockId, updatedUser);

            expect(mockClient.connect).toHaveBeenCalledTimes(1);
            expect(result).toEqual({modifiedCount: 1});
        });

        it('should return null if an error occurs', async () => {
            mockClient.db().collection('users').updateOne.mockRejectedValue(new Error('Update failed'));

            const result = await db.updateUserDB(mockId, updatedUser);
            expect(result).toBeNull();
        });
    });

    describe('deleteUserDB', () => {
        let mockClient: any;
        const mockId = '60a2b91b2b8c9e1234567890';

        beforeEach(() => {
            mockClient = {
                connect: jest.fn(),
                db: jest.fn().mockReturnValue({
                    collection: jest.fn().mockReturnValue({
                        deleteOne: jest.fn().mockResolvedValue({deletedCount: 1}),
                    }),
                }),
                close: jest.fn(),
            };
            MongoClient.mockReturnValue(mockClient);
        });

        it('should delete a user by their ID', async () => {
            const result = await db.deleteUserDB(mockId);

            expect(mockClient.connect).toHaveBeenCalledTimes(1);
            expect(result).toEqual({deletedCount: 1});
        });

        it('should throw an error if delete fails', async () => {
            mockClient.db().collection('users').deleteOne.mockRejectedValue(new Error('Delete failed'));

            await expect(db.deleteUserDB(mockId)).rejects.toThrow('Delete failed');
        });
    });

    describe('listUsersDB', () => {
        let mockClient: any;
        const mockUsers = [
            {_id: '60a2b91b2b8c9e1234567890', name: 'John Doe'},
            {_id: '60a2b91b2b8c9e1234567891', name: 'Jane Doe'},
        ];

        beforeEach(() => {
            mockClient = {
                connect: jest.fn(),
                db: jest.fn().mockReturnValue({
                    collection: jest.fn().mockReturnValue({
                        find: jest.fn().mockReturnValue({
                            toArray: jest.fn().mockResolvedValue(mockUsers),
                        }),
                    }),
                }),
                close: jest.fn(),
            };
            MongoClient.mockReturnValue(mockClient);
        });

        it('should list all users from the database', async () => {
            const result = await db.listUsersDB();

            expect(mockClient.connect).toHaveBeenCalledTimes(1);
            expect(result).toEqual(mockUsers);
        });

        it('should throw an error if list fails', async () => {
            mockClient.db().collection('users').find().toArray.mockRejectedValue(new Error('Find failed'));

            await expect(db.listUsersDB()).rejects.toThrow('Find failed');
        });
    });
})

describe('healthDB', () => {
    let mockClient: any;

    beforeEach(() => {
        mockClient = {
            close: jest.fn(),
        };
        MongoClient.mockReturnValue(mockClient);
    });

    it('should return healthy status when DB connection is successful', async () => {
        const result = await db.healthDB();

        expect(result.status).toBe('healthy');
        expect(result.dbConnection).toBe('connected');
    });

    it('should throw an error if DB connection fails', async () => {
        MongoClient.mockImplementationOnce(() => {
            throw new Error('Connection failed');
        });

        await expect(db.healthDB()).rejects.toThrow('Connection failed');
    });
});

describe('SOCIALS Table CRUD Operations', () => {
    let mockClient: any;
    const mockSocial = {
        user_id: 'user123',
        socialMediaPlatform: 'Instagram',
        profileName: 'john_doe',
        profileUrl: 'https://www.instagram.com/john_doe',
    };

    beforeEach(() => {
        mockClient = {
            connect: jest.fn(),
            db: jest.fn().mockReturnValue({
                collection: jest.fn().mockReturnValue({
                    insertOne: jest.fn().mockResolvedValue({insertedId: 'mockedSocialId'}),
                    findOne: jest.fn().mockResolvedValue(mockSocial),
                    find: jest.fn().mockReturnValue({
                        toArray: jest.fn().mockResolvedValue([mockSocial]),
                    }),
                    updateOne: jest.fn().mockResolvedValue({modifiedCount: 1}),
                    deleteOne: jest.fn().mockResolvedValue({deletedCount: 1}),
                }),
            }),
            close: jest.fn(),
        };
        MongoClient.mockReturnValue(mockClient);
    });

    // Test for Creating a Social Entry
    describe('createSocialDB', () => {
        it('should insert social data into the database', async () => {
            const result = await db.createSocialDB(mockSocial);
            expect(mockClient.connect).toHaveBeenCalledTimes(1);
            expect(mockClient.db().collection().insertOne).toHaveBeenCalledWith(mockSocial);
            expect(result).toEqual({insertedId: 'mockedSocialId'});
            expect(mockClient.close).toHaveBeenCalledTimes(1);
        });

        it('should log an error if insertion fails', async () => {
            mockClient.db().collection().insertOne.mockRejectedValue(new Error('Insert failed'));
            await expect(db.createSocialDB(mockSocial)).rejects.toThrow('Insert failed');
        });
    });

    // Test for Reading a Single Social Entry
    describe('getSocialDB', () => {
        it('should retrieve a social record by social_id', async () => {
            const result = await db.getSocialDB('mockedSocialId');
            expect(mockClient.connect).toHaveBeenCalledTimes(1);
            expect(mockClient.db().collection().findOne).toHaveBeenCalled();
            expect(result).toEqual(mockSocial);
            expect(mockClient.close).toHaveBeenCalledTimes(1);
        });

        it('should log an error if retrieval fails', async () => {
            mockClient.db().collection().findOne.mockRejectedValue(new Error('Find failed'));
            await expect(db.getSocialDB('mockedSocialId')).rejects.toThrow('Find failed');
        });
    });

    // Test for Reading Social Entries by User ID
    describe('getSocialByUserIdDB', () => {
        it('should retrieve social records by user ID', async () => {
            const userId = 'mockedUserId';
            const result = await db.getSocialByUserIdDB(userId);
            expect(mockClient.connect).toHaveBeenCalledTimes(1);
            expect(mockClient.db().collection().find).toHaveBeenCalledWith({userId: userId});
            expect(mockClient.db().collection().find().toArray).toHaveBeenCalledTimes(1);
            expect(result).toEqual([mockSocial]); // Expecting an array with mockSocial
            expect(mockClient.close).toHaveBeenCalledTimes(1);
        });

        it('should log an error if retrieval fails', async () => {
            const userId = 'mockedUserId';
            mockClient.db().collection().find().toArray.mockRejectedValue(new Error('Find failed'));
            await expect(db.getSocialByUserIdDB(userId)).rejects.toThrow('Find failed');
        });
    });

    // Test for Reading All Social Entries for a User
    describe('getAllSocialsForUserDB', () => {
        it('should retrieve all social records for a user', async () => {
            const result = await db.getAllSocialsForUserDB('user123');
            expect(mockClient.connect).toHaveBeenCalledTimes(1);
            expect(mockClient.db().collection().find).toHaveBeenCalledWith({user_id: 'user123'});
            expect(result).toEqual([mockSocial]);
            expect(mockClient.close).toHaveBeenCalledTimes(1);
        });

        it('should log an error if retrieval fails', async () => {
            mockClient.db().collection().find.mockReturnValue({
                toArray: jest.fn().mockRejectedValue(new Error('Find failed')),
            });
            await expect(db.getAllSocialsForUserDB('user123')).rejects.toThrow('Find failed');
        });
    });

    // Test for Updating a Social Entry
    describe('updateSocialDB', () => {
        const updatedSocial = {
            socialMediaPlatform: 'LinkedIn',
            profileName: 'john_linkedin',
            profileUrl: 'https://www.linkedin.com/in/john_linkedin',
        };

        it('should update a social record', async () => {
            const result = await db.updateSocialDB('mockedSocialId', updatedSocial);
            expect(mockClient.connect).toHaveBeenCalledTimes(1);
            expect(mockClient.db().collection().updateOne).toHaveBeenCalledWith(
                {_id: 'mockedSocialId'},
                {$set: updatedSocial}
            );
            expect(result).toEqual({modifiedCount: 1});
            expect(mockClient.close).toHaveBeenCalledTimes(1);
        });

        it('should log an error if update fails', async () => {
            mockClient.db().collection().updateOne.mockRejectedValue(new Error('Update failed'));
            await expect(db.updateSocialDB('mockedSocialId', updatedSocial)).rejects.toThrow('Update failed');
        });
    });

    // Test for Deleting a Social Entry
    describe('deleteSocialDB', () => {
        it('should delete a social record by social_id', async () => {
            const result = await db.deleteSocialDB('mockedSocialId');
            expect(mockClient.connect).toHaveBeenCalledTimes(1);
            expect(mockClient.db().collection().deleteOne).toHaveBeenCalledWith({"_id": 'mockedSocialId'});
            expect(result).toEqual({deletedCount: 1});
            expect(mockClient.close).toHaveBeenCalledTimes(1);
        });

        it('should log an error if deletion fails', async () => {
            mockClient.db().collection().deleteOne.mockRejectedValue(new Error('Delete failed'));
            await expect(db.deleteSocialDB('mockedSocialId')).rejects.toThrow('Delete failed');
        });
    });
});


describe('aggregateData', () => {
    const mockUserId = '6691e624884c396e75262f7f';
    const mockObjectId = new ObjectId(mockUserId);

    const mockClient = {
        connect: jest.fn(),
        close: jest.fn(),
        db: jest.fn().mockReturnThis(),
        collection: jest.fn(),
    };

    const mockCollection = {
        aggregate: jest.fn().mockReturnValue({
            toArray: jest.fn().mockResolvedValue([
                {
                    _id: "6719b3a31eac0b05bf46b6da",
                    name: "Phoenix Prime",
                    industry: "Transportation/Delivery",
                    address: {country: "Jamaica"},
                    website: "https://phoenixprime.io",
                    contactEmail: "",
                    phone: "+1-876-458-6888",
                    socials: [],
                    description: "Taxi and delivery platform",
                    logo: {mime: "image/png;base64", data: "iVBOR..."},
                    userData: {
                        firstName: "Shayne",
                        lastName: "Hacker",
                        email: "shaynhacker@gmail.com",
                    },
                    roleData: {role: "Owner"},
                    socialsData: [{platform: "Instagram", profileName: "Phoenix Prime 876", profileUrl:"jkjajnksnakjdn"}],
                    vcardData: {
                        firstName: "Shayne",
                        lastName: "Hacker",
                        organization: "Phoenix Prime",
                        title: "CEO",
                        phone: "+1-876-458-6888"
                    },
                }
            ]),
        }),
    };

    beforeAll(() => {
        MongoClient.mockImplementation(() => mockClient);
        mockClient.collection.mockReturnValue(mockCollection);
    });

    // it('should connect to the database, aggregate data correctly, and return the expected result', async () => {
    //     const result = await aggregateData(mockUserId);
    //
    //     expect(mockClient.connect).toHaveBeenCalled();
    //     expect(mockClient.db).toHaveBeenCalledWith('athenadb');
    //     expect(mockClient.collection).toHaveBeenCalledWith('businesses');
    //     expect(mockCollection.aggregate).toHaveBeenCalledWith([
    //         { $match: { userId: mockObjectId } },
    //         { $lookup: expect.any(Object) },
    //         { $lookup: expect.any(Object) },
    //         { $lookup: expect.any(Object) },
    //         { $lookup: expect.any(Object) },
    //         { $project: expect.any(Object) },
    //     ]);
    //     expect(result).toEqual([
    //         {
    //             _id: "6719b3a31eac0b05bf46b6da",
    //             name: "Phoenix Prime",
    //             industry: "Transportation/Delivery",
    //             address: { country: "Jamaica" },
    //             website: "https://phoenixprime.io",
    //             contactEmail: "",
    //             phone: "+1-876-458-6888",
    //             socials: [],
    //             description: "Taxi and delivery platform",
    //             logo: { mime: "image/png;base64", data: "iVBOR..." },
    //             userData: {
    //                 firstName: "Shayne",
    //                 lastName: "Hacker",
    //                 email: "shaynhacker@gmail.com",
    //             },
    //             roleData: { role: "Owner" },
    //             socialsData: [{ platform: "Instagram", profileName: "Phoenix Prime 876" }],
    //             vcardData: {
    //                 firstName: "Shayne",
    //                 lastName: "Hacker",
    //                 organization: "Phoenix Prime",
    //                 title: "CEO",
    //                 phone: "+1-876-458-6888"
    //             },
    //         }
    //     ]);
    //
    //     // expect(dbLogger.info).toHaveBeenCalledWith("Connecting to Database");
    //     // expect(dbLogger.info).toHaveBeenCalledWith(`Aggregating data for user ID: ${mockUserId}`);
    //     // expect(dbLogger.info).toHaveBeenCalledWith("Database connection closed");
    // });

    it('should connect to the database, aggregate data correctly, and return the expected result', async () => {
        const result = await aggregateDataDB(mockUserId);

        expect(mockClient.connect).toHaveBeenCalled();
        expect(mockClient.db).toHaveBeenCalledWith('athenadb');
        expect(mockClient.collection).toHaveBeenCalledWith('businesses');
        // expect(mockCollection.aggregate).toHaveBeenCalledWith(expect.arrayContaining([
        //     {$match: {userId: mockObjectId}},
        //     expect.objectContaining({
        //         $lookup: expect.objectContaining({
        //             from: "users",
        //             localField: "userId",
        //             foreignField: "_id",
        //             as: "userData"
        //         })
        //     }),
        //     expect.objectContaining({
        //         $lookup: expect.objectContaining({
        //             from: "roles",
        //             localField: "userId",
        //             foreignField: "userId",
        //             as: "roleData"
        //         })
        //     }),
        //     expect.objectContaining({
        //         $lookup: expect.objectContaining({
        //             from: "socials",
        //             localField: "userId",
        //             foreignField: "userId",
        //             as: "socialsData"
        //         })
        //     }),
        //     expect.objectContaining({
        //         $lookup: expect.objectContaining({
        //             from: "vcards",
        //             localField: "userId",
        //             foreignField: "ownerId",
        //             as: "vcardData"
        //         })
        //     }),
        //     expect.objectContaining({
        //         $project: expect.objectContaining({
        //             _id: 1,
        //             name: 1,
        //             industry: 1,
        //             address: 1,
        //             website: 1,
        //             contactEmail: 1,
        //             phone: 1,
        //             description: 1,
        //             logo: 1,
        //             userData: expect.any(Object),
        //             roleData: expect.any(Object),
        //             socialsData: expect.any(Array),
        //             vcardData: expect.any(Object),
        //         })
        //     }),
        // ]));
        expect(result).toEqual([
            {
                _id: "6719b3a31eac0b05bf46b6da",
                name: "Phoenix Prime",
                industry: "Transportation/Delivery",
                address: {country: "Jamaica"},
                website: "https://phoenixprime.io",
                contactEmail: "",
                phone: "+1-876-458-6888",
                socials: [],
                description: "Taxi and delivery platform",
                logo: {mime: "image/png;base64", data: "iVBOR..."},
                userData: {
                    firstName: "Shayne",
                    lastName: "Hacker",
                    email: "shaynhacker@gmail.com",
                },
                roleData: {role: "Owner"},
                socialsData: [{platform: "Instagram", profileName: "Phoenix Prime 876",
                    profileUrl: "jkjajnksnakjdn"}],
                vcardData: {
                    firstName: "Shayne",
                    lastName: "Hacker",
                    organization: "Phoenix Prime",
                    title: "CEO",
                    phone: "+1-876-458-6888"
                },
            }
        ]);
    });

    it('should handle errors and log them', async () => {
        const error = new Error('Database error');
        mockCollection.aggregate.mockReturnValueOnce({
            toArray: jest.fn().mockRejectedValue(error),
        });

        await expect(aggregateDataDB(mockUserId)).rejects.toThrow('Database error');

        // expect(dbLogger.error).toHaveBeenCalledWith({ message: 'Error aggregating data', error });
    });

    afterAll(() => {
        jest.clearAllMocks();
    });
});
