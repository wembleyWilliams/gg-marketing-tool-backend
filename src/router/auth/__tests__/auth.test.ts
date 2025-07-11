/**
 * @file Unit tests for authService
 * @description Tests for authentication service module
 */

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { loginUser, setNewPassword, verifyTempPassword, generateTempPassword } from '..';
import logger from '../../../logger/logger';
import { utils } from '../../../utils';
import { getUserByEmailDB, updateUserDB } from '../../../database';

// Mock all dependencies
jest.mock('bcryptjs');
jest.mock('../../../logger/logger', () => ({
    __esModule: true,
    default: {
        child: jest.fn(() => ({
            info: jest.fn(),
            error: jest.fn(),
            warn: jest.fn()
        }))
    }
}));
jest.mock('../../../utils');
jest.mock('../../../database');

// Type the mocked modules
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const mockedUtils = utils as jest.Mocked<typeof utils>;
const mockedGetUserByEmailDB = getUserByEmailDB as jest.MockedFunction<typeof getUserByEmailDB>;
const mockedUpdateUserDB = updateUserDB as jest.MockedFunction<typeof updateUserDB>;

// Mock logger
const mockLogger = {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    child: jest.fn(() => ({
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
    }))
};
(logger as any).child = jest.fn(() => mockLogger);

describe('authService', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();

        // Setup mock response
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        mockRes = {
            status: mockStatus,
            json: mockJson
        };

        // Setup mock request
        mockReq = {
            body: {}
        };
    });

    describe('loginUser', () => {
        beforeEach(() => {
            mockReq.body = {
                email: 'test@example.com',
                password: 'password123'
            };
        });

        it('should successfully login user with valid credentials', async () => {
            const mockUser = {
                _id: '123',
                email: 'test@example.com',
                firstName: 'John',
                lastName: 'Doe',
                password: 'hashedPassword',
                firstLogin: false
            };
            const mockToken = 'jwt.token.xyz';

            mockedGetUserByEmailDB.mockResolvedValue(mockUser);
            mockedBcrypt.compare.mockResolvedValue(true as never);
            mockedUtils.generateJWT.mockReturnValue(mockToken);

            await loginUser(mockReq as Request, mockRes as Response);

            expect(mockedGetUserByEmailDB).toHaveBeenCalledWith('test@example.com');
            expect(mockedBcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
            expect(mockedUtils.generateJWT).toHaveBeenCalledWith(mockUser);
            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                message: 'Login successful',
                token: mockToken,
                user: {
                    _id: '123',
                    email: 'test@example.com',
                    firstName: 'John',
                    lastName: 'Doe'
                }
            });
        });

        it('should return 404 when user not found', async () => {
            mockedGetUserByEmailDB.mockResolvedValue(null);

            await loginUser(mockReq as Request, mockRes as Response);

            expect(mockStatus).toHaveBeenCalledWith(404);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'User not found'
            });
        });

        it('should return 400 when user is in firstLogin state', async () => {
            const mockUser = {
                _id: '123',
                email: 'test@example.com',
                firstName: 'John',
                lastName: 'Doe',
                password: 'hashedPassword',
                firstLogin: true
            };

            mockedGetUserByEmailDB.mockResolvedValue(mockUser);

            await loginUser(mockReq as Request, mockRes as Response);

            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'User must set password before login'
            });
        });

        it('should return 401 when password is incorrect', async () => {
            const mockUser = {
                _id: '123',
                email: 'test@example.com',
                firstName: 'John',
                lastName: 'Doe',
                password: 'hashedPassword',
                firstLogin: false
            };

            mockedGetUserByEmailDB.mockResolvedValue(mockUser);
            mockedBcrypt.compare.mockResolvedValue(false as never);

            await loginUser(mockReq as Request, mockRes as Response);

            expect(mockStatus).toHaveBeenCalledWith(401);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'Incorrect password'
            });
        });

        it('should handle server errors', async () => {
            const error = new Error('Database error');
            mockedGetUserByEmailDB.mockRejectedValue(error);

            await loginUser(mockReq as Request, mockRes as Response);

            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'Server error during login',
                error
            });
        });
    });

    describe('setNewPassword', () => {
        beforeEach(() => {
            mockReq.body = {
                email: 'test@example.com',
                newPassword: 'newPassword123'
            };
        });

        it('should successfully set new password for first-time user', async () => {
            const mockUser = {
                _id: '123',
                email: 'test@example.com',
                firstName: 'John',
                lastName: 'Doe',
                password: 'tempPassword',
                firstLogin: true
            };
            const mockFreshUser = {
                ...mockUser,
                firstLogin: false,
                password: 'hashedNewPassword'
            };
            const mockToken = 'jwt.token.xyz';

            mockedGetUserByEmailDB.mockResolvedValueOnce(mockUser);
            mockedUtils.setNewPassword.mockResolvedValue(undefined);
            mockedGetUserByEmailDB.mockResolvedValueOnce(mockFreshUser);
            mockedUtils.generateJWT.mockReturnValue(mockToken);

            await setNewPassword(mockReq as Request, mockRes as Response);

            expect(mockedUtils.setNewPassword).toHaveBeenCalledWith('test@example.com', 'newPassword123');
            expect(mockedGetUserByEmailDB).toHaveBeenCalledTimes(2);
            expect(mockedUtils.generateJWT).toHaveBeenCalledWith(mockFreshUser);
            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                message: 'Password successfully set',
                token: mockToken,
                user: {
                    _id: '123',
                    email: 'test@example.com',
                    firstName: 'John',
                    lastName: 'Doe'
                }
            });
        });

        it('should return 404 when user not found', async () => {
            mockedGetUserByEmailDB.mockResolvedValue(null);

            await setNewPassword(mockReq as Request, mockRes as Response);

            expect(mockStatus).toHaveBeenCalledWith(404);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'User not found'
            });
        });

        it('should return 400 when password already set', async () => {
            const mockUser = {
                _id: '123',
                email: 'test@example.com',
                firstName: 'John',
                lastName: 'Doe',
                password: 'hashedPassword',
                firstLogin: false
            };

            mockedGetUserByEmailDB.mockResolvedValue(mockUser);

            await setNewPassword(mockReq as Request, mockRes as Response);

            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'Password already set or user not eligible'
            });
        });

        it('should handle server errors', async () => {
            const error = new Error('Database error');
            mockedGetUserByEmailDB.mockRejectedValue(error);

            await setNewPassword(mockReq as Request, mockRes as Response);

            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'Server error setting new password',
                error
            });
        });
    });

    describe('verifyTempPassword', () => {
        beforeEach(() => {
            mockReq.body = {
                email: 'test@example.com',
                tempPassword: 'temp123'
            };
        });

        it('should successfully verify temporary password', async () => {
            const mockUser = {
                _id: '123',
                email: 'test@example.com',
                firstName: 'John',
                lastName: 'Doe',
                password: 'hashedTempPassword',
                firstLogin: true
            };

            mockedGetUserByEmailDB.mockResolvedValue(mockUser);
            mockedBcrypt.compare.mockResolvedValue(true as never);

            await verifyTempPassword(mockReq as Request, mockRes as Response);

            expect(mockedBcrypt.compare).toHaveBeenCalledWith('temp123', 'hashedTempPassword');
            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                message: 'Temporary password verified'
            });
        });

        it('should return 404 when user not found', async () => {
            mockedGetUserByEmailDB.mockResolvedValue(null);

            await verifyTempPassword(mockReq as Request, mockRes as Response);

            expect(mockStatus).toHaveBeenCalledWith(404);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'User not found'
            });
        });

        it('should return 400 when user already completed first login', async () => {
            const mockUser = {
                _id: '123',
                email: 'test@example.com',
                firstName: 'John',
                lastName: 'Doe',
                password: 'hashedPassword',
                firstLogin: false
            };

            mockedGetUserByEmailDB.mockResolvedValue(mockUser);

            await verifyTempPassword(mockReq as Request, mockRes as Response);

            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'User already completed first login'
            });
        });

        it('should return 401 when temporary password is invalid', async () => {
            const mockUser = {
                _id: '123',
                email: 'test@example.com',
                firstName: 'John',
                lastName: 'Doe',
                password: 'hashedTempPassword',
                firstLogin: true
            };

            mockedGetUserByEmailDB.mockResolvedValue(mockUser);
            mockedBcrypt.compare.mockResolvedValue(false as never);

            await verifyTempPassword(mockReq as Request, mockRes as Response);

            expect(mockStatus).toHaveBeenCalledWith(401);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'Invalid temporary password'
            });
        });

        it('should handle server errors', async () => {
            const error = new Error('Database error');
            mockedGetUserByEmailDB.mockRejectedValue(error);

            await verifyTempPassword(mockReq as Request, mockRes as Response);

            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'Server error verifying temp password',
                error
            });
        });
    });

    describe('generateTempPassword', () => {
        beforeEach(() => {
            mockReq.body = {
                email: 'test@example.com'
            };
        });

        it('should successfully generate temporary password', async () => {
            const mockResult = {
                tempPassword: 'abc123xyz!',
                hash: '$2a$12$something'
            };

            // mockedUtils.generateTempPassword.mockResolvedValue(mockResult);
            mockedUtils.generateTempPassword = jest.fn().mockResolvedValue(mockResult)

            await generateTempPassword(mockReq as Request, mockRes as Response);

            expect(mockedUtils.generateTempPassword).toHaveBeenCalledWith('test@example.com');
            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith({
                tempPassword: 'abc123xyz!',
                hash: '$2a$12$something',
                success: true
            });
        });

        it('should return 404 when user not found or generation failed', async () => {
            mockedUtils.generateTempPassword.mockResolvedValue(null);

            await generateTempPassword(mockReq as Request, mockRes as Response);

            expect(mockStatus).toHaveBeenCalledWith(404);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'User not found or generation failed'
            });
        });

        it('should handle server errors', async () => {
            const error = new Error('Email service error');
            mockedUtils.generateTempPassword.mockRejectedValue(error);

            await generateTempPassword(mockReq as Request, mockRes as Response);

            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'Error generating temp password',
                error
            });
        });
    });

    describe('Edge cases and additional scenarios', () => {
        it('should handle missing email in request body', async () => {
            mockReq.body = { password: 'password123' };

            await loginUser(mockReq as Request, mockRes as Response);

            expect(mockedGetUserByEmailDB).toHaveBeenCalledWith(undefined);
        });

        it('should handle missing password in request body', async () => {
            mockReq.body = { email: 'test@example.com' };

            const mockUser = {
                _id: '123',
                email: 'test@example.com',
                firstName: 'John',
                lastName: 'Doe',
                password: 'hashedPassword',
                firstLogin: false
            };

            mockedGetUserByEmailDB.mockResolvedValue(mockUser);
            mockedBcrypt.compare.mockResolvedValue(false as never);

            await loginUser(mockReq as Request, mockRes as Response);

            expect(mockedBcrypt.compare).toHaveBeenCalledWith(undefined, 'hashedPassword');
        });

        it('should handle bcrypt.compare throwing an error', async () => {
            const mockUser = {
                _id: '123',
                email: 'test@example.com',
                firstName: 'John',
                lastName: 'Doe',
                password: 'hashedPassword',
                firstLogin: false
            };

            mockReq.body = { email: 'test@example.com', password: 'password123' };

            mockedGetUserByEmailDB.mockResolvedValue(mockUser);
            mockedBcrypt.compare.mockRejectedValue(new Error('Bcrypt error') as never);

            await loginUser(mockReq as Request, mockRes as Response);

            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'Server error during login',
                error: expect.any(Error)
            });
        });

        it('should handle JWT generation failure', async () => {
            const mockUser = {
                _id: '123',
                email: 'test@example.com',
                firstName: 'John',
                lastName: 'Doe',
                password: 'hashedPassword',
                firstLogin: false
            };

            mockReq.body = { email: 'test@example.com', password: 'password123' };

            mockedGetUserByEmailDB.mockResolvedValue(mockUser);
            mockedBcrypt.compare.mockResolvedValue(true as never);
            mockedUtils.generateJWT.mockImplementation(() => {
                throw new Error('JWT generation failed');
            });

            await loginUser(mockReq as Request, mockRes as Response);

            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({
                success: false,
                message: 'Server error during login',
                error: expect.any(Error)
            });
        });
    });
});