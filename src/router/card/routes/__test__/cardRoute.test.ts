import {
    createCard,
    getCard,
    updateCard,
    deleteCard,
    aggregateCardData
} from '../index';  // Assuming your card controller is in routes.js

import request from 'supertest';
import express from 'express';
import card from '../../../../router/card';  // Assuming your card routes are in an index.js file

jest.mock('../index', () => ({
    createCard: jest.fn(),
    getCard: jest.fn(),
    updateCard: jest.fn(),
    deleteCard: jest.fn(),
    aggregateCardData: jest.fn(),
}));

// Set up Express app
const app = express();
app.use(express.json());
app.use('/card', card);  // Mount the card routes on the /card path

// Test cases for the card route handlers

describe('Card Routes', () => {

    // POST /card/create
    describe('POST /card/create', () => {
        it('should create a new card', async () => {
            const newCard = { userId: 'user-id', status: 'active' };
            const mockResponse = { id: '1', ...newCard };

            (createCard as jest.Mock).mockImplementation((req, res) => {
                res.status(201).json(mockResponse);
            });

            const response = await request(app)
                .post('/card/create')
                .send(newCard);

            expect(response.status).toBe(201);
            expect(response.body).toEqual(mockResponse);
            expect(createCard).toHaveBeenCalled();
        });

        it('should return 500 if there is an error', async () => {
            (createCard as jest.Mock).mockImplementation((req, res) => {
                res.status(500).json({ message: 'Error creating card' });
            });

            const response = await request(app)
                .post('/card/create')
                .send({ status: '' });  // Invalid data

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: 'Error creating card' });
        });
    });

    // DELETE /card/delete/:cardId
    describe('DELETE /card/delete/:cardId', () => {
        it('should delete the card', async () => {
            (deleteCard as jest.Mock).mockImplementation((req, res) => {
                res.status(200).json({ message: 'Card deleted successfully' });
            });

            const response = await request(app).delete('/card/delete/1');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ message: 'Card deleted successfully' });
            expect(deleteCard).toHaveBeenCalled();
        });

        it('should return 404 if card not found', async () => {
            (deleteCard as jest.Mock).mockImplementation((req, res) => {
                res.status(404).json({ message: 'Card not found' });
            });

            const response = await request(app).delete('/card/delete/999');

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: 'Card not found' });
        });
    });

    // PUT /card/update/:cardId
    describe('PUT /card/update/:cardId', () => {
        it('should update the card', async () => {
            const updateData = { status: 'inactive' };
            const mockResponse = { id: '1', status: 'inactive' };

            (updateCard as jest.Mock).mockImplementation((req, res) => {
                res.status(200).json(mockResponse);
            });

            const response = await request(app)
                .put('/card/update/1')
                .send(updateData);

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockResponse);
            expect(updateCard).toHaveBeenCalled();
        });

        it('should return 500 if there is an error', async () => {
            (updateCard as jest.Mock).mockImplementation((req, res) => {
                res.status(500).json({ message: 'Error updating card' });
            });

            const response = await request(app)
                .put('/card/update/1')
                .send({ status: '' });

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: 'Error updating card' });
        });
    });

    // GET /card/:cardId
    describe('GET /card/:cardId', () => {
        it('should retrieve a card by ID', async () => {
            const mockCard = { id: '1', userId: 'user-id', status: 'active' };
            (getCard as jest.Mock).mockImplementation((req, res) => {
                res.status(200).json(mockCard);
            });

            const response = await request(app).get('/card/1');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockCard);
            expect(getCard).toHaveBeenCalled();
        });

        it('should return 404 if card not found', async () => {
            (getCard as jest.Mock).mockImplementation((req, res) => {
                res.status(404).json({ message: 'Card not found' });
            });

            const response = await request(app).get('/card/999');

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: 'Card not found' });
        });
    });

    // GET /card/info/:cardId
    describe('GET /card/info/:cardId', () => {
        it('should retrieve aggregated card data', async () => {
            const mockAggregatedData = { userId: 'user-id', data: 'aggregated card data' };
            (aggregateCardData as jest.Mock).mockImplementation((req, res) => {
                res.status(200).json(mockAggregatedData);
            });

            const response = await request(app).get('/card/info/1');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockAggregatedData);
            expect(aggregateCardData).toHaveBeenCalled();
        });

        it('should return 404 if card not found', async () => {
            (aggregateCardData as jest.Mock).mockImplementation((req, res) => {
                res.status(404).json({ message: 'Card not found' });
            });

            const response = await request(app).get('/card/info/999');

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: 'Card not found' });
        });

        it('should return 500 if there is an error in aggregation', async () => {
            (aggregateCardData as jest.Mock).mockImplementation((req, res) => {
                res.status(500).json({ message: 'Error aggregating data' });
            });

            const response = await request(app).get('/card/info/1');

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: 'Error aggregating data' });
        });
    });
});
