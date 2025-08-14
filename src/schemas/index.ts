import {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt,
    GraphQLID,
    GraphQLNonNull,
    GraphQLInputObjectType,
    GraphQLBoolean, GraphQLList
} from 'graphql';
import GraphQLJSON from 'graphql-type-json';

import * as db from "../database"
import logger from "../logger/logger"
import {
    createBusinessDB,
    createCardDB,
    createHashMappingDB,
    createSocialDB,
    createUserDB,
    createVCardDB,
    deleteBusinessDB,
    deleteCardDB,
    deleteCardHashMappingsDB,
    deleteHashMappingDB,
    deleteSocialDB,
    deleteUserDB,
    deleteVCardDB,
    getActivitiesByBusinessIdDB,
    getActivitiesByCardIdDB, getActivitiesByTypeDB,
    getActivitiesByUserIdDB,
    getActivityByIdDB,
    getAllCardIdentifiersByUserIdDB,
    getAllCardsByUserIdDB,
    getCardHashMappingByCardIdDB,
    getCardHashMappingByIdDB,
    getCardHashMappingsByCardIdDB,
    getHashMappingByHashDB,
    getVCardDB,
    listHashMappingsDB,
    updateBusinessDB,
    updateCardDB,
    updateCardHashMappingsDB,
    updateHashMappingDB,
    updateSocialDB,
    updateUserDB,
    updateVCardByIdDB,
    updateVCardDB
} from "../database";
import {BusinessData, Social, UserBusinessRole, UserData} from "../common/types";

const schemaLogger = logger.child({context:'schemaService'})

const SocialProfileInputType = new GraphQLInputObjectType({
    name: 'SocialProfileInput',
    fields: () => ({
        id: { type: GraphQLID },
        userId: { type: GraphQLID },
        businessId: { type: GraphQLID },
        profileName: { type: GraphQLString },
        createdAt: { type: GraphQLString },
        updatedAt: { type: GraphQLString },
        profileUrl: { type: GraphQLString },
        platform: { type: GraphQLString }
    })
});

/**
 * Define the Address type
 */
const VCardAddressType = new GraphQLObjectType({
    name: 'VCardAddress',
    fields: ()=>({
        label: { type: GraphQLString },
        street: { type: GraphQLString },
        city: { type: GraphQLString },
        stateProvince: { type: GraphQLString },
        postalCode: { type: GraphQLString },
        countryRegion: { type: GraphQLString },
    }),
});

const VCardAddressInputType = new GraphQLInputObjectType({
    name: 'VCardAddressInput',
    fields: ()=>({
        label: { type: GraphQLString },
        street: { type: GraphQLString },
        city: { type: GraphQLString },
        stateProvince: { type: GraphQLString },
        postalCode: { type: GraphQLString },
        countryRegion: { type: GraphQLString },
    }),
});

/**
 * Define the Address type
 */
const AddressType = new GraphQLObjectType({
    name: 'Address',
    fields: ()=>({
        street: { type: GraphQLString },
        city: { type: GraphQLString },
        state: { type: GraphQLString },
        postalCode: { type: GraphQLString },
        country: { type: GraphQLString },
    }),
});

const AddressInputType = new GraphQLInputObjectType({
    name: 'AddressInput',
    fields: () => ({
        street: { type: GraphQLString },
        city: { type: GraphQLString },
        state: { type: GraphQLString },
        postalCode: { type: GraphQLString },
        country: { type: GraphQLString },
    }),
});

const HomeAddressInputType = new GraphQLInputObjectType({
    name: 'HomeAddressInputType',
    fields: () => ({
        label: { type: GraphQLString },
        street: { type: GraphQLString },
        city: { type: GraphQLString },
        stateProvince: { type: GraphQLString },
        postalCode: { type: GraphQLString },
        countryRegion: { type: GraphQLString },
    }),
});

const LogoInputType = new GraphQLInputObjectType({
    name: 'LogoInputType',
    fields: () => ({
        mime: { type: GraphQLString },
        data: { type: GraphQLString },
    })
});

const VCardLogoType = new GraphQLObjectType({
    name: 'VcardLogoType',
    fields: () => ({
        url:{type: GraphQLString},
        mediaType: {type: GraphQLString},
        base64:{type: GraphQLBoolean}
    })
});

const VCardLogoInputType = new GraphQLInputObjectType({
    name: 'VcardLogoInputType',
    fields: () => ({
        url:{type: GraphQLString},
        mediaType: {type: GraphQLString},
        base64:{type: GraphQLBoolean}
    })
});
//
// const LogoInput = new GraphQLObjectType({
//         name: 'LogoInput',
//         fields: {
//             url: { type: GraphQLString },
//             mediaType: { type: GraphQLString },
//             base64: { type: GraphQLBoolean },
//         },
// })

const WorkAddressInput = new GraphQLInputObjectType({
    name: 'WorkAddressInput',
    fields: () => ({
        label: { type: GraphQLString },
        street: { type: GraphQLString },
        city: { type: GraphQLString },
        stateProvince: { type: GraphQLString },
        postalCode: { type: GraphQLString },
        countryRegion: { type: GraphQLString },
    }),
});

/**
 * Define the Logo type
 */
const LogoType = new GraphQLObjectType({
    name: 'Logo',
    fields: () => ({
        mime: { type: GraphQLString },
        data: { type: GraphQLString }
    })
});

/**
 * Define the User type
 */
const UserType = new GraphQLObjectType({
    name: 'User',
    fields: {
        _id: { type: GraphQLID },
        firstName: { type: GraphQLString },
        lastName: { type: GraphQLString },
        age: { type: GraphQLInt },
        email: { type: GraphQLString },
        address: { type: AddressType},
        phone: { type: GraphQLString },
        createdAt: { type: GraphQLString },
        updatedAt: { type: GraphQLString },
        password: { type: GraphQLString },
        authProvider: { type: GraphQLString },
        authProviderId: { type: GraphQLString },
        firstLogin: { type: GraphQLBoolean },
        cards: { type: new GraphQLList(GraphQLID) },
    },
});

const UserInputType = new GraphQLInputObjectType({
    name: 'UserInput',
    fields: ()=>({
        _id: { type: GraphQLID },
        firstName: { type: GraphQLString },
        lastName: { type: GraphQLString },
        dob: { type: GraphQLString },
        email: { type: GraphQLString },
        address: { type: AddressInputType},
        phone: { type: GraphQLString },
        createdAt: { type: GraphQLString },
        updatedAt: { type: GraphQLString },
        password: { type: GraphQLString },
        authProvider: { type: GraphQLString },
        authProviderId: { type: GraphQLString },
        firstLogin: { type: GraphQLBoolean },
        cards: { type: new GraphQLList(GraphQLID) },
    }),
});

const CreateUserInputWrapper = new GraphQLInputObjectType({
    name: 'createUserInput', // Must match RefineJS's type name (case-sensitive)
    fields: () => ({
        data: {
            type: new GraphQLNonNull(UserInputType),
        },
    }),
});

const UpdateUserInputWrapper = new GraphQLInputObjectType({
    name: 'updateUserInput', // Must match RefineJS's type name
    fields: () => ({
        where: {
            type: new GraphQLInputObjectType({
                name: 'UserWhereInput',
                fields: () => ({
                    id: { type: new GraphQLNonNull(GraphQLID) }, // Keep ID non-null
                }),
            }),
        },
        data: {
            type: new GraphQLNonNull(UpdateUserInputType), // Keep data non-null
        },
    }),
});

const UpdateUserInputType = new GraphQLInputObjectType({
    name: 'UpdateUserInput',
    fields: () => ({
        _id: { type: GraphQLID },
        firstName: { type: GraphQLString },
        lastName: { type: GraphQLString },
        age: { type: GraphQLInt },
        email: { type: GraphQLString },
        address: { type: AddressInputType },
        phone: { type: GraphQLString },
        createdAt: { type: GraphQLString },
        updatedAt: { type: GraphQLString },
        password: { type: GraphQLString },
        authProvider: { type: GraphQLString },
        authProviderId: { type: GraphQLString },
        firstLogin: { type: GraphQLBoolean }
    }),
});

/**
 * Define the SocialProfile type
 */
const SocialProfileType = new GraphQLObjectType({
    name: 'SocialProfile',
    fields: ()=> ({
        id:{ type: GraphQLID},
        _id: { type: GraphQLID },
        userId: { type: GraphQLID },
        businessId: { type: GraphQLID },
        profileName: { type: GraphQLString },
        created_at: { type: GraphQLString },
        updated_at: { type: GraphQLString },
        profileUrl: { type: GraphQLString },
        platform: { type: GraphQLString }
    })
});

const SocialInputType = new GraphQLInputObjectType({
    name: 'SocialInput',
    fields: () => ({
        id:{ type: GraphQLID},
        _id: { type: GraphQLID },
        userId: { type: GraphQLID },
        businessId: { type: GraphQLID },
        profileName: { type: GraphQLString },
        platform: { type: GraphQLString },
        profileUrl: { type: GraphQLString },
        created_at: { type: GraphQLString },
        updated_at: { type: GraphQLString },
    }),
});


const CreateSocialInputWrapper= new GraphQLInputObjectType({
    name: 'createSocialInput',
    fields: () => ({
        data: {
            type: new GraphQLNonNull(SocialInputType)
        },
    }),
});

const DeleteSocialInputWrapper = new GraphQLInputObjectType({
    name: 'deleteSocialInput',
    fields: () => ({
        where: {
            type: new GraphQLInputObjectType({
                name: 'DeleteSocialWhereInput',
                fields: () => ({
                    id: { type: new GraphQLNonNull(GraphQLID) }, // Keep ID non-null
                }),
            }),
        },
        // data: {
        //     type: new GraphQLNonNull(SocialInputType)
        // }
    })

})

const CreateSocialProfileResponseType  = new GraphQLObjectType({
    name: 'createSocialProfileResponse',
    fields: () => ({
        social: {
            type: SocialProfileType,
        },
    }),
});

const UpdateSocialInputWrapper = new GraphQLInputObjectType({
    name: 'updateSocialInput',
    fields: () => ({
        where: {
            type: new GraphQLInputObjectType({
                name: 'SocialWhereInput',
                fields: () => ({
                    id: { type: new GraphQLNonNull(GraphQLID) }, // Keep ID non-null
                }),
            }),
        },
        data: {
            type: new GraphQLNonNull(SocialInputType)
        },
    }),
});

const UpdateSocialProfileResponseType  = new GraphQLObjectType({
    name: 'updateSocialProfileResponse',
    fields: () => ({
        social: { type: SocialProfileType },
    }),
});

const DeleteSocialProfileResponseType = new GraphQLObjectType({
    name: 'deleteSocialProfileResponse',
    fields: () => ({
        social: {type:  SocialProfileType}
    }),
})
/**
 * Define the SocialUrls type
 */
const SocialUrlsType = new GraphQLObjectType({
    name: 'SocialUrls',
    fields: {
        instagram: { type: GraphQLString },
    },
});

/**
 * Define the Business type
 */
const BusinessType = new GraphQLObjectType({
    name: 'Business',
    fields: ()=>({
        _id: { type: GraphQLID },
        name: { type: GraphQLString },
        industry: { type: GraphQLString },
        address: { type: AddressType },
        logo: { type: LogoType },
        website: { type: GraphQLString },
        contactEmail: { type: GraphQLString },
        phone: { type: GraphQLString },
        socials: { type: new GraphQLList(SocialProfileType) },
        description: { type: GraphQLString },

        userId: { type: GraphQLID },
        services: { type: new GraphQLList(GraphQLString) },
    })
})

const BusinessInputType = new GraphQLInputObjectType({
    name: 'BusinessInput',
    fields: ()=>({
        _id: { type: GraphQLID },
        name: { type: GraphQLString },
        industry: { type: GraphQLString },
        address: { type: AddressInputType },
        website: { type: GraphQLString },
        contactEmail: { type: GraphQLString },
        phone: { type: GraphQLString },
        socials: { type: new GraphQLList(SocialInputType) },
        description: { type: GraphQLString },
        logo: { type: LogoInputType },
        userId: { type: GraphQLID },
        services: { type: new GraphQLList(GraphQLString) },
    })
})

const CreateBusinessInputWrapper = new GraphQLInputObjectType({
    name: 'createBusinessInput',
    fields: () => ({
        data: {
            type: new GraphQLNonNull(BusinessInputType)
        },
    }),
});

const UpdateBusinessInputWrapper = new GraphQLInputObjectType({
    name: 'updateBusinessInput', // Must match RefineJS's type name
    fields: () => ({
        where: {
            type: new GraphQLInputObjectType({
                name: 'BusinessWhereInput',
                fields: () => ({
                    id: { type: GraphQLID },  // Add this line
                    _id: { type: GraphQLID }, // Keep this line
                }),
            }),
        },
        data: {
            type: new GraphQLNonNull(UpdateBusinessInputType), // Keep data non-null
        },
    }),
})

/**
 * Define the VCard type
 */
const VCardType = new GraphQLObjectType({
    name: 'VCard',
    fields: ()=>({
        id: { type: GraphQLID },
        birthday: { type: GraphQLString },
        cellPhone: { type: GraphQLString },
        pagerPhone: { type: GraphQLString },
        email: { type: GraphQLString },
        workEmail: { type: GraphQLString },
        firstName: { type: GraphQLString },
        formattedName: { type: GraphQLString },
        gender: { type: GraphQLString },
        homeAddress: { type: VCardAddressType },
        homePhone: { type: GraphQLString },
        homeFax: { type: GraphQLString },
        lastName: { type: GraphQLString },
        logo: { type: LogoType },
        photo:{ type: LogoType },
        role: { type: GraphQLString },
        organization: { type: GraphQLString },
        socialUrls: { type: SocialUrlsType },
        source: { type: GraphQLString },
        title: { type: GraphQLString },
        url: { type: GraphQLString },
        workUrl: { type: GraphQLString },
        workAddress: { type: VCardAddressType },
        workPhone: { type: GraphQLString },
        workFax: { type: GraphQLString },
        version: { type: GraphQLString },
        ownerId: { type: GraphQLID },
        cardId: { type: GraphQLID },
        note: {type: GraphQLString},
        nickname: {type: GraphQLString},
        nameSuffix: {type: GraphQLString},
        namePrefix: {type: GraphQLString},
        middleName: {type: GraphQLString}
    }),
});

const CreateVCardResponseType = new GraphQLObjectType({
    name: 'CreateVCardResponse',
    fields: () => ({
        vcard: {
            type: VCardType, // The actual VCard object
        },
    }),
});

const VCardInputType = new GraphQLInputObjectType({
    name: 'VCardInput',
    fields: ()=>({
        id: { type: GraphQLID },
        birthday: { type: GraphQLString },
        cellPhone: { type: GraphQLString },
        pagerPhone: { type: GraphQLString },
        email: { type: GraphQLString },
        workEmail: { type: GraphQLString },
        firstName: { type: GraphQLString },
        formattedName: { type: GraphQLString },
        gender: { type: GraphQLString },
        homeAddress: { type: VCardAddressInputType }, // Assuming VCardAddressInputType is defined
        homePhone: { type: GraphQLString },
        homeFax: { type: GraphQLString },
        lastName: { type: GraphQLString },
        logo: { type: VCardLogoInputType }, // Assuming LogoInputType is defined
        photo: { type: VCardLogoInputType },
        organization: { type: GraphQLString },
        role: { type: GraphQLString },
        socialUrls: { type: SocialProfileInputType }, // Assuming SocialUrlsInputType is defined
        source: { type: GraphQLString },
        title: { type: GraphQLString },
        url: { type: GraphQLString },
        workUrl: { type: GraphQLString },
        workAddress: { type: VCardAddressInputType }, // Assuming VCardAddressInputType is defined
        workPhone: { type: GraphQLString },
        workFax: { type: GraphQLString },
        version: { type: GraphQLString },
        ownerId: { type: GraphQLID },
        cardId: { type: GraphQLID },
        note: {type: GraphQLString},
        nickname: {type: GraphQLString},
        nameSuffix: {type: GraphQLString},
        namePrefix: {type: GraphQLString},
        middleName: {type: GraphQLString}
    }),
});

const CreateVCardInputWrapper = new GraphQLInputObjectType({
    name: 'createVcardInput',
    fields: () => ({
        data: {
            type: new GraphQLNonNull(VCardInputType)
        }
    })
})

const UpdateVCardInputWrapper = new GraphQLInputObjectType({
    name: 'updateVcardInput',
    fields: () => ({
        where: {
            type: new GraphQLInputObjectType({
                name: 'VcardWhereInput',
                fields: () => ({
                    id: { type: new GraphQLNonNull(GraphQLID) }, // Keep ID non-null
                }),
            }),
        },
        data: {
            type: new GraphQLNonNull(VCardInputType)
        }
    })
})

const LocationInputType = new GraphQLInputObjectType({
    name: 'LocationInput',
    fields: () => ({
        latitude: { type: new GraphQLNonNull(GraphQLString) },
        longitude: { type: new GraphQLNonNull(GraphQLString) },
        accuracy: { type: GraphQLString }
    })
});

const DeviceInfoInputType = new GraphQLInputObjectType({
    name: 'DeviceInfoInput',
    fields: () => ({
        os: { type: GraphQLString },
        browser: { type: GraphQLString },
        version: { type: GraphQLString },
        ip: { type: GraphQLString },
        userAgent: { type: GraphQLString }
        // Add other device properties as needed
    })
});

const TapInputType = new GraphQLInputObjectType({
    name: 'TapInput',
    fields: () => ({
        timestamp: { type: new GraphQLNonNull(GraphQLString) },
        location: { type: LocationInputType },
        deviceInfo: { type: DeviceInfoInputType }
    })
});

const LocationType = new GraphQLObjectType({
    name: 'Location',
    fields: () => ({
        latitude: { type: GraphQLString },
        longitude: { type: GraphQLString },
        accuracy: { type: GraphQLString }
    })
});

const DeviceInfoType = new GraphQLObjectType({
    name: 'DeviceInfo',
    fields: () => ({
        os: { type: GraphQLString },
        browser: { type: GraphQLString },
        version: { type: GraphQLString },
        ip: { type: GraphQLString },
        userAgent: { type: GraphQLString }
    })
});

const TapType = new GraphQLObjectType({
    name: 'Tap',
    fields: () => ({
        timestamp: { type: new GraphQLNonNull(GraphQLString) },
        location: { type: LocationType },
        deviceInfo: { type: DeviceInfoType }
    })
});

/**
 *  Define the Metadata type
 */

const MetadataType = new GraphQLObjectType({
    name: 'ActivityMetadata',
    fields: () => ({
        viewCount: { type: GraphQLInt },
        connectionIds: { type: new GraphQLList(GraphQLString) }
    })
});

/**
 *  Define the Activity type
 */

const ActivityType = new GraphQLObjectType({
    name: 'Activity',
    fields: () => ({
        _id: { type: new GraphQLNonNull(GraphQLID) },
        cardId: { type: new GraphQLNonNull(GraphQLString) },
        userId: { type: new GraphQLNonNull(GraphQLString) },
        actionType: { type: new GraphQLNonNull(GraphQLString) },
        description: { type: new GraphQLNonNull(GraphQLString) },
        metadata: { type: MetadataType },
        createdAt: { type: new GraphQLNonNull(GraphQLString) }
    })
});


/**
 * Define the Card type
 */

// Card Type that includes taps
const CardType = new GraphQLObjectType({
    name: 'Card',
    fields: () => ({
        _id: { type: new GraphQLNonNull(GraphQLID) },
        userId: { type: new GraphQLNonNull(GraphQLString) },
        businessId: { type: GraphQLString },
        type: { type: new GraphQLNonNull(GraphQLString) }, // "personal" | "business"
        status: { type: new GraphQLNonNull(GraphQLString) }, // "active" | "inactive"
        title: { type: GraphQLString },
        tapCount: { type: new GraphQLNonNull(GraphQLInt) },
        lastTap: { type: GraphQLString },
        taps: { type: new GraphQLList(TapType) },
        createdAt: { type: new GraphQLNonNull(GraphQLString) },
        deactivatedAt: { type: GraphQLString }
    })
});

const CardResponseType = new GraphQLObjectType( {
    name: 'cardResponse',
    fields: () => ({
        card: {
            type: CardType,
        },
    }),
})

export const CardsByUserIdResultType = new GraphQLObjectType({
    name: "CardsByUserIdResult",
    fields: () => ({
        data: { type: GraphQLList(CardType) },
        total: { type: GraphQLInt },
    }),
});

const CardInputType = new GraphQLInputObjectType({
    name: 'CardInput',
    fields: () => ({
        _id: { type: new GraphQLNonNull(GraphQLID) },
        userId: { type: new GraphQLNonNull(GraphQLString) },
        businessId: { type: GraphQLString },
        type: { type: new GraphQLNonNull(GraphQLString) }, // "personal" | "business"
        status: { type: new GraphQLNonNull(GraphQLString) }, // "active" | "inactive"
        title: { type: GraphQLString },
        tapCount: { type: new GraphQLNonNull(GraphQLInt) },
        lastTap: { type: GraphQLString },
        taps: { type: new GraphQLList(TapInputType) },
        createdAt: { type: new GraphQLNonNull(GraphQLString) },
        deactivatedAt: { type: GraphQLString }
    })
});

const CreateCardInputWrapper  = new GraphQLInputObjectType({
    name: 'createCardInput',
    fields: () => ({
        data: {
            type: new GraphQLNonNull(CardInputType)
        },
    })
})

const UpdateCardInputWrapper = new GraphQLInputObjectType({
    name: 'updateCardInput',
    fields: () => ({
        where: {
            type: new GraphQLInputObjectType({
                name: 'cardWhereInput',
                fields: () => ({
                    id: { type: new GraphQLNonNull(GraphQLID) }, // Keep ID non-null
                }),
            }),
        },
        data: {
            type: new GraphQLNonNull(CardInputType)
        }
    })
})

/**
 * Define the CardMapping type
 */
const CardHashMappingType = new GraphQLObjectType({
    name: 'CardHashMapping',
    fields: ()=>({
        id: { type: GraphQLID }, // Equivalent to "_id"
        userId: {type: GraphQLID},
        cardId: { type: GraphQLID }, // Reference to the Card's ID
        hash: { type: GraphQLString }, // Hash associated with the Card
        identifier: { type: GraphQLString } // Unique identifier for the Card
    })
});

/**
 * Define the UserRole type
 */
const UserRoleType = new GraphQLObjectType({
    name: 'UserRole',
    fields: {
        id: { type: GraphQLID }, // Equivalent to "_id"
        userId: { type: GraphQLID }, // Reference to the User's ID
        businessId: { type: GraphQLID }, // Reference to the associated business's ID
        role: { type: GraphQLString } // Role of the user within the business
    }
});

/**
 * Define the CardActivity type
 */
const CardMetricsType = new GraphQLObjectType({
    name: 'CardMetrics',
    fields: {
        id: { type: GraphQLID }, // Equivalent to "_id"
        cardId: { type: GraphQLID }, // Reference to the associated card's ID
        userId: { type: GraphQLID }, // Reference to the user's ID
        businessId: { type: GraphQLID }, // Reference to the business's ID
        status: { type: GraphQLString }, // Status of the card (e.g., active, inactive)
        tapCount: { type: GraphQLInt }, // Total number of taps
        lastTap: { type: GraphQLString } // ISO 8601 formatted timestamp of the last tap
    }
});

const UpdateBusinessInputType = new GraphQLInputObjectType({
    name: 'UpdateBusinessInput',
    fields: () => ({
        _id:{ type: GraphQLNonNull(GraphQLID) },
        name: { type: GraphQLString },
        industry: { type: GraphQLString },
        address: { type: AddressInputType },
        website: { type: GraphQLString },
        contactEmail: { type: GraphQLString },
        phone: { type: GraphQLString },
        socials: { type: new GraphQLList(SocialInputType) },
        description: { type: GraphQLString },
        logo: { type: LogoInputType },
        services: { type: new GraphQLList(GraphQLString) },
    }),
});

const UpdateVCardResponseType = new GraphQLObjectType({
    name: 'UpdateVCardResponse',
    fields: {
        vcard: { type: VCardType }, // Wrap the VCard in a `vcard` field
    },
});

/**
 * Define the Query type
 */
const QueryType = new GraphQLObjectType({
    name: 'Query',
    fields: {
        activity: {
          type: ActivityType,
            args:{
                id: { type: GraphQLID },
                _id: { type: GraphQLID },
            },
            resolve: async (parent, args, context) => {
                if(args.id){
                    return await getActivityByIdDB(args.id)
                } else if (args._id){
                    return await getActivityByIdDB(args._id)
                }
            }
        },
        activities: {
            type: new GraphQLList(ActivityType),
            args:{
                cardId: { type: GraphQLID },
                userId: { type: GraphQLID },
                businessId: { type: GraphQLID },
                type: { type: GraphQLString }
            },
            resolve: async (parent, args, context) => {
                if (args.cardId){
                    return await getActivitiesByCardIdDB(args.cardId)
                }else if (args.userId){
                    return await getActivitiesByUserIdDB(args.userId)
                } else if (args.businessId){
                    return await getActivitiesByBusinessIdDB(args.businessId)
                } else if(args.type){
                    return await getActivitiesByTypeDB(args.type)
                }
            }
        },
        socials: {
            type: new GraphQLList(SocialProfileType),
            args: {
                _id: { type: GraphQLID },
                id: { type: GraphQLID },
                userId: { type: GraphQLID }
            },
            resolve: async (parent, args, context) => {
                if(args.id){
                    const socials = await db.getSocialDB(args.id);
                    return socials || []
                }
                else if(args._id){
                    const socials = await db.getSocialDB(args.id);
                    return socials || []
                }
                else if (args.userId) {
                    const socials = await db.getSocialByUserIdDB(args.userId)
                    return socials || []
                } else {
                    schemaLogger.error('Either \'id\' or \'userId\' must be provided for SocialProfileType.')
                    throw new Error("Either 'id' or 'userId' must be provided for SocialProfileType.");
                }
            }
        },
        vcard: {
            type: VCardType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) }
            },
            resolve: async (parent, args, context) => {
                return await db.getVCardDB(args.id);
            }
        },
        user: {
            type: UserType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) },
            },
            resolve: async (_parent, args, context) => {
                return await db.getUserByIdDB(args.id);
            },
        },
        business: {
            type: BusinessType,
            args: {
                id: { type: GraphQLID },
                userId: { type: GraphQLID}
            },
            resolve: async (parent, args, context) => {
                if(args.id){
                    return await db.getBusinessByIdDB(args.id);
                } else if (args.userId) {
                    return await db.getBusinessByUserIdDB(args.userId)
                } else {
                    schemaLogger.error('Either \'id\' or \'userId\' must be provided.')
                    throw new Error("Either 'id' or 'cardId' must be provided.");

                }

            }
        },
        card: {
          type: CardType,
          args:{
              id: { type: GraphQLID},
              userId: { type: GraphQLID}
          },
            resolve: async (parent, args, context) => {
                if (args.id) {
                    return await db.getCardByIdDB(args.id);
                } else if (args.userId) {
                    return await db.getCardByIdDB(args.userId);
                } else {
                    schemaLogger.error('Either \'id\' or \'userId\' must be provided.')
                    throw new Error("Either 'id' or 'userId' must be provided.");
                }
            }
        },
        cardsIdByUserId:{
            type: new GraphQLList(GraphQLString), // List of identifier strings
            args: {
                userId: { type: GraphQLString }
            },
            resolve: async (parent, args, context) => {
                if (!args.userId) {
                    schemaLogger.error("userId must be provided.");
                    throw new Error("userId must be provided.");
                }

                const mappings = await db.getAllCardIdentifiersByUserIdDB(args.userId);
                return mappings.data.map(entry => entry.identifier); // Return only identifiers
            }
        },
        cardsByUserId: {
          type: GraphQLList(CardType),
            args: {
                userId: { type: GraphQLString },
                sort: { type: GraphQLString },         // e.g. "createdAt:desc"
                start: { type: GraphQLInt },           // offset
                limit: { type: GraphQLInt },           // max results
                where: { type: GraphQLJSON }           // additional filters (status, businessId, etc.)
            },
            resolve: async (parent, args, context) => {
                const { userId, sort, start = 0, limit = 20, where = {} } = args;

                if (!userId) {
                    schemaLogger.error("'userId' must be provided.");
                    throw new Error("'userId' must be provided.");
                }

               return await db.getAllCardsByUserIdDB(userId, { sort, start, limit, where });
            }
        },
        cardHashMapping: {
            type: CardHashMappingType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) }
            },
            resolve: async (parent, args, context) => {
                if (args.id) {
                    return await db.getCardHashMappingsByCardIdDB(args.id);
                } else {
                    schemaLogger.error('Either \'id\' must be provided.')
                    throw new Error("Either 'id' must be provided.");
                }
            }
        },
        // role: {
        //     type: UserRoleType,
        //     args: {
        //         id: { type: new GraphQLNonNull(GraphQLID) }
        //     },
        //     resolve: async (parent, args, context) => {
        //         return await db.getRoleByIdDB(args.id);
        //     }
        // },
        cardMetrics: {
            type: CardMetricsType,
            args: {
                id: { type: GraphQLID },
                cardId: { type: GraphQLID }
            },
            resolve: async (parent, args, context) => {
                if (args.id) {
                    return await db.getCardMetricByIdDB(args.id);
                } else if (args.cardId) {
                    return await db.getCardMetricByCardIdDB(args.cardId);
                } else {
                    schemaLogger.error('Either \'id\' or \'cardId\' must be provided.')
                    throw new Error("Either 'id' or 'cardId' must be provided.");

                }
            }
        },
        getFullCardDatum: {
            type: new GraphQLObjectType({
                name: 'FullCardData',
                fields: () => ({
                    card: { type: CardType },
                    hashData: { type: CardHashMappingType },
                    business: { type: BusinessType },
                    user: { type: UserType },
                    vcard: { type: VCardType },
                    socials: { type: new GraphQLList(SocialProfileType) }
                })
            }),
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) }
            },
            resolve: async (parent, args, context) => {
                try {
                    // Use the existing aggregateDataDB function
                    const result = await db.aggregateDataDB(args.id);

                    if (!result || result.length === 0) {
                        throw new Error("No data found for this identifier");
                    }

                    const aggregatedData = result[0];

                    return {
                        card: aggregatedData,
                        hashData: aggregatedData.hashMappingData,
                        business: aggregatedData.businessData,
                        user: aggregatedData.userData,
                        vcard: aggregatedData.vcardData,
                        socials: aggregatedData.socialsData
                    };

                } catch (error) {
                    schemaLogger.error({ message: 'Error in getFullCardData', error });
                    throw error;
                }
            }
        }
    }
});


/**
 * Define the Mutation type
 */
const MutationType = new GraphQLObjectType({
    name:'Mutation',
    fields: {

        /**
         *VCARD Operations
         */
        createVcard: {
            type: CreateVCardResponseType, // Use the new response type
            args: {
                input: { type: CreateVCardInputWrapper },
            },
            resolve: async (_parent, args) => {
                const { input } = args;
                if (!input || !input.data) {
                    throw new Error("Input data is required");
                }
                const vcard = await createVCardDB(input.data); // Create the VCard
                return { vcard }; // Wrap the VCard in an object with a `vcard` field
            },
        },
        updateVcard: {
            type: UpdateVCardResponseType, // Use the new response type
            args: {
                input: { type: UpdateVCardInputWrapper },
            },
            resolve: async (_parent, args) => {
                const { input } = args;
                const { where: { id }, data } = input;
                const updatedVCard = await updateVCardByIdDB(id, data); // Update the VCard
                return { vcard: updatedVCard }; // Return the updated VCard wrapped in a `vcard` field
            },
        },
        deleteVcard: {
            type: GraphQLString,
            args: {
                cardId: { type: new GraphQLNonNull(GraphQLString)}
            },
            resolve: async (_parent, args) => {
                return await deleteVCardDB(args.cardId)
            },
        },

        /**
         * Business Operations
         */
        createBusiness: {
            type: BusinessType,
            args: {
                input: { type: CreateBusinessInputWrapper }, // Single "input" argument
            },
            resolve: async (_parent, args: any) => {
                const { input } = args;
                if (!input || !input.data) {
                    throw new Error("Input data is required");
                }
                return await createBusinessDB(input.data);
            }
        },
        updateBusiness: {
            type: BusinessType,
            args: {
                input: { type: UpdateBusinessInputWrapper}
            },
            resolve: async (_parent, args) => {
                const {input} = args
                console.log(`this is the ${input}`)
                if (!input) {
                    throw new Error("Input is required");
                }
                const id = input.where._id || input.where.id;
                if (!id) {
                    throw new Error("Either 'id' or '_id' must be provided");
                }
                return await updateBusinessDB(id, input.data)
            }
        },
        deleteBusiness: {
            type: BusinessType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) }
            },
            resolve: async (_parent, args) => {
                return await deleteBusinessDB(args.id)
            }
        },

        /**
         * Social Profile Operations
         */
        createSocial: {
            type: CreateSocialProfileResponseType,
            args: {
                input : { type: CreateSocialInputWrapper },
            },
            resolve: async (_parent, args) => {
                const { input } = args;
                if (!input || !input.data) {
                    throw new Error("Input data is required");
                }
                const social = await createSocialDB(input.data);
                return { social: social }
            },
        },
        updateSocial: {
            type: UpdateSocialProfileResponseType,
            args: {
                input : { type: UpdateSocialInputWrapper }
            },
            resolve: async (_parent, args) => {
                const {input} = args
                if (!input) {
                    throw new Error("Input is required");
                }
                const { where: { id }, data } = input;
                const social = await updateSocialDB(id, data);
                return { social: social }
            },
        },
        deleteSocial: {
            type: DeleteSocialProfileResponseType,
            args: {
                input: { type: DeleteSocialInputWrapper },
            },
            resolve: async (_parent, args) => {
                const {input} = args
                if (!input) {
                    throw new Error("Input is required");
                }
                const { where: { id } } = input;
                return await deleteSocialDB(id);
            },
        },

        /**
         * User Operations
         */
        createUser: {
            type: UserType,
            args: {
                input: { type: CreateUserInputWrapper }, // Single "input" argument
            },
            resolve: async (_parent, args) => {
                const { input } = args;
                if (!input || !input.data) {
                    throw new Error("Input data is required");
                }
                return await createUserDB(input.data); // Pass data to createUserDB
            },
        },
        updateUser: {
            type: UserType,
            args: {
                input: { type: UpdateUserInputWrapper }, // No "GraphQLNonNull" here
            },
            resolve: async (_parent, args) => {
                const { input } = args;
                if (!input) {
                    throw new Error("Input is required");
                }
                const { where: { id }, data } = input;
                return await updateUserDB(id, data);
            },
        },
        deleteUser: {
            type: GraphQLString,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) },
            },
            resolve: async (_parent, args) => {
                return await deleteUserDB(args.id);
            },
        },

        /**
         * Card Operations
         */
        createCard: {
            type: CardResponseType,
            args: {
               input: { type: CreateCardInputWrapper }
            },
            resolve: async (_parent, args) => {
                const { input } = args;
                if (!input || !input.data) {
                    throw new Error("Input data is required");
                }
                const card = await createCardDB(input.data);
                return { card }
            },
        },
        updateCard: {
            type: CardResponseType,
            args: {
                input: { type: UpdateCardInputWrapper },
            },
            resolve: async (_parent, args) => {
                const { input } = args;
                const { where: { id }, data } = input;
                const updatedCard = await updateCardDB(id, data);
                return { card: updatedCard }
            },
        },
        deleteCard: {
            type: GraphQLString,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) },
            },
            resolve: async (_parent, args) => {
                return await deleteCardDB(args.id);
            },
        },

        /**
         * CardHashMapping Operations
         */
        createCardHashMapping: {
            type: CardHashMappingType,
            args: {
                cardId: { type: new GraphQLNonNull(GraphQLString) },
                hash: { type: new GraphQLNonNull(GraphQLString) },
                identifier: { type: GraphQLString },
            },
            resolve: async (_parent, args: any) => {
                const {cardId, hash, identifier, userId} = args
                return await createHashMappingDB(
                    {
                        userId,
                        cardId,
                        hash,
                        identifier});
            },
        },
        updateCardHashMapping: {
            type: CardHashMappingType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) },
                updatedMapping: {
                    type: new GraphQLInputObjectType({
                        name: 'UpdateCardHashMappingInput',
                        fields: {
                            cardId: { type: GraphQLString },
                            hash: { type: GraphQLString },
                            identifier: { type: GraphQLString },
                        },
                    }),
                },
            },
            resolve: async (_parent, args) => {
                const { id, updatedMapping } = args;
                return await updateCardHashMappingsDB(id, updatedMapping);
            },
        },
        deleteCardHashMapping: {
            type: GraphQLString,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) },
            },
            resolve: async (_parent, args) => {
                return await deleteCardHashMappingsDB(args.id);
            },
        },
    }
})
/**
 * Construct the schema
 */
const schema = new GraphQLSchema({
    query: QueryType,
    mutation: MutationType
});

export default schema;
