import request from 'supertest';
import express from 'express';
import {createVCard, deleteVCard, getVCard, updateVCard} from '../index'; // adjust path
import generateContactCard from '../../../utils/generateContactCard';
import {createVCardDB, updateVCardDB, deleteVCardDB, getCardHashMappingByIdDB} from '../../../database';

const app = express();
app.use(express.json());
app.post('/vcard/get', getVCard);
app.post('/vcard/create', createVCard);
app.put('/vcard/update', updateVCard);
app.delete('/vcard/delete', deleteVCard);

jest.mock('../../../database', () => ({
    getCardHashMappingByIdDB: jest.fn(),
    createVCardDB: jest.fn(),
    updateVCardDB: jest.fn(),
    deleteVCardDB: jest.fn()
}));

jest.mock('../../../utils/generateContactCard', () => jest.fn());

describe('POST /vcard/get', () => {

    it('should return a vCard when valid businessId is provided', async () => {

        (getCardHashMappingByIdDB as jest.Mock).mockResolvedValue({ cardId: 'abc123' });
        (generateContactCard as jest.Mock).mockResolvedValue('BEGIN:VCARD\n...END:VCARD');

        const res = await request(app)
            .post('/vcard/get')
            .send({ businessId: 'biz123' });

        expect(res.status).toBe(200);
        expect(res.text).toContain('BEGIN:VCARD');
        expect(res.headers['content-type']).toContain('text/vcard');
        expect(res.headers['content-disposition']).toContain('filename="biz123.vcf"');
        expect(getCardHashMappingByIdDB).toHaveBeenCalledWith('biz123');
        expect(generateContactCard).toHaveBeenCalledWith('abc123');
    });

    it('should return 400 if businessId is missing', async () => {
        const res = await request(app).post('/vcard/get').send({});

        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Missing businessId in request');
    });

    it('should return 404 if no card is found for businessId', async () => {
        (getCardHashMappingByIdDB as jest.Mock).mockResolvedValue(null);

        const res = await request(app)
            .post('/vcard/get')
            .send({ businessId: 'invalid-biz' });

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Card not found for this ID');
    });

    it('should return 500 if generateContactCard throws an error', async () => {
        (getCardHashMappingByIdDB as jest.Mock).mockResolvedValue({ cardId: 'abc123' });
        (generateContactCard as jest.Mock).mockRejectedValue(new Error('vCard error'));

        const res = await request(app)
            .post('/vcard/get')
            .send({ businessId: 'biz123' });

        expect(res.status).toBe(500);
        expect(res.body.message).toBe('Failed to generate vCard');
    });
});

describe('POST /vcard/create', () => {
    it('should return 200 and success message if vCard is created', async () => {
        (createVCardDB as jest.Mock).mockResolvedValue({ id: 'abc123' });

        const res = await request(app)
            .post('/vcard/create')
            .send({ firstName: 'Test', lastName: 'User' });

        expect(res.status).toBe(200);
        expect(res.text).toContain('Success! VCard created');
        expect(createVCardDB).toHaveBeenCalledWith({ firstName: 'Test', lastName: 'User' });
    });

    it('should return 500 if createVCardDB throws', async () => {
        (createVCardDB as jest.Mock).mockRejectedValue(new Error('DB insert error'));

        const res = await request(app)
            .post('/vcard/create')
            .send({ firstName: 'Test', lastName: 'User' });

        expect(res.status).toBe(500);
        expect(res.body.message).toBe('Error inserting card information');
        expect(res.body.error).toBe('DB insert error');
    });
});

describe('PUT /vcard/update', () => {
    it('should return 200 and the updated vCard if successful', async () => {
        (updateVCardDB as jest.Mock).mockResolvedValue({ updated: true });

        const res = await request(app)
            .put('/vcard/update')
            .send({ ownerId: 'abc123', title: 'CEO' });

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ updated: true });
        expect(updateVCardDB).toHaveBeenCalledWith('abc123', { ownerId: 'abc123', title: 'CEO' });
    });

    it('should return 400 if ownerId is missing', async () => {
        const res = await request(app)
            .put('/vcard/update')
            .send({ title: 'CTO' });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Missing ownerId');
    });

    it('should return 500 if updateVCardDB throws', async () => {
        (updateVCardDB as jest.Mock).mockRejectedValue(new Error('DB update error'));

        const res = await request(app)
            .put('/vcard/update')
            .send({ ownerId: 'abc123', title: 'CTO' });

        expect(res.status).toBe(500);
        expect(res.body.message).toBe('Error updating vCard');
        expect(res.body.error).toBe('DB update error');
    });
});

describe('DELETE /vcard/delete', () => {
    it('should return 200 and delete result if successful', async () => {
        (deleteVCardDB as jest.Mock).mockResolvedValue({ deleted: true });

        const res = await request(app)
            .delete('/vcard/delete')
            .send({ ownerId: 'abc123' });

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ deleted: true });
        expect(deleteVCardDB).toHaveBeenCalledWith('abc123');
    });

    it('should return 400 if ownerId is missing', async () => {
        const res = await request(app)
            .delete('/vcard/delete')
            .send({});

        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Missing ownerId');
    });

    it('should return 500 if deleteVCardDB throws', async () => {
        (deleteVCardDB as jest.Mock).mockRejectedValue(new Error('DB delete error'));

        const res = await request(app)
            .delete('/vcard/delete')
            .send({ ownerId: 'abc123' });

        expect(res.status).toBe(500);
        expect(res.body.message).toBe('Error deleting vCard');
        expect(res.body.error).toBe('DB delete error');
    });
});
