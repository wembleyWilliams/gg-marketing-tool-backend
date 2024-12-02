import request from 'supertest';
import express from 'express';
import {
    createUser,
    loginUser,
    getUserById,
    updateUser,
    deleteUser,
    listUsers
} from '../index';
import user from "../../index";

jest.mock('../index', () => ({
    createUser: jest.fn(),
    loginUser: jest.fn(),
    getUserById: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
    listUsers: jest.fn(),
}));

// Set up Express app
const app = express();
app.use(express.json());
app.use('/user', user); // Adjust the path to the actual user routes file


describe('User Routes', () => {

    // POST /user/auth/signup
    describe('POST /user/auth/signup', () => {
        it('should create a new user', async () => {
            const newUser = { name: 'John Doe', email: 'john@example.com', password: '123456' };
            const mockResponse = { id: 1, ...newUser };

            (createUser as jest.Mock).mockImplementation((req, res) => {
                res.status(201).json(mockResponse);
            });

            const response = await request(app)
                .post('/user/auth/signup')
                .send(newUser);

            expect(response.status).toBe(201);
            expect(response.body).toEqual(mockResponse);
            expect(createUser).toHaveBeenCalled();
        });

        it('should return 500 if there is an error', async () => {
            (createUser as jest.Mock).mockImplementation((req, res) => {
                res.status(500).json({ message: 'Error creating user' });
            });

            const response = await request(app)
                .post('/user/auth/signup')
                .send({ name: '', email: 'invalid' });

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: 'Error creating user' });
        });
    });

    // POST /user/auth/login
    describe('POST /user/auth/login', () => {
        it('should log in the user', async () => {
            const loginData = { email: 'john@example.com', password: '123456' };
            const mockResponse = { token: 'abc123', user: { id: 1, name: 'John Doe' } };

            (loginUser as jest.Mock).mockImplementation((req, res) => {
                res.status(200).json(mockResponse);
            });

            const response = await request(app)
                .post('/user/auth/login')
                .send(loginData);

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockResponse);
            expect(loginUser).toHaveBeenCalled();
        });

        it('should return 401 if login fails', async () => {
            (loginUser as jest.Mock).mockImplementation((req, res) => {
                res.status(401).json({ message: 'Invalid credentials' });
            });

            const response = await request(app)
                .post('/user/auth/login')
                .send({ email: 'john@example.com', password: 'wrongpassword' });

            expect(response.status).toBe(401);
            expect(response.body).toEqual({ message: 'Invalid credentials' });
        });
    });

    // GET /user/:userId
    describe('GET /user/:userId', () => {
        it('should retrieve a user by ID', async () => {
            const mockUser = { id: 1, name: 'John Doe' };
            (getUserById as jest.Mock).mockImplementation((req, res) => {
                res.status(200).json(mockUser);
            });

            const response = await request(app).get('/user/1');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockUser);
            expect(getUserById).toHaveBeenCalled();
        });

        it('should return 404 if user is not found', async () => {
            (getUserById as jest.Mock).mockImplementation((req, res) => {
                res.status(404).json({ message: 'User not found' });
            });

            const response = await request(app).get('/user/999');

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: 'User not found' });
        });
    });

    // PUT /user/:userId
    describe('PUT /user/:userId', () => {
        it('should update the user', async () => {
            const updateData = { name: 'Jane Doe' };
            const mockResponse = { id: 1, name: 'Jane Doe' };

            (updateUser as jest.Mock).mockImplementation((req, res) => {
                res.status(200).json(mockResponse);
            });

            const response = await request(app)
                .put('/user/1')
                .send(updateData);

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockResponse);
            expect(updateUser).toHaveBeenCalled();
        });

        it('should return 500 if there is an error', async () => {
            (updateUser as jest.Mock).mockImplementation((req, res) => {
                res.status(500).json({ message: 'Error updating user' });
            });

            const response = await request(app)
                .put('/user/1')
                .send({ name: '' });

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: 'Error updating user' });
        });
    });

    // DELETE /user/:userId
    describe('DELETE /user/:userId', () => {
        it('should delete the user', async () => {
            (deleteUser as jest.Mock).mockImplementation((req, res) => {
                res.status(200).json({ message: 'User deleted successfully' });
            });

            const response = await request(app).delete('/user/1');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ message: 'User deleted successfully' });
            expect(deleteUser).toHaveBeenCalled();
        });

        it('should return 404 if user is not found', async () => {
            (deleteUser as jest.Mock).mockImplementation((req, res) => {
                res.status(404).json({ message: 'User not found' });
            });

            const response = await request(app).delete('/user/999');

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: 'User not found' });
        });
    });

    // GET /user/
    describe('GET /user/', () => {
        it('should list all users', async () => {
            const mockUsers = [
                { id: 1, name: 'John Doe' },
                { id: 2, name: 'Jane Doe' },
            ];

            (listUsers as jest.Mock).mockImplementation((req, res) => {
                res.status(200).json(mockUsers);
            });

            const response = await request(app).get('/user/');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockUsers);
            expect(listUsers).toHaveBeenCalled();
        });

        it('should return 500 if there is an error', async () => {
            (listUsers as jest.Mock).mockImplementation((req, res) => {
                res.status(500).json({ message: 'Error listing users' });
            });

            const response = await request(app).get('/user/');

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: 'Error listing users' });
        });
    });
});
