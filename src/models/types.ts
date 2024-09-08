export interface ContactInfo {
    uid: string;
    birthday?: string;
    cellPhone?: string;
    pagerPhone?: string;
    email?: string;
    workEmail?: string;
    firstName: string;
    formattedName?: string;
    gender?: string;
    homeAddress?: Address;
    homePhone?: string;
    homeFax?: string;
    lastName: string;
    logo?: Media;
    middleName?: string;
    namePrefix?: string;
    nameSuffix?: string;
    nickname?: string;
    note?: string;
    organization?: string;
    photo?: Media;
    role?: string;
    socialUrls?: SocialUrls;
    source?: string;
    title?: string;
    url?: string;
    workUrl?: string;
    workAddress?: Address;
    workPhone?: string;
    workFax?: string;
    version: string;
}

interface Address {
    label?: string;
    street?: string;
    city?: string;
    stateProvince?: string;
    postalCode?: string;
    countryRegion?: string;
}

interface Media {
    url?: string;
    mediaType: string;
    base64: boolean;
    attachFromUrl?: (url: string) => void;
    embedFromFile?: (file: File) => void;
    embedFromString?: (data: string) => void;
}

interface SocialUrls {
    facebook?: string;
    linkedIn?: string;
    twitter?: string;
    flickr?: string;
}
