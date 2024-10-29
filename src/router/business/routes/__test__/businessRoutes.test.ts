import {
    createBusiness,
    deleteBusiness,
    getBusiness,
    getBusinessByUserId,
    updateBusiness,
    updateBusinessLogo
} from "../../index";

import request from 'supertest';
import express from 'express';
import business from "../index";
import {getBusinessByUserIdDB} from "../../../../database";

jest.mock('../../index', () => ({
    createBusiness: jest.fn(),
    deleteBusiness: jest.fn(),
    getBusiness: jest.fn(),
    getBusinessByUserId: jest.fn(),
    updateBusiness: jest.fn(),
    updateBusinessLogo: jest.fn(),
}));

jest.mock('../../../../database', () => ({
    getBusinessByUserIdDB: jest.fn()
}))

// Set up Express app
const app = express();
app.use(express.json());
app.use('/business', business);

// Test cases for the business route handlers

describe('Business Routes', () => {

    // GET /business/:businessId
    describe('GET /business/:businessId', () => {
        it('should retrieve a business by ID', async () => {
            const mockBusiness = { id: 1, name: 'Test Business' };
            (getBusiness as jest.Mock).mockImplementation((req, res) => {
                res.status(200).json(mockBusiness);
            });

            const response = await request(app).get('/business/1');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockBusiness);
            expect(getBusiness).toHaveBeenCalled();
        });

        it('should return 404 if business is not found', async () => {
            (getBusiness as jest.Mock).mockImplementation((req, res) => {
                res.status(404).json({ message: 'Business not found' });
            });

            const response = await request(app).get('/business/999');

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: 'Business not found' });
        });
    });

    // GET /business/user/:userId
    describe('GET /business/user/:userId', () => {
        it('should retrieve a business by user ID', async () => {
            const mockBusiness = { id: 1, name: 'User Business' };
            // (getBusinessByUserId as jest.Mock).mockResolvedValue(mockBusiness);
            // Mock the database call
            (getBusinessByUserId as jest.Mock).mockImplementation((req, res) => {
                res.status(200).json(mockBusiness);
            });
            const response = await request(app).get('/business/user/1');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockBusiness);
        });

        it('should return 404 if no business is found for user ID', async () => {

            (getBusinessByUserId as jest.Mock).mockImplementation((req, res) => {
                res.status(404).json({ message: 'Business not found' });
            });

            // Send a request with a user ID that has no business associated
            const response = await request(app).get('/business/user/999');

            // Assert that the status code and response match the expected 404 for "not found"
            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: 'Business not found' });
        });


        // it('should return 500 if there is a database error', async () => {
        //     const errorMessage = 'Database error';
        //     // (getBusinessByUserIdDB as jest.Mock).mockReturnValue(new Error(errorMessage));
        //     (getBusinessByUserId as jest.Mock).mockRejectedValue(new Error(errorMessage));
        //     // Simulate an error
        //     // (getBusinessByUserId as jest.Mock).mockImplementation(() => new Error(errorMessage));
        //         // res.status(404).json({ message: 'Business not found' });
        //
        //     const response = await request(app)
        //         .get('/business/user/1');
        //
        //     // console.log(response.status)
        //     expect(response.status).toBe(500);
        //     expect(response.body).toEqual({ message: 'Error retrieving business', error: expect.any(Error) });
        // });

    });


    // POST /business/create
    describe('POST /business/create', () => {
        it('should create a business', async () => {
            const newBusiness = { name: 'New Business' };
            const mockResponse = { id: 1, ...newBusiness };

            (createBusiness as jest.Mock).mockImplementation((req, res) => {
                res.status(201).json(mockResponse);
            });

            const response = await request(app)
                .post('/business/create')
                .send(newBusiness);

            expect(response.status).toBe(201);
            expect(response.body).toEqual(mockResponse);
            expect(createBusiness).toHaveBeenCalled();
        });

        it('should return 500 if there is an error', async () => {
            (createBusiness as jest.Mock).mockImplementation((req, res) => {
                res.status(500).json({ message: 'Error creating business' });
            });

            const response = await request(app)
                .post('/business/create')
                .send({ name: '' }); // Invalid data

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: 'Error creating business' });
        });
    });

    // POST /business/update/:businessId
    describe('POST /business/update/:businessId', () => {
        it('should update the business', async () => {
            const updateData = { name: 'Updated Business' };
            const mockResponse = { id: 1, name: 'Updated Business' };

            (updateBusiness as jest.Mock).mockImplementation((req, res) => {
                res.status(200).json(mockResponse);
            });

            const response = await request(app)
                .post('/business/update/1')
                .send(updateData);

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockResponse);
            expect(updateBusiness).toHaveBeenCalled();
        });

        it('should return 500 if there is an error', async () => {
            (updateBusiness as jest.Mock).mockImplementation((req, res) => {
                res.status(500).json({ message: 'Error updating business' });
            });

            const response = await request(app)
                .post('/business/update/1')
                .send({ name: '' });

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: 'Error updating business' });
        });
    });

    // DELETE /business/delete/:businessId
    describe('DELETE /business/delete/:businessId', () => {
        it('should delete the business', async () => {
            (deleteBusiness as jest.Mock).mockImplementation((req, res) => {
                res.status(200).json({ message: 'Business deleted successfully' });
            });

            const response = await request(app).delete('/business/delete/1');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ message: 'Business deleted successfully' });
            expect(deleteBusiness).toHaveBeenCalled();
        });

        it('should return 404 if business is not found', async () => {
            (deleteBusiness as jest.Mock).mockImplementation((req, res) => {
                res.status(404).json({ message: 'Business not found' });
            });

            const response = await request(app).delete('/business/delete/999');

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: 'Business not found' });
        });
    });

    // POST /business/update/logo/:businessId
    describe('POST /business/update/logo/:businessId', () => {
        it('should update the business logo', async () => {
            const logoData = { logo: 'base64-image-data' };
            const mockResponse = { message: 'Logo updated successfully' };

            (updateBusinessLogo as jest.Mock).mockImplementation((req, res) => {
                res.status(200).json(mockResponse);
            });

            const response = await request(app)
                .post('/business/update/logo/1')
                .send(logoData);

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockResponse);
            expect(updateBusinessLogo).toHaveBeenCalled();
        });

        it('should return 500 if there is an error', async () => {
            (updateBusinessLogo as jest.Mock).mockImplementation((req, res) => {
                res.status(500).json({ message: 'Error updating logo' });
            });

            const response = await request(app)
                .post('/business/update/logo/1')
                .send({ logo: '' });

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: 'Error updating logo' });
        });
    });
});
