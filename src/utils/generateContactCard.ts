import {ContactInfo} from "../models/types";

const vCardsJS = require('vcards-js');


const generateContactCard = (data: ContactInfo) => {

        // create a new vCard
        let vCard = vCardsJS();

        // set properties
        vCard.uid = data.uid;

    if (data.birthday) {
        vCard.birthday = new Date(data.birthday);
    }

    // vCard.birthday = data.birthday;
        vCard.cellPhone = data.cellPhone;
        vCard.pagerPhone = data.pagerPhone;
        vCard.email = data.email;
        vCard.workEmail = data.workEmail;
        vCard.firstName = data.firstName;
        vCard.formattedName = data.formattedName;
        vCard.gender = data.gender;

        if (data.homeAddress) {
            vCard.homeAddress.label = data.homeAddress.label;
            vCard.homeAddress.street = data.homeAddress.street;
            vCard.homeAddress.city = data.homeAddress.city;
            vCard.homeAddress.stateProvince = data.homeAddress.stateProvince;
            vCard.homeAddress.postalCode = data.homeAddress.postalCode;
            vCard.homeAddress.countryRegion = data.homeAddress.countryRegion;
        }

        vCard.homePhone = data.homePhone;
        vCard.homeFax = data.homeFax;
        vCard.lastName = data.lastName;

        if (data.logo) {
            vCard.logo.url = data.logo.url;
            vCard.logo.mediaType = data.logo.mediaType;
            vCard.logo.base64 = data.logo.base64;
        }

        vCard.middleName = data.middleName;
        vCard.namePrefix = data.namePrefix;
        vCard.nameSuffix = data.nameSuffix;
        vCard.nickname = data.nickname;
        vCard.note = data.note;
        vCard.organization = data.organization;

        if (data.photo) {
            vCard.photo.url = data.photo.url;
            vCard.photo.mediaType = data.photo.mediaType;
            vCard.photo.base64 = data.photo.base64;
        }

        vCard.role = data.role;

        if (data.socialUrls) {
            vCard.socialUrls.facebook = data.socialUrls.facebook;
            vCard.socialUrls.linkedIn = data.socialUrls.linkedIn;
            vCard.socialUrls.twitter = data.socialUrls.twitter;
            vCard.socialUrls.flickr = data.socialUrls.flickr;
        }

        vCard.source = data.source;
        vCard.title = data.title;
        vCard.url = data.url;
        vCard.workUrl = data.workUrl;

        if (data.workAddress) {
            vCard.workAddress.label = data.workAddress.label;
            vCard.workAddress.street = data.workAddress.street;
            vCard.workAddress.city = data.workAddress.city;
            vCard.workAddress.stateProvince = data.workAddress.stateProvince;
            vCard.workAddress.postalCode = data.workAddress.postalCode;
            vCard.workAddress.countryRegion = data.workAddress.countryRegion;
        }

        vCard.workPhone = data.workPhone;
        vCard.workFax = data.workFax;
        vCard.version = data.version;
        vCard.isOrganiztion = true;

        return vCard;


}

export default generateContactCard
