import request from 'supertest';
import express from 'express';
import {createVCard, getVCard, updateVCard, deleteVCard} from '../index';
import {createVCardDB, deleteVCardDB, updateVCardDB} from '../../../database';
import generateContactCard from '../../../utils/generateContactCard';


jest.mock('../../../database');
jest.mock('../../../utils/generateContactCard');

jest.mock('../../../logger/logger', () => ({
    child: jest.fn(() => ({
        error: jest.fn(),
    })),
}));

const app = express();
app.use(express.json());
app.get('/vcard', getVCard);
app.put('/vcard', updateVCard);
app.post('/vcard', createVCard);
app.delete('/vcard', deleteVCard);

describe('vCard Service', () => {
    const mockVCardData = {
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
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('createVCard should create a vCard successfully', async () => {
        app.post('/vcard', createVCard);
        (createVCardDB as jest.Mock).mockResolvedValue(mockVCardData);

        const response = await request(app)
            .post('/vcard')
            .send(mockVCardData);

        expect(response.status).toBe(200);
        expect(response.text).not.toBeNull();
        // expect(response.text).toContain('Success!! VCard created:');
        expect(createVCardDB).toHaveBeenCalledWith(mockVCardData);
    });

    test('createVCard should return 500 on error', async () => {
        (createVCardDB as jest.Mock).mockRejectedValue(new Error('DB error'));

        const response = await request(app)
            .post('/vcard')
            .send(mockVCardData);

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Error inserting card information');
        expect(createVCardDB).toHaveBeenCalledWith(mockVCardData);
    });

    test('getVCard should return a vCard successfully', async () => {
        (generateContactCard as jest.Mock).mockResolvedValue('vCard data');

        const response = await request(app)
            .get('/vcard')
            .send({ ownerId: '123' });

        expect(response.status).toBe(200);
        expect(response.text).toBe('vCard data');
        expect(generateContactCard).toHaveBeenCalledWith('123');
    });

    test('getVCard should return 500 if ownerId is missing', async () => {
        const response = await request(app).get('/vcard').send({});

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Unable to find Id');
    });

    test('updateVCard should update a vCard successfully', async () => {
        (updateVCardDB as jest.Mock).mockResolvedValue(mockVCardData);

        const response = await request(app)
            .put('/vcard')
            .send({
                ownerId: '123',
                firstName: "Arthur",
                formattedName: "Wembley Pendragon",
                gender: "male"
            });

        expect(response.status).toBe(200);
        expect(response.body).not.toBeNull();
        expect(updateVCardDB).toHaveBeenCalledWith('123',{
            ownerId: '123',
            firstName: "Arthur",
            formattedName: "Wembley Pendragon",
            gender: "male"});
    });

    test('updateVCard should return 500 if ownerId is missing', async () => {
        const response = await request(app).put('/vcard').send({});

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Unable to find Id');
    });

    test('deleteVCard should delete a vCard successfully', async () => {
        (deleteVCardDB as jest.Mock).mockResolvedValue({ success: true });

        const response = await request(app)
            .delete('/vcard')
            .send({ ownerId: '123' });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ success: true });
        expect(deleteVCardDB).toHaveBeenCalledWith('123');
    });

    test('deleteVCard should return 500 if ownerId is missing', async () => {
        const response = await request(app).delete('/vcard').send({});

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Unable to find Id');
    });
});

