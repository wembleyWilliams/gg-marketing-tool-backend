import { createSocial, deleteSocial, getSocial, getSocialByUserId, updateSocial } from "../../index";
import request from 'supertest';
import express from 'express';
import socials from "../index";

jest.mock('../../index', () => ({
    createSocial: jest.fn(),
    deleteSocial: jest.fn(),
    getSocial: jest.fn(),
    getSocialByUserId: jest.fn(),
    updateSocial: jest.fn(),
}));

// Set up Express app
const app = express();
app.use(express.json());
app.use('/social', socials);

// Test cases for the social route handlers

describe('Social Routes', () => {

    // GET /social/:socialId
    describe('GET /social/:socialId', () => {
        it('should retrieve a social media handle by ID', async () => {
            const mockSocial = { id: 1, handle: '@testHandle' };
            (getSocial as jest.Mock).mockImplementation((req, res) => {
                res.status(200).json(mockSocial);
            });

            const response = await request(app).get('/social/1');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockSocial);
            expect(getSocial).toHaveBeenCalled();
        });

        it('should return 404 if social media handle is not found', async () => {
            (getSocial as jest.Mock).mockImplementation((req, res) => {
                res.status(404).json({ message: 'Social media handle not found' });
            });

            const response = await request(app).get('/social/999');

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: 'Social media handle not found' });
        });
    });

    // GET /social/user/:userId
    describe('GET /social/id/:userId', () => {
        it('should retrieve social media handles by user ID', async () => {
            const mockSocials = [{ id: 1, handle: '@testHandle1' }, { id: 2, handle: '@testHandle2' }];
            (getSocialByUserId as jest.Mock).mockImplementation((req, res) => {
                res.status(200).json(mockSocials);
            });

            const response = await request(app).get('/social/id/123');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockSocials);
            expect(getSocialByUserId).toHaveBeenCalled();
        });

        it('should return 404 if no social media handles are found for user', async () => {
            (getSocialByUserId as jest.Mock).mockImplementation((req, res) => {
                res.status(404).json({ message: 'No social media handles found' });
            });

            const response = await request(app).get('/social/id/999');

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: 'No social media handles found' });
        });
    });

    // POST /social/create
    describe('POST /social/create', () => {
        it('should create a new social media handle', async () => {
            const newSocial = { handle: '@newHandle' };
            const mockResponse = { id: 1, ...newSocial };

            (createSocial as jest.Mock).mockImplementation((req, res) => {
                res.status(201).json(mockResponse);
            });

            const response = await request(app)
                .post('/social/create')
                .send(newSocial);

            expect(response.status).toBe(201);
            expect(response.body).toEqual(mockResponse);
            expect(createSocial).toHaveBeenCalled();
        });

        it('should return 500 if there is an error', async () => {
            (createSocial as jest.Mock).mockImplementation((req, res) => {
                res.status(500).json({ message: 'Error creating social media handle' });
            });

            const response = await request(app)
                .post('/social/create')
                .send({ handle: '' }); // Invalid data

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: 'Error creating social media handle' });
        });
    });

    // POST /social/update/:socialId
    describe('POST /social/update/:socialId', () => {
        it('should update the social media handle', async () => {
            const updateData = { handle: '@updatedHandle' };
            const mockResponse = { id: 1, handle: '@updatedHandle' };

            (updateSocial as jest.Mock).mockImplementation((req, res) => {
                res.status(200).json(mockResponse);
            });

            const response = await request(app)
                .post('/social/update/1')
                .send(updateData);

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockResponse);
            expect(updateSocial).toHaveBeenCalled();
        });

        it('should return 500 if there is an error', async () => {
            (updateSocial as jest.Mock).mockImplementation((req, res) => {
                res.status(500).json({ message: 'Error updating social media handle' });
            });

            const response = await request(app)
                .post('/social/update/1')
                .send({ handle: '' });

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: 'Error updating social media handle' });
        });
    });

    // DELETE /social/delete/:socialId
    describe('DELETE /social/delete/:socialId', () => {
        it('should delete the social media handle', async () => {
            (deleteSocial as jest.Mock).mockImplementation((req, res) => {
                res.status(200).json({ message: 'Social media handle deleted successfully' });
            });

            const response = await request(app).delete('/social/delete/1');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ message: 'Social media handle deleted successfully' });
            expect(deleteSocial).toHaveBeenCalled();
        });

        it('should return 404 if social media handle is not found', async () => {
            (deleteSocial as jest.Mock).mockImplementation((req, res) => {
                res.status(404).json({ message: 'Social media handle not found' });
            });

            const response = await request(app).delete('/social/delete/999');

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: 'Social media handle not found' });
        });
    });
});
