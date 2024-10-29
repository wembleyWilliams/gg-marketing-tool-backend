import {
    createBusiness,
    deleteBusiness,
    getBusiness, getBusinessByUserId,
    updateBusiness,
    updateBusinessLogo,
} from '../index'; // Adjust the path to the correct location
import {
    createBusinessDB,
    deleteBusinessDB,
    getBusinessByIdDB, getBusinessByUserIdDB,
    updateLogoDB,
    updateSocialHandlesDB,
} from '../../../database'; // Mocked database functions
import logger from '../../../logger/logger';

// Mocking database functions and logger
jest.mock('../../../database', () => ({
    createBusinessDB: jest.fn(),
    deleteBusinessDB: jest.fn(),
    getBusinessByIdDB: jest.fn(),
    getBusinessByUserIdDB: jest.fn(),
    updateLogoDB: jest.fn(),
    updateSocialHandlesDB: jest.fn(),
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

describe('Business Handlers', () => {
    // Test for createBusiness
    describe('createBusiness', () => {
        it('should create a new business and return 201', async () => {
            const req = { body: { name: 'Test Business', logo: 'logo.png' } };
            const res = mockResponse();
            const mockBusiness = { id: 1, ...req.body };

            (createBusinessDB as jest.Mock).mockResolvedValue(mockBusiness);

            await createBusiness(req, res);

            expect(createBusinessDB).toHaveBeenCalledWith(req.body);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.send).toHaveBeenCalledWith(mockBusiness);
        });

        it('should return 500 if there is an error creating a business', async () => {
            const req = { body: { name: 'Test Business', logo: 'logo.png' } };
            const res = mockResponse();
            const mockError = new Error('Database error');

            (createBusinessDB as jest.Mock).mockRejectedValue(mockError);

            await createBusiness(req, res);

            expect(createBusinessDB).toHaveBeenCalledWith(req.body);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({
                message: 'Error creating business',
                error: mockError,
            });
        });
    });

    // Test for deleteBusiness
    describe('deleteBusiness', () => {
        it('should delete a business and return 200', async () => {
            const req = { params: { businessId: '1' } };
            const res = mockResponse();

            (deleteBusinessDB as jest.Mock).mockResolvedValue({ success: true });

            await deleteBusiness(req, res);

            expect(deleteBusinessDB).toHaveBeenCalledWith('1');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({ success: true });
        });

        it('should return 500 if there is an error deleting a business', async () => {
            const req = { params: { businessId: '1' } };
            const res = mockResponse();
            const mockError = new Error('Database error');

            (deleteBusinessDB as jest.Mock).mockRejectedValue(mockError);

            await deleteBusiness(req, res);

            expect(deleteBusinessDB).toHaveBeenCalledWith('1');
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({
                message: 'Error deleting business',
                error: mockError,
            });
        });
    });

    // Test for getBusiness
    describe('getBusiness', () => {
        it('should return a business by ID with status 200', async () => {
            const req = { params: { businessId: '1' } };
            const res = mockResponse();
            const mockBusiness = { id: '1', name: 'Test Business' };

            (getBusinessByIdDB as jest.Mock).mockResolvedValue(mockBusiness);

            await getBusiness(req, res);

            expect(getBusinessByIdDB).toHaveBeenCalledWith('1');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith(mockBusiness);
        });

        it('should return 404 if business is not found', async () => {
            const req = { params: { businessId: '1' } };
            const res = mockResponse();

            (getBusinessByIdDB as jest.Mock).mockResolvedValue(null);

            await getBusiness(req, res);

            expect(getBusinessByIdDB).toHaveBeenCalledWith('1');
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.send).toHaveBeenCalledWith({ message: 'Business not found' });
        });

        it('should return 500 if there is an error retrieving the business', async () => {
            const req = { params: { businessId: '1' } };
            const res = mockResponse();
            const mockError = new Error('Database error');

            (getBusinessByIdDB as jest.Mock).mockRejectedValue(mockError);

            await getBusiness(req, res);

            expect(getBusinessByIdDB).toHaveBeenCalledWith('1');
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({
                message: 'Error retrieving business',
                error: mockError,
            });
        });
    });

    // Test for getBusinessByUserId


        // Test for getBusinessByUserId
        describe('getBusinessByUserId', () => {


// Mock response object
            const mockResponse = () => {
                const res: any = {};
                res.status = jest.fn().mockReturnValue(res);
                res.send = jest.fn().mockReturnValue(res);
                return res;
            };

            it('should return a business by user ID with status 200', async () => {
                const req = { params: { userId: '1' } };
                const res = mockResponse();
                const mockBusiness = { id: '1', name: 'User Business' };

                (getBusinessByUserIdDB as jest.Mock).mockResolvedValue(mockBusiness);

                await getBusinessByUserId(req, res);

                expect(getBusinessByUserIdDB).toHaveBeenCalledWith('1');
                expect(res.status).toHaveBeenCalledWith(200);
                expect(res.send).toHaveBeenCalledWith(mockBusiness);
            });

            it('should return 404 if no business found for user ID', async () => {
                const req = { params: { userId: '1' } };
                const res = mockResponse();

                (getBusinessByUserIdDB as jest.Mock).mockResolvedValue(null);

                await getBusinessByUserId(req, res);

                expect(getBusinessByUserIdDB).toHaveBeenCalledWith('1');
                expect(res.status).toHaveBeenCalledWith(404);
                expect(res.send).toHaveBeenCalledWith({ message: 'Business not found' });
            });

            it('should return 500 if there is an error retrieving the business', async () => {
                const req = { params: { userId: '1' } };
                const res = mockResponse();
                const mockError = new Error('Error retrieving business');

                (getBusinessByUserIdDB as jest.Mock).mockRejectedValue(mockError);

                await getBusinessByUserId(req, res);

                expect(getBusinessByUserIdDB).toHaveBeenCalledWith('1');
                expect(res.status).toHaveBeenCalledWith(500);
                expect(res.send).toHaveBeenCalledWith({
                    message: 'Error retrieving business',
                    error: 'Error retrieving business', // match err.message as a string
                });
            });

        });

    // Test for modifyBusiness
    describe('updateBusiness', () => {
        it('should update the social handles of a business and return 200', async () => {
            const req = { params: { businessId: '1' }, body: { handle: '@newhandle' } };
            const res = mockResponse();
            const updatedBusiness = { id: '1', handle: '@newhandle' };

            (updateSocialHandlesDB as jest.Mock).mockResolvedValue(updatedBusiness);

            await updateBusiness(req, res);

            expect(updateSocialHandlesDB).toHaveBeenCalledWith('1', '@newhandle');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith(updatedBusiness);
        });

        it('should return 500 if there is an error updating the social handles', async () => {
            const req = { params: { businessId: '1' }, body: { handle: '@newhandle' } };
            const res = mockResponse();
            const mockError = new Error('Database error');

            (updateSocialHandlesDB as jest.Mock).mockRejectedValue(mockError);

            await updateBusiness(req, res);

            expect(updateSocialHandlesDB).toHaveBeenCalledWith('1', '@newhandle');
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({
                message: 'Error updating business social handles',
                error: mockError,
            });
        });
    });

    // Test for updateBusinessLogo
    describe('updateBusinessLogo', () => {
        it('should update the business logo and return 200', async () => {
            const req = { params: { businessId: '1' }, body: { logo: 'newLogo.png' } };
            const res = mockResponse();

            (updateLogoDB as jest.Mock).mockResolvedValue({ modifiedCount: 1 });

            await updateBusinessLogo(req, res);

            expect(updateLogoDB).toHaveBeenCalledWith('1', { logo: 'newLogo.png' });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith('Logo Document updated');
        });

        it('should return 502 if logo update fails', async () => {
            const req = { params: { businessId: '1' }, body: { logo: 'newLogo.png' } };
            const res = mockResponse();

            (updateLogoDB as jest.Mock).mockResolvedValue({ modifiedCount: 0 });

            await updateBusinessLogo(req, res);

            expect(updateLogoDB).toHaveBeenCalledWith('1', { logo: 'newLogo.png' });
            expect(res.status).toHaveBeenCalledWith(502);
            expect(res.send).toHaveBeenCalledWith('Logo Document not updated');
        });

        it('should return 500 if there is an error updating the logo', async () => {
            const req = { params: { businessId: '1' }, body: { logo: 'newLogo.png' } };
            const res = mockResponse();
            const mockError = new Error('Database error');

            (updateLogoDB as jest.Mock).mockRejectedValue(mockError);

            await updateBusinessLogo(req as any, res as any );

            expect(updateLogoDB).toHaveBeenCalledWith('1', {logo:'newLogo.png'});
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({
                message: 'Error updating business logo',
                error: mockError,
            });
        });
    });
});
