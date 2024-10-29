import {
    createSocial,
    deleteSocial,
    getSocial,
    updateSocial
} from '../index'; // Adjust the path to the correct location
import {
    createSocialDB,
    deleteSocialDB,
    getSocialDB,
    getSocialByUserIdDB,
    updateLogoDB,
    updateSocialHandlesDB, updateSocialDB,
} from '../../../database'; // Mocked database functions
import logger from '../../../logger/logger';

// Mocking database functions and logger
jest.mock('../../../database', () => ({
    createSocialDB: jest.fn(),
    deleteSocialDB: jest.fn(),
    getSocialByUserIdDB: jest.fn(),
    getSocialDB: jest.fn(),
    updateLogoDB: jest.fn(),
    updateSocialDB: jest.fn(),
}));
jest.mock('../../../logger/logger', () => ({
    child: () => ({
        info: jest.fn(),
        error: jest.fn(),
    }),
}));

// Mock response object
const mockResponse = () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res;
};

describe('Social Handlers', () => {
    // Test for createSocial
    describe('createSocial', () => {
        it('should create a new social profile and return 201', async () => {
            const req = { body: { name: 'Test Social', logo: 'logo.png' } };
            const res = mockResponse();
            const mockSocial = { id: 1, ...req.body };

            (createSocialDB as jest.Mock).mockResolvedValue(mockSocial);

            await createSocial(req, res);

            expect(createSocialDB).toHaveBeenCalledWith(req.body);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.send).toHaveBeenCalledWith(mockSocial);
        });

        it('should return 500 if there is an error creating a social profile', async () => {
            const req = { body: { name: 'Test Social', logo: 'logo.png' } };
            const res = mockResponse();
            const mockError = new Error('Database error');

            (createSocialDB as jest.Mock).mockRejectedValue(mockError);

            await createSocial(req, res);

            expect(createSocialDB).toHaveBeenCalledWith(req.body);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({
                message: 'Error creating social profile',
                error: mockError,
            });
        });
    });

    // Test for deleteSocial
    describe('deleteSocial', () => {
        it('should delete a social profile and return 200', async () => {
            const req = { params: { socialId: '1' } };
            const res = mockResponse();

            (deleteSocialDB as jest.Mock).mockResolvedValue({ success: true });

            await deleteSocial(req, res);

            expect(deleteSocialDB).toHaveBeenCalledWith('1');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({ success: true });
        });

        it('should return 500 if there is an error deleting a social profile', async () => {
            const req = { params: { socialId: '1' } };
            const res = mockResponse();
            const mockError = new Error('Database error');

            (deleteSocialDB as jest.Mock).mockRejectedValue(mockError);

            await deleteSocial(req, res);

            expect(deleteSocialDB).toHaveBeenCalledWith('1');
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({
                message: 'Error deleting social profile',
                error: mockError,
            });
        });
    });

    // Test for getSocial
    describe('getSocial', () => {
        it('should return a social profile by ID with status 200', async () => {
            const req = { params: { socialId: '1' } };
            const res = mockResponse();
            const mockSocial = { id: '1', name: 'Test Social' };

            (getSocialDB as jest.Mock).mockResolvedValue(mockSocial);

            await getSocial(req, res);

            expect(getSocialDB).toHaveBeenCalledWith('1');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith(mockSocial);
        });

        it('should return 404 if social profile is not found', async () => {
            const req = { params: { socialId: '1' } };
            const res = mockResponse();

            (getSocialDB as jest.Mock).mockResolvedValue(null);

            await getSocial(req, res);

            expect(getSocialDB).toHaveBeenCalledWith('1');
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.send).toHaveBeenCalledWith({ message: 'Social profile not found' });
        });

        it('should return 500 if there is an error retrieving the social profile', async () => {
            const req = { params: { socialId: '1' } };
            const res = mockResponse();
            const mockError = new Error('Database error');

            (getSocialDB as jest.Mock).mockRejectedValue(mockError);

            await getSocial(req, res);

            expect(getSocialDB).toHaveBeenCalledWith('1');
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({
                message: 'Error retrieving social profile',
                error: mockError,
            });
        });
    });

    // Test for modifySocial
    // describe('updateSocial', () => {
    //     it('should update the social handles of a profile and return 200', async () => {
    //         const req = { params: { socialId: '1' }, body: { handle: '@newhandle' } };
    //         const res = mockResponse();
    //         const updatedSocial = { id: '1', handle: '@newhandle' };
    //
    //         (updateSocialHandlesDB as jest.Mock).mockResolvedValue(updatedSocial);
    //
    //         await updateSocial(req, res);
    //
    //         expect(updateSocialHandlesDB).toHaveBeenCalledWith('1', '@newhandle');
    //         expect(res.status).toHaveBeenCalledWith(200);
    //         expect(res.send).toHaveBeenCalledWith(updatedSocial);
    //     });
    //
    //     it('should return 500 if there is an error updating the social handles', async () => {
    //         const req = { params: { socialId: '1' }, body: { profile: '@newhandle' } };
    //         const res = mockResponse();
    //         const mockError = new Error('Database error');
    //
    //         (updateSocialDB as jest.Mock).mockRejectedValue(mockError);
    //
    //         await updateSocial(req, res);
    //
    //         expect(updateSocialDB).toHaveBeenCalledWith('1', '@newhandle');
    //         expect(res.status).toHaveBeenCalledWith(500);
    //         expect(res.send).toHaveBeenCalledWith({
    //             message: 'Error updating social profile',
    //             error: mockError,
    //         });
    //     });
    // });

});
