/**
 * Interface representing a physical address
 * @interface Address
 * @property {string} label - Address label (e.g., "Home", "Work")
 * @property {string} street - Street address
 * @property {string} city - City
 * @property {string} state - State/province
 * @property {string} [postalCode] - Optional postal/ZIP code
 * @property {string} country - Country
 */
interface Address {
    label: string;
    street: string;
    city: string;
    state: string;
    postalCode?: string;
    country: string;
}

/**
 * Interface representing media content
 * @interface Media
 * @property {string} [url] - Media URL
 * @property {string} [mediaType] - MIME type (e.g., "image/png")
 * @property {boolean} [base64] - Whether media is base64 encoded
 * @property {Function} [attachFromUrl] - Method to attach from URL
 * @property {Function} [embedFromFile] - Method to embed from file
 * @property {Function} [embedFromString] - Method to embed from string
 */
interface Media {
    url?: string;
    mediaType?: string;
    base64?: boolean;
    attachFromUrl?: (url: string) => void;
    embedFromFile?: (file: File) => void;
    embedFromString?: (data: string, imagePng: string) => void;
}

/**
 * Interface representing social media profiles
 * @interface Social
 * @property {string} userId - Associated user ID
 * @property {string} businessId - Associated business ID
 * @property {string} platform - Social platform name
 * @property {string} profileName - Profile name/handle
 * @property {string} created_at - Creation timestamp
 * @property {string} updated_at - Last update timestamp
 * @property {string} profileUrl - Profile URL
 */
export interface Social {
    userId: string;
    businessId: string;
    platform: string;
    profileName: string;
    created_at: string;
    updated_at: string;
    profileUrl: string;
}

/**
 * Interface representing card metrics/analytics
 * @interface CardMetrics
 * @property {string} cardId - Associated card ID
 * @property {string} userId - Associated user ID
 * @property {string} businessId - Associated business ID
 * @property {string} status - Card status
 * @property {number} tapCount - Total tap interactions
 * @property {string} lastTap - Timestamp of last tap
 */
export interface CardMetrics {
    cardId: string;
    userId: string;
    businessId: string;
    status: string;
    tapCount: number;
    lastTap: string;
}

/**
 * Interface representing a digital business card
 * @interface Card
 * @property {string} _id - Unique identifier
 * @property {string} userId - Owner user ID
 * @property {string} [businessId] - Associated business ID
 * @property {"personal"|"business"} type - Card type
 * @property {"active"|"inactive"} status - Card status
 * @property {string} [title] - Card title
 * @property {number} tapCount - Total tap interactions
 * @property {Date} lastTap - Last interaction timestamp
 * @property {Tap[]} taps - Array of tap events
 * @property {Date} createdAt - Creation timestamp
 * @property {Date} [deactivatedAt] - Deactivation timestamp
 */
export interface Card {
    _id: string;
    userId: string;
    businessId?: string;
    type: "personal" | "business";
    status: "active" | "inactive";
    title?: string;
    tapCount: number;
    lastTap: Date;
    taps: Tap[];
    createdAt: Date;
    deactivatedAt?: Date;
}

/**
 * Interface representing business information
 * @interface BusinessData
 * @property {string} _id - Unique identifier
 * @property {string} name - Business name
 * @property {string} industry - Business industry
 * @property {Address} address - Business address
 * @property {string} website - Business website
 * @property {string} contactEmail - Contact email
 * @property {string} phone - Contact phone
 * @property {Social[]} socials - Social media profiles
 * @property {string} description - Business description
 * @property {Media} [logo] - Business logo
 * @property {string} userId - Owner user ID
 * @property {string} createdAt - Creation timestamp
 * @property {string} updatedAt - Last update timestamp
 */
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

/**
 * Interface representing user-business role relationships
 * @interface UserBusinessRole
 * @property {string} _id - Unique identifier
 * @property {string} userId - User ID
 * @property {string} [businessId] - Business ID
 * @property {string} role - Role name
 */
export interface UserBusinessRole {
    _id: string;
    userId: string;
    businessId?: string;
    role: string;
}

/**
 * Interface representing user information
 * @interface UserData
 * @property {Date} createdAt - Account creation timestamp
 * @property {Date} updatedAt - Last update timestamp
 * @property {string} firstName - First name
 * @property {string} lastName - Last name
 * @property {string} dob - Date of birth
 * @property {string} email - Primary email
 * @property {Address} address - Primary address
 * @property {string} phone - Primary phone
 * @property {Media} [profilePicture] - Profile image
 * @property {string|null} [password] - Hashed password
 * @property {string} authProvider - Authentication provider
 * @property {string} authProviderId - Provider user ID
 * @property {boolean} firstLogin - First login flag
 */
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

/**
 * Interface representing contact information
 * @interface Contact
 * @property {string} firstname - First name
 * @property {string} lastname - Last name
 * @property {string} [company] - Company name
 * @property {Array} phoneNumbers - Phone numbers
 * @property {Array} [emails] - Email addresses
 * @property {Array} [addresses] - Physical addresses
 * @property {string} [contactType] - Contact type
 */
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

/**
 * Interface representing application state
 * @interface ApplicationState
 * @property {Object} application - Application state container
 * @property {UserData} application.UserData - User data
 * @property {BusinessData} application.BusinessData - Business data
 */
export interface ApplicationState {
    application: { UserData: UserData, BusinessData: BusinessData }
}

/**
 * Interface representing vCard data
 * @interface VCardData
 * @property {string} vcardOwnerType - Owner type ("User" or "Business")
 * @property {string} birthday - Date of birth
 * @property {string} cellPhone - Mobile phone
 * @property {string} [pagerPhone] - Pager number
 * @property {string} email - Primary email
 * @property {string} workEmail - Work email
 * @property {string} firstName - First name
 * @property {string} formattedName - Formatted full name
 * @property {string} gender - Gender
 * @property {Object} homeAddress - Home address
 * @property {string} [homePhone] - Home phone
 * @property {string} [homeFax] - Home fax
 * @property {string} lastName - Last name
 * @property {Media} logo - Logo/image
 * @property {string} [middleName] - Middle name
 * @property {string} [namePrefix] - Name prefix
 * @property {string} [nameSuffix] - Name suffix
 * @property {string} [nickname] - Nickname
 * @property {string} note - Notes/comments
 * @property {string} organization - Organization name
 * @property {Media} photo - Profile photo
 * @property {string} role - Job role
 * @property {Object} socialUrls - Social media URLs
 * @property {string} source - Data source
 * @property {string} title - Job title
 * @property {string} url - Personal URL
 * @property {string} [workUrl] - Work URL
 * @property {Object} workAddress - Work address
 * @property {string} [workPhone] - Work phone
 * @property {string} [workFax] - Work fax
 * @property {string} version - vCard version
 */
export interface VCardData {
    vcardOwnerType: string;
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

/**
 * Interface representing a card tap event
 * @interface Tap
 * @property {string} timestamp - Event timestamp
 * @property {Location} location - GPS coordinates
 * @property {DeviceInfo} [deviceInfo] - Device information
 */
export interface Tap {
    timestamp: Date | string;
    location: Location;
    deviceInfo?: DeviceInfo;
}

/**
 * Interface representing a geographic location
 * @interface Location
 * @property {string} latitude - Latitude coordinate
 * @property {string} longitude - Longitude coordinate
 * @property {string} accuracy - Accuracy in meters
 */
export interface Location {
    latitude: string;
    longitude: string;
    accuracy: string;
}

/**
 * Interface representing device information
 * @interface DeviceInfo
 * @property {string} [os] - Operating system
 * @property {string} [browser] - Browser name
 * @property {string} [ip] - IP address
 */
interface DeviceInfo {
    os?: string;
    browser?: string;
    ip?: string;
}