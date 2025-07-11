/**
 * @file vCard generation utility
 * @module utils/vCardGenerator
 * @description Generates vCard (VCF) contact information from database records
 */

import { getVCardByIdDB } from "../database";
const vCardsJS = require('vcards-js');

/**
 * Generates a vCard (VCF format) contact card from database record
 * @async
 * @function generateContactCard
 * @param {string} id - The unique identifier of the contact in the database
 * @returns {Promise<string>} Formatted vCard string in VCF format
 * @throws {Error} May throw errors if:
 *                 - Database record is not found
 *                 - Required fields are missing
 *                 - vCard generation fails
 *
 * @example
 * try {
 *   const vCardString = await generateContactCard('contact123');
 *   // Use vCardString to download or share contact
 * } catch (error) {
 *   console.error('Failed to generate vCard:', error);
 * }
 */
const generateContactCard = async (id: string): Promise<string> => {
    // Retrieve contact data from database
    let data: any = await getVCardByIdDB(id).then((res: any) => res);

    if (!data) {
        throw new Error('Contact not found in database');
    }

    // Create new vCard instance
    let vCard = vCardsJS();

    // Set basic contact information
    vCard.uid = data.uid;
    vCard.firstName = data.firstName;
    vCard.lastName = data.lastName;
    vCard.middleName = data.middleName;
    vCard.formattedName = data.formattedName;
    vCard.namePrefix = data.namePrefix;
    vCard.nameSuffix = data.nameSuffix;
    vCard.nickname = data.nickname;
    vCard.gender = data.gender;

    // Set date of birth if available
    if (data.birthday) {
        const parsedDate = new Date(`${data.birthday}T00:00:00Z`);
        if (!isNaN(parsedDate.getTime())) {
            vCard.birthday = parsedDate;
        } else {
            console.warn(`Invalid birthday format: ${data.birthday}`);
        }
    }


    // Set contact methods
    vCard.cellPhone = data.cellPhone;
    vCard.pagerPhone = data.pagerPhone;
    vCard.homePhone = data.homePhone;
    vCard.homeFax = data.homeFax;
    vCard.workPhone = data.workPhone;
    vCard.workFax = data.workFax;

    // Set email addresses
    vCard.email = data.email;
    vCard.workEmail = data.workEmail;

    // Set organization information
    vCard.organization = data.organization;
    vCard.role = data.role;
    vCard.title = data.title;

    // Set URLs
    vCard.url = data.url;
    vCard.workUrl = data.workUrl;
    vCard.source = data.source;

    // Set notes
    vCard.note = data.note;

    // Set home address if available
    if (data.homeAddress) {
        vCard.homeAddress = {
            label: data.homeAddress.label,
            street: data.homeAddress.street,
            city: data.homeAddress.city,
            stateProvince: data.homeAddress.stateProvince,
            postalCode: data.homeAddress.postalCode,
            countryRegion: data.homeAddress.countryRegion
        };
    }

    // Set work address if available
    if (data.workAddress) {
        vCard.workAddress = {
            label: data.workAddress.label,
            street: data.workAddress.street,
            city: data.workAddress.city,
            stateProvince: data.workAddress.stateProvince,
            postalCode: data.workAddress.postalCode,
            countryRegion: data.workAddress.countryRegion
        };
    }

    // Set social media URLs if available
    if (data.socialUrls) {
        vCard.socialUrls = {
            facebook: data.socialUrls.facebook,
            linkedIn: data.socialUrls.linkedIn,
            twitter: data.socialUrls.twitter,
            flickr: data.socialUrls.flickr
        };
    }

    // Set logo if available
    if (data.logo) {
        try {
            vCard.logo.embedFromString(`${data.logo.url}`, 'image/png');
            vCard.logo.mediaType = data.logo.mediaType;
            vCard.logo.base64 = data.logo.base64;
        } catch (error) {
            console.warn('Failed to embed logo:', error);
        }
    }

    // Set photo if available
    if (data.photo) {
        try {
            vCard.photo.embedFromString(`${data.photo.url}`, "image/png");
            vCard.photo.mediaType = data.photo.mediaType;
            vCard.photo.base64 = data.photo.base64;
        } catch (error) {
            console.warn('Failed to embed photo:', error);
        }
    }

    // Set vCard version and type
    vCard.version = data.version || '3.0';
    vCard.isOrganization = true;

    // Return formatted vCard string
    return vCard.getFormattedString();
};

export default generateContactCard;