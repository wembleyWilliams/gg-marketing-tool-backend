import request from 'supertest';
import express from 'express';
import logger from '../logger/logger';
import { healthDB } from '../database';

// Mocking dependencies
jest.mock('../database', () => ({
    healthDB: jest.fn(),
}));
jest.mock('../logger/logger', () => ({
    child: () => ({
        info: jest.fn(),
        error: jest.fn(),
    }),
}));

describe('GET /health', () => {
    let app: express.Application;

    beforeEach(() => {
        app = express();

        // Mock logger
        const mainLogger = logger.child({ context: 'main' });

        // Health route
        app.get('/health', async (req, res) => {
            try {
                const healthReport = await healthDB();
                mainLogger.info(`Health check performed: ${JSON.stringify(healthReport)}`);

                if (healthReport.status === 'healthy') {
                    res.status(200).json(healthReport);
                } else {
                    res.status(503).json(healthReport);
                }
            } catch (error) {
                mainLogger.error('Error during health check', error);
                res.status(500).json({ status: 'error', message: 'Health check failed' });
            }
        });
    });

    it('should return 200 and a healthy report when the database is healthy', async () => {
        const mockHealthReport = {
            dbConnection: 'connected',
            status: 'healthy',
            uptime: process.uptime(),
        };

        (healthDB as jest.Mock).mockResolvedValue(mockHealthReport);

        const response = await request(app).get('/health');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockHealthReport);
    });

    it('should return 503 when the health report status is not healthy', async () => {
        const mockHealthReport = {
            dbConnection: 'disconnected',
            status: 'unhealthy',
            uptime: process.uptime(),
        };

        (healthDB as jest.Mock).mockResolvedValue(mockHealthReport);

        const response = await request(app).get('/health');

        expect(response.status).toBe(503);
        expect(response.body).toEqual(mockHealthReport);
    });

    it('should return 500 when there is an error during the health check', async () => {
        (healthDB as jest.Mock).mockRejectedValue(new Error('Database error'));

        const response = await request(app).get('/health');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({
            status: 'error',
            message: 'Health check failed',
        });
    });
});
