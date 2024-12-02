import { Request, Response } from "express";

import * as db from "../../../database";  // Assuming database functions are in this file

import {createCardMetric, deleteCardMetric, getCardMetric, updateCardMetric} from "../index";
import {createCardMetricDB, deleteCardMetricDB, getCardMetricByCardIdDB, updateCardMetricDB} from "../../../database";


jest.mock("../../../database");

const mockResponse = () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res;
};
describe('Card Metrics Route Handlers', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: jest.Mock;

    beforeEach(() => {
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };
        next = jest.fn();
    });


    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createCardMetric', () => {
        it('should create a new card metric and return success', async () => {
            const cardMetricData = {
                cardId: 'card-id',
                metricType: 'click',
                value: 1,
                timestamp: '2024-11-17T10:00:00Z'
            };

            const mockResponse = { insertedId: 'mockedId' };
            (createCardMetricDB as jest.Mock).mockResolvedValue(mockResponse);

            req.body = cardMetricData;
            await createCardMetric(req as Request, res as Response);

            expect(createCardMetricDB).toHaveBeenCalledWith(cardMetricData);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({
                message: 'Success! CardMetric created successfully',
                cardMetricId: 'mockedId',
            });
        });

        it('should return an error if the creation fails', async () => {
            const cardMetricData = {
                cardId: 'card-id',
                metricType: 'click',
                value: 1,
                timestamp: '2024-11-17T10:00:00Z'
            };

            (createCardMetricDB as jest.Mock).mockResolvedValue(null);  // Simulating a failure

            req.body = cardMetricData;
            await createCardMetric(req as Request, res as Response);

            expect(createCardMetricDB).toHaveBeenCalledWith(cardMetricData);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({
                message: 'Error creating CardMetric',
            });
        });

        it('should catch and handle unexpected errors', async () => {
            const cardMetricData = {
                cardId: 'card-id',
                metricType: 'click',
                value: 1,
                timestamp: '2024-11-17T10:00:00Z'
            };

            (createCardMetricDB as jest.Mock).mockRejectedValue(new Error('Unexpected error'));

            req.body = cardMetricData;
            await createCardMetric(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({
                message: 'Error inserting CardMetric information',
                error: expect.any(Error),
            });
        });
    });

    describe('getCardMetric', () => {
        it('should retrieve a card metric by ID', async () => {

            const cardMetricId = 'mockedId';
            const req = { params: { cardId: cardMetricId } } as any;
            const res = mockResponse();
            const mockCardMetric = {
                userId: "6691e624884c396e75262f7f",
                businessId: "6719b3a31eac0b05bf46b6da",
                status: "active",
                tapCount: 0,
                lastTap: "",
                cardId: 'mockedId',
                metricType: 'click',
                timestamp: '2024-11-17T10:00:00Z'
            };

            (getCardMetricByCardIdDB as jest.Mock).mockResolvedValue(mockCardMetric);

            await getCardMetric(req as Request, res as Response);

            expect(getCardMetricByCardIdDB).toHaveBeenCalledWith(cardMetricId);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith(mockCardMetric);
        });

        it('should return an error if card metric not found', async () => {
            const cardMetricId = 'non-existing-id';
            (getCardMetricByCardIdDB as jest.Mock).mockResolvedValue(null);
            const req = { params: { cardId: cardMetricId } } as any;
            await getCardMetric(req as Request, res as Response);

            expect(db.getCardMetricByCardIdDB).toHaveBeenCalledWith(cardMetricId);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.send).toHaveBeenCalledWith({
                message: 'Unable to find CardMetric',
            });
        });

        it('should handle errors when retrieving card metric', async () => {
            const cardMetricId = 'mockedId';
            (getCardMetricByCardIdDB as jest.Mock).mockRejectedValue(new Error('Database error'));
            const req = { params: { cardId: cardMetricId } } as any;
            await getCardMetric(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({
                message: 'Error retrieving CardMetric information',
                error: expect.any(Error),
            });
        });
    });

    describe('updateCardMetric', () => {
        it('should update the card metric and return success', async () => {
            const cardMetricId = 'mockedId';
            const updatedData = { value: 2 };
            const updatedCardMetric = { ...updatedData, cardId: 'card-id' };

            (updateCardMetricDB as jest.Mock).mockResolvedValue(updatedCardMetric);

            const req = { params: { cardId: cardMetricId } } as any;
            req.body = updatedData;
            await updateCardMetric(req as Request, res as Response);

            expect(db.updateCardMetricDB).toHaveBeenCalledWith(cardMetricId, updatedData);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith(updatedCardMetric);
        });

        it('should return an error if card metric not found', async () => {
            const cardMetricId = 'non-existing-id';
            const updatedData = { value: 2 };

            (updateCardMetricDB as jest.Mock).mockResolvedValue(null);

            const req = { params: { cardId: cardMetricId } } as any;
            req.body = updatedData;
            await updateCardMetric(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.send).toHaveBeenCalledWith({
                message: 'Unable to find CardMetric',
            });
        });

        it('should handle errors during update', async () => {
            const cardMetricId = 'mockedId';
            const updatedData = { value: 2 };

            (updateCardMetricDB as jest.Mock).mockRejectedValue(new Error('Database error'));

            const req = { params: { cardId: cardMetricId } } as any;
            req.body = updatedData;
            await updateCardMetric(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({
                message: 'Error updating CardMetric information',
                error: expect.any(Error),
            });
        });
    });

    describe('deleteCardMetric', () => {
        it('should delete the card metric and return success', async () => {
            const cardMetricId = 'mockedId';
            const deletedResponse = { deletedCount: 1 };

            (deleteCardMetricDB as jest.Mock).mockResolvedValue(deletedResponse);

            const req = { params: { cardId: cardMetricId } } as any;
            await deleteCardMetric(req as Request, res as Response);

            expect(db.deleteCardMetricDB).toHaveBeenCalledWith(cardMetricId);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith(deletedResponse);
        });

        it('should return an error if card metric not found', async () => {
            const cardMetricId = 'non-existing-id';
            (deleteCardMetricDB as jest.Mock).mockResolvedValue(null);

            const req = { params: { cardId: cardMetricId } } as any;
            await deleteCardMetric(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.send).toHaveBeenCalledWith({
                message: 'Unable to find CardMetric',
            });
        });

        it('should handle errors during deletion', async () => {
            const cardMetricId = 'mockedId';
            (deleteCardMetricDB as jest.Mock).mockRejectedValue(new Error('Delete error'));

            const req = { params: { cardId: cardMetricId } } as any;
            await deleteCardMetric(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({
                message: 'Error deleting CardMetric',
                error: expect.any(Error),
            });
        });
    });
});
