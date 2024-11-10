import generateContactCard from '../generateContactCard';
import hashID from '../hashID';
import { getVCardByIdDB } from '../../database';

jest.mock('../../database', () => ({
    getVCardByIdDB: jest.fn(),
}));


describe('generateContactCard', () => {
    it('should generate a valid vCard string', async () => {
        // Set up the mock data that is expected from the database
        const mockData = {
            uid: "123456",
            birthday: "1998-01-29",
            cellPhone: "+6088441994",
            pagerPhone: "",
            email: "wembleywilliams@gmail.com",
            workEmail: "goodgraphicsja@gmail.com",
            firstName: "Wembley",
            formattedName: "Wembley Williams",
            gender: "male",
            homeAddress: {
                label: "Home",
                street: "521 Lincoln Street",
                city: "Mauston",
                stateProvince: "WI",
                postalCode: "53948",
                countryRegion: "USA"
            },
            homePhone: "+6088441994",
            homeFax: "",
            lastName: "Wick",
            logo: {
                url: "https://example.com/logo.png",
                mediaType: "image/png",
                base64: false
            },
            middleName: "E",
            namePrefix: "",
            nameSuffix: "",
            nickname: "Wembley",
            note: "This contact card was created using a Digital Business Card",
            organization: "Good Group",
            photo: {
                url: "https://example.com/photo.jpg",
                mediaType: "image/jpeg",
                base64: false
            },
            role: "Software Engineer",
            socialUrls: {
                instagram: "https://www.instagram.com/goodgraphicsja?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
            },
            source: "",
            title: "CEO",
            url: "",
            workUrl: "",
            workAddress: {
                label: "",
                street: "",
                city: "",
                stateProvince: "",
                postalCode: "",
                countryRegion: ""
            },
            workPhone: "",
            workFax: "",
            version: "3.0",
            ownerId: "6691e4a5acd809745e822caa"
        };

        // Set the mock implementation for getVCardByIdDB
        jest.mocked(getVCardByIdDB).mockResolvedValue(mockData);

        // Call the function you're testing
        const vCard = await generateContactCard('6691e4a5acd809745e822caa');

        // Check the vCard contains all the necessary information for a valid vCard
        expect(vCard).toContain('BEGIN:VCARD');
        expect(vCard).toContain('VERSION:3.0'); // Assuming version 3.0
        expect(vCard).toMatch(/FN(;CHARSET=UTF-8)?:Wembley Williams/);
        expect(vCard).toMatch(/N(;CHARSET=UTF-8)?:Wick;Wembley;E;;/);
        expect(vCard).toContain('TEL;TYPE=CELL:+6088441994');// Cell phone number

        expect(vCard).toMatch(/EMAIL(;CHARSET=UTF-8)?;type=HOME,INTERNET:wembleywilliams@gmail.com/);
        expect(vCard).toMatch(/EMAIL(;CHARSET=UTF-8)?;type=WORK,INTERNET:goodgraphicsja@gmail.com/);
        expect(vCard).toMatch(/ORG(;CHARSET=UTF-8)?:Good Group/);

        expect(vCard).toMatch(/TITLE(;CHARSET=UTF-8)?:CEO/); // Job title
        expect(vCard).toContain('PHOTO;TYPE=image/jpeg:https://example.com/photo.jpg'); // Photo URL
        expect(vCard).toContain('LOGO;TYPE=image/png:https://example.com/logo.png'); // Logo URL
        expect(vCard).toContain('BDAY:19980128'); // Birthday in YYYYMMDD format
        expect(vCard).toContain('END:VCARD');

        // Ensure that the database was called with the correct ID
        expect(getVCardByIdDB).toHaveBeenCalledWith('6691e4a5acd809745e822caa');
    });
});

describe('saltUrl', () => {
    // it('should return a salted ID string from ID string', async ()=>{
    //     expect(hashID('6691e4a5acd809745e822caa')).not.toBeNull()
    // })
})
