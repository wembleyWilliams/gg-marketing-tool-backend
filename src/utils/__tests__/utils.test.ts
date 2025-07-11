import generateContactCard from '../generateContactCard'; // adjust path if needed
import { getVCardByIdDB } from '../../database'; // this must match your real import

jest.mock('../../database', () => ({
    getVCardByIdDB: jest.fn(),
}));

const minimalMockData = {
    uid: "001",
    firstName: "Testy",
    lastName: "McTestface",
    formattedName: "Testy McTestface",
    gender: "n/a",
    email: "test@demo.com",
    version: "3.0",
    ownerId: "mocked"
};


describe('generateContactCard', () => {
    it('should generate a valid vCard string', async () => {
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
                instagram: "https://www.instagram.com/goodgraphicsja"
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

        // @ts-ignore: because TypeScript doesn't know it's mocked
        getVCardByIdDB.mockResolvedValue(mockData);

        const vCard = await generateContactCard('6691e4a5acd809745e822caa');

        expect(vCard).toContain('BEGIN:VCARD');
        expect(vCard).toContain('VERSION:3.0');
        expect(vCard).toMatch(/FN.*:Wembley Williams/);
        expect(vCard).toMatch(/N.*:Wick;Wembley;E;;/);
        expect(vCard).toContain('TEL;TYPE=CELL:+6088441994');
        expect(vCard).toMatch(/EMAIL.*:wembleywilliams@gmail.com/);
        expect(vCard).toMatch(/EMAIL.*:goodgraphicsja@gmail.com/);
        expect(vCard).toMatch(/ORG.*:Good Group/);
        expect(vCard).toMatch(/TITLE.*:CEO/);
        expect(vCard).toContain('BDAY:19980128');
        expect(vCard).toContain('END:VCARD');

        expect(getVCardByIdDB).toHaveBeenCalledWith('6691e4a5acd809745e822caa');
    });
    it('should handle missing optional fields without throwing', async () => {
        const minimalData = {
            uid: "123456",
            firstName: "Test",
            lastName: "User",
            formattedName: "Test User",
            gender: "non-binary",
            email: "test@example.com",
            version: "3.0",
            ownerId: "owner123"
            // no birthday, phone, address, logo, etc.
        };

        // @ts-ignore
        getVCardByIdDB.mockResolvedValue(minimalData);

        const vCard = await generateContactCard('owner123');

        expect(vCard).toContain('FN;CHARSET=UTF-8:Test User');
        expect(vCard).toContain('EMAIL;CHARSET=UTF-8;type=HOME,INTERNET:test@example.com');
        expect(vCard).toContain('GENDER:non-binary');
        expect(vCard).toContain('END:VCARD');
    });
    it('should throw an error if contact is not found in the database', async () => {
        // @ts-ignore
        getVCardByIdDB.mockResolvedValue(null);

        await expect(generateContactCard('nonexistent')).rejects.toThrow('Contact not found in database');
        expect(getVCardByIdDB).toHaveBeenCalledWith('nonexistent');
    });
    it('should not set birthday if invalid date string is provided', async () => {
        const mockData = {
            ...minimalMockData,
            birthday: "invalid-date"
        };

        // @ts-ignore
        getVCardByIdDB.mockResolvedValue(mockData);

        const vCard = await generateContactCard('bad-birthday');

        expect(vCard).not.toContain('BDAY:');
    });
    it('should handle logo/photo embedding failure gracefully', async () => {
        const mockData = {
            ...minimalMockData,
            logo: {
                url: "not-a-valid-url",
                mediaType: "image/png",
                base64: false
            },
            photo: {
                url: "not-a-valid-url",
                mediaType: "image/jpeg",
                base64: false
            }
        };

        // @ts-ignore
        getVCardByIdDB.mockResolvedValue(mockData);

        const vCard = await generateContactCard('bad-media');

        expect(vCard).toContain('BEGIN:VCARD');
        expect(vCard).toContain('END:VCARD');
        // It shouldn’t crash, but might not include embedded data
    });
    it('should throw an error if the DB call throws', async () => {
        // @ts-ignore
        getVCardByIdDB.mockRejectedValue(new Error('Database down'));

        await expect(generateContactCard('error-case')).rejects.toThrow('Database down');
    });

});
