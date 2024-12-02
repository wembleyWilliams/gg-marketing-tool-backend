// import {
//     createCardMetric,
//     getCardMetric,
//     updateCardMetric,
//     deleteCardMetric
// } from "../../index";
//
// import request from 'supertest';
// import express from "express";
// import { getCardMetricByIdDB } from "../../../../database";
// import metric from "../index";
//
//
// // Set up Express app
// const app = express();
// app.use(express.json());
// app.use('/metric', metric)
//
//
// jest.mock('../index', () => ({
//     createCardMetric: jest.fn(),
//     getCardMetric: jest.fn(),
//     updateCardMetric: jest.fn(),
//     deleteCardMetric: jest.fn()
// }));
//
// jest.mock('../../../../database', () => ({
//     getCardMetricByIdDB: jest.fn()
// }));
//
// // Test cases for the metric route handlers
// xdescribe('Metric Routes', () => {
//
//     // GET /metric/:metricId
//     describe('GET /metric/:metricId', () => {
//         it('should retrieve a card metric by ID', async () => {
//             const mockCardMetric = {
//                 id: 'mockedId',
//                 cardId: 'mockedCardId',
//                 metricType: 'click',
//                 value: 1,
//                 timestamp: '2024-11-17T10:00:00Z'
//             };
//             (getCardMetric as jest.Mock).mockImplementation((req, res) => {
//                 res.status(200).json(mockCardMetric);
//             });
//
//             const response = await request(app).get('/metric/mockedId');
//
//             expect(response.status).toBe(200);
//             expect(response.body).toEqual(mockCardMetric);
//             expect(getCardMetric).toHaveBeenCalled();
//         });
//
//         it('should return 404 if metric is not found', async () => {
//             (getCardMetric as jest.Mock).mockImplementation((req, res) => {
//                 res.status(404).json({ message: 'Metric not found' });
//             });
//
//             const response = await request(app).get('/metric/nonexistentId');
//
//             expect(response.status).toBe(404);
//             expect(response.body).toEqual({ message: 'Metric not found' });
//         });
//     });
//
//     // POST /metric/create
//     describe('POST /metric/create', () => {
//         it('should create a new card metric', async () => {
//             const newCardMetric = {
//                 cardId: 'mockedCardId',
//                 metricType: 'click',
//                 value: 2,
//                 timestamp: '2024-11-18T10:00:00Z'
//             };
//             const mockResponse = {
//                 id: 'newMetricId',
//                 ...newCardMetric
//             };
//
//             (createCardMetric as jest.Mock).mockImplementation((req, res) => {
//                 res.status(201).json(mockResponse);
//             });
//
//             const response = await request(app)
//                 .post('/metric/create')
//                 .send(newCardMetric);
//
//             expect(response.status).toBe(201);
//             expect(response.body).toEqual(mockResponse);
//             expect(createCardMetric).toHaveBeenCalled();
//         });
//
//         it('should return 500 if there is an error', async () => {
//             (createCardMetric as jest.Mock).mockImplementation((req, res) => {
//                 res.status(500).json({ message: 'Error creating metric' });
//             });
//
//             const response = await request(app)
//                 .post('/metric/create')
//                 .send({ cardId: 'mockedCardId' });  // Missing some required fields
//
//             expect(response.status).toBe(500);
//             expect(response.body).toEqual({ message: 'Error creating metric' });
//         });
//     });
//
//     // POST /metric/update/:metricId
//     describe('POST /metric/update/:metricId', () => {
//         it('should update an existing card metric', async () => {
//             const updateData = {
//                 value: 3
//             };
//             const mockResponse = {
//                 id: 'mockedId',
//                 cardId: 'mockedCardId',
//                 metricType: 'click',
//                 value: 3,
//                 timestamp: '2024-11-19T10:00:00Z'
//             };
//
//             (updateCardMetric as jest.Mock).mockImplementation((req, res) => {
//                 res.status(200).json(mockResponse);
//             });
//
//             const response = await request(app)
//                 .post('/metric/update/mockedId')
//                 .send(updateData);
//
//             expect(response.status).toBe(200);
//             expect(response.body).toEqual(mockResponse);
//             expect(updateCardMetric).toHaveBeenCalled();
//         });
//
//         it('should return 404 if metric is not found', async () => {
//             (updateCardMetric as jest.Mock).mockImplementation((req, res) => {
//                 res.status(404).json({ message: 'Metric not found' });
//             });
//
//             const response = await request(app)
//                 .post('/metric/update/nonexistentId')
//                 .send({ value: 3 });
//
//             expect(response.status).toBe(404);
//             expect(response.body).toEqual({ message: 'Metric not found' });
//         });
//     });
//
//     // DELETE /metric/delete/:metricId
//     describe('DELETE /metric/delete/:metricId', () => {
//         it('should delete a card metric', async () => {
//             const mockResponse = { message: 'Metric deleted successfully' };
//
//             (deleteCardMetric as jest.Mock).mockImplementation((req, res) => {
//                 res.status(200).json(mockResponse);
//             });
//
//             const response = await request(app).delete('/metric/delete/mockedId');
//
//             expect(response.status).toBe(200);
//             expect(response.body).toEqual(mockResponse);
//             expect(deleteCardMetric).toHaveBeenCalled();
//         });
//
//         it('should return 404 if metric is not found', async () => {
//             (deleteCardMetric as jest.Mock).mockImplementation((req, res) => {
//                 res.status(404).json({ message: 'Metric not found' });
//             });
//
//             const response = await request(app).delete('/metric/delete/nonexistentId');
//
//             expect(response.status).toBe(404);
//             expect(response.body).toEqual({ message: 'Metric not found' });
//         });
//     });
//
// });
