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
    mediaType?: string;
    base64?: boolean;
    attachFromUrl?: (url: string) => void;
    embedFromFile?: (file: File) => void;
    embedFromString?: (data: string, imagePng: string) => void;
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


export interface CardMetrics {
    cardId: string;          // Unique ID for the card
    userId: string;          // User ID associated with this metric
    businessId: string;      // Business ID linked to the metric
    status: string;
    tapCount: number;
    lastTap: string;
}

export interface Card {
    _id: string,
    userId: string,
    businessId?: string,
    type: "personal" | "business",
    status: "active" | "inactive",
    title?: string,
    tapCount: number,
    lastTap: Date,
    taps: Tap[],
    createdAt: Date,
    deactivatedAt?: Date
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
    createdAt: Date;
    updatedAt: Date;
    firstName: string;
    lastName: string;
    dob: string;
    email: string;
    address: Address;
    phone: string;
    profilePicture?: Media;
    password?: string | null;
    authProvider: string;
    authProviderId: string;
    firstLogin: boolean;
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

export interface Tap {
    timestamp: string,
    location: Location,
    deviceInfo?: DeviceInfo
}

export interface Location {
    latitude: string,
    longitude: string,
    accuracy: string
}

interface DeviceInfo {
    os?: string;
    browser?: string;
    ip?: string;
    // other relevant device properties
}