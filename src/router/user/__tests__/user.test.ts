import { createUser, getUserById, updateUser, listUsers } from '../routes';
import { createUserDB, getUserByIdDB, updateUserDB, listUsersDB } from '../../../database';

jest.mock('../../../database');

describe('createUser', () => {
    let req: any;
    let res: any;

    beforeEach(() => {
        req = { body: { name: 'John Doe', email: 'john@example.com' } };
        res = {
            status: jest.fn(() => res),
            json: jest.fn(),
        };
    });

    it('should create a user and return 201 status', async () => {
        const mockUser = { id: 1, name: 'John Doe' };
        (createUserDB as jest.Mock).mockResolvedValue(mockUser);

        await createUser(req, res);

        expect(createUserDB).toHaveBeenCalledWith(req.body);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            message: 'User created successfully',
            result: mockUser,
        });
    });

    it('should return 500 if an error occurs', async () => {
        const error = new Error('Error creating user');
        (createUserDB as jest.Mock).mockRejectedValue(error);

        await createUser(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Error creating user',
            error,
        });
    });
});

describe('getUserById', () => {
    let req: any;
    let res: any;

    beforeEach(() => {
        req = { params: { userId: '1' } };
        res = {
            status: jest.fn(() => res),
            json: jest.fn(),
        };
    });

    it('should return the user if found', async () => {
        const mockUser = { id: 1, name: 'John Doe' };
        (getUserByIdDB as jest.Mock).mockResolvedValue(mockUser);

        await getUserById(req, res);

        expect(getUserByIdDB).toHaveBeenCalledWith('1');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    it('should return 404 if the user is not found', async () => {
        (getUserByIdDB as jest.Mock).mockResolvedValue(null);

        await getUserById(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    });

    it('should return 500 if an error occurs', async () => {
        const error = new Error('Database error');
        (getUserByIdDB as jest.Mock).mockRejectedValue(error);

        await getUserById(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Error retrieving user',
            error,
        });
    });
});

describe('updateUser', () => {
    let req: any;
    let res: any;

    beforeEach(() => {
        req = {
            params: { userId: '1' },
            body: { name: 'John Updated' },
        };
        res = {
            status: jest.fn(() => res),
            json: jest.fn(),
        };
    });

    it('should update the user and return 200 status', async () => {
        const mockResult = { modifiedCount: 1 };
        (updateUserDB as jest.Mock).mockResolvedValue(mockResult);

        await updateUser(req, res);

        expect(updateUserDB).toHaveBeenCalledWith('1', req.body);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'User updated successfully',
            result: mockResult,
        });
    });

    it('should return 500 if an error occurs', async () => {
        const error = new Error('Database error');
        (updateUserDB as jest.Mock).mockRejectedValue(error);

        await updateUser(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Error updating user',
            error,
        });
    });
});

describe('listUsers', () => {
    let req: any;
    let res: any;

    beforeEach(() => {
        req = {};
        res = {
            status: jest.fn(() => res),
            json: jest.fn(),
        };
    });

    it('should return the list of users', async () => {
        const mockUsers = [{ id: 1, name: 'John Doe' }];
        (listUsersDB as jest.Mock).mockResolvedValue(mockUsers);

        await listUsers(req, res);

        expect(listUsersDB).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockUsers);
    });

    it('should return 500 if an error occurs', async () => {
        const error = new Error('Database error');
        (listUsersDB as jest.Mock).mockRejectedValue(error);

        await listUsers(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Error listing users',
            error,
        });
    });
});
