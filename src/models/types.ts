// export interface ContactInfo {
//     uid: string;
//     birthday?: string;
//     cellPhone?: string;
//     pagerPhone?: string;
//     email?: string;
//     workEmail?: string;
//     firstName: string;
//     formattedName?: string;
//     gender?: string;
//     homeAddress?: Address;
//     homePhone?: string;
//     homeFax?: string;
//     lastName: string;
//     logo?: Media;
//     middleName?: string;
//     namePrefix?: string;
//     nameSuffix?: string;
//     nickname?: string;
//     note?: string;
//     organization?: string;
//     photo?: Media;
//     role?: string;
//     socialUrls?: SocialUrls;
//     source?: string;
//     title?: string;
//     url?: string;
//     workUrl?: string;
//     workAddress?: Address;
//     workPhone?: string;
//     workFax?: string;
//     version: string;
// }

interface Address {
    label: string;
    street: string;
    city: string;
    state: string;
    postalCode?: string;
    country: string;
}

interface Media {
    url?: string;
    mediaType: string;
    base64: boolean;
    attachFromUrl?: (url: string) => void;
    embedFromFile?: (file: File) => void;
    embedFromString?: (data: string) => void;
}

export interface Social {
    userId: string;
    businessId: string;
    platform: string;
    profileName: string;
    created_at: string;
    updated_at: string;
    profileUrl: string;
}

interface SocialUrls {
    facebook?: string;
    linkedIn?: string;
    twitter?: string;
    flickr?: string;
}
//
// export interface BusinessData {
//     industry: string;
//     phone: string;
//     _id: string,
//     logo?: { data?: string | undefined, mime?: string | undefined },
//     name: string,
//     description: string,
//     contact: Contact,
//     address: {
//         street: string,
//         city: string,
//         state: string,
//         postalCode?: string,
//         country: string
//     },
//     pointOfContact: string,
//     contactEmail: string,
//     businessHandles: [{
//         socialMedia: string,
//         profileName: string,
//         profileUrL: string,
//     }]
// }
export interface BusinessData {
    _id: string;
    name: string;
    industry: string;
    address: Address;
    website: string;
    contactEmail: string;
    phone: string;
    socials: Social[];
    description: string;
    logo?: Media;
    userId: string;
    createdAt: string;
    updatedAt: string;
}

export interface UserBusinessRole {
    _id: string
    userId: string;
    businessId?: string;
    role: string;
}

export interface UserData {
    // _id: string,
    // firstname: string,
    // lastname: string,
    // age: number,
    // email: string,
    // businessId?: string[],
    // password: string,
    // profilePicture?: { data: string, mime: string },
    // contact: Contact,
    createdAt: Date,
    updatedAt: Date
    firstName: string;
    lastName: string;
    age: number;
    email: string;
    address: Address;
    phone: string;
    profilePicture?: Media;
}
export interface Contact {
    firstname: string;
    lastname: string;
    company?: string;
    phoneNumbers: [{
        countryCode: string,
        digits: string,
        label: string,
        number: string
    }];
    emails?: [{
        email: string,
        label: string
    }];
    addresses?: [{
        city: string,
        country: string,
        isoCountryCode: string,
        label: string,
        postalCode: string,
        region: string,
        street: string
    }];
    contactType?: string;
}

export interface ApplicationState {
    application: { UserData: UserData, BusinessData: BusinessData }
}

export interface Contact {
    firstname: string;
    lastname: string;
    company?: string;
    phoneNumbers: [{
        countryCode: string,
        digits: string,
        label: string,
        number: string
    }];
    emails?: [{
        email: string,
        label: string
    }];
    addresses?: [{
        city: string,
        country: string,
        isoCountryCode: string,
        label: string,
        postalCode: string,
        region: string,
        street: string
    }];
    contactType?: string;
}

export interface VCardData {
    vcardOwnerType: string; //User or Business
    birthday: string;
    cellPhone: string;
    pagerPhone?: string;
    email: string;
    workEmail: string;
    firstName: string;
    formattedName: string;
    gender: string;
    homeAddress: {
        label: string;
        street: string;
        city: string;
        stateProvince: string;
        postalCode: string;
        countryRegion: string;
    };
    homePhone?: string;
    homeFax?: string;
    lastName: string;
    logo: Media;
    middleName?: string;
    namePrefix?: string;
    nameSuffix?: string;
    nickname?: string;
    note: string;
    organization: string;
    photo: Media;
    role: string;
    socialUrls: {
        facebook?: string;
        linkedIn?: string;
        twitter?: string;
        flickr?: string;
    };
    source: string;
    title: string;
    url: string;
    workUrl?: string;
    workAddress: {
        label: string;
        street: string;
        city: string;
        stateProvince: string;
        postalCode: string;
        countryRegion: string;
    };
    workPhone?: string;
    workFax?: string;
    version: string;
}

