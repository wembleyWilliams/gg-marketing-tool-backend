/**
 * @file Unit tests for hashHandler utility
 * @description Tests for cryptographic hash utilities using SHA-256 algorithm
 */

import hashHandler from '../index';
import * as crypto from 'crypto';

// Mock the crypto module
jest.mock('crypto');
const mockedCrypto = crypto as jest.Mocked<typeof crypto>;

describe('HashHandler Test Suite', () => {
    describe('hashHandler.createSHA256Hash', () => {
        const mockUpdate = jest.fn().mockReturnThis(); // chainable
        const mockDigest = jest.fn();
        const mockCreateHash = jest.fn().mockReturnValue({
            update: mockUpdate,
            digest: mockDigest,
        });

        beforeAll(() => {
            jest.spyOn(crypto, 'createHash').mockImplementation(mockCreateHash);
        });

        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should generate SHA-256 hash for valid string input', async () => {
            const input = 'test string';
            const expectedHash = 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e';

            mockDigest.mockReturnValue(expectedHash);

            const result = await hashHandler.createSHA256Hash(input);

            expect(crypto.createHash).toHaveBeenCalledWith('sha256');
            expect(mockUpdate).toHaveBeenCalledWith(input);
            expect(mockDigest).toHaveBeenCalledWith('hex');
            expect(result).toBe(expectedHash);
        });

        it('should throw error for invalid input', async () => {
            await expect(hashHandler.createSHA256Hash("")).rejects.toThrow('Invalid input');
            await expect(hashHandler.createSHA256Hash(null as any)).rejects.toThrow('Invalid input');
        });

        it('should throw error if hashing fails internally', async () => {
            mockCreateHash.mockImplementationOnce(() => { throw new Error('Mock failure'); });

            await expect(hashHandler.createSHA256Hash("test")).rejects.toThrow('Failed to generate hash');
        });
    });
});