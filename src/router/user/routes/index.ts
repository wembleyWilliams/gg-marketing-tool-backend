import { Request, Response } from 'express';
import logger from '../../../logger/logger';
const passport = require("passport");
import {
    createUserDB,
    getUserByIdDB,
    updateUserDB,
    deleteUserDB,
    listUsersDB
} from '../../../database'; // Import your database functions

// Logging
const userLogger = logger.child({ context: 'userService' });

/**
 * Authenticates the user using passport.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {Function} next - The next middleware function.
 */
export const loginUser = (req: Request, res: Response, next: Function) => {
    userLogger.info('Logging in user');

    passport.authenticate('local', (err: any, user: any, info: any) => {
        if (err) {
            userLogger.error('Authentication error', { error: err });
            return res.status(401).send(err);
        }

        if (!user) {
            userLogger.warn('User not found', { info });
            return res.status(401).send(info);
        }

        req.logIn(user, (err: any) => {
            if (err) {
                userLogger.error('Login error', { error: err });
                throw err;
            }

            // userLogger.info("Session created", { session: req.session });
            // req.session.isAuth = true;
            // res.status(200).send({ session: req.session, user: user });
            // next();
        });
    })(req, res, next);
};

/**
 * Route handler for user signup.
 * @param {Request} req - The request object containing user data.
 * @param {Response} res - The response object.
 */
export const createUser = async (req: Request, res: Response) => {
    try {
        const result = await createUserDB(req.body); // Call the createUser database function
        userLogger.info('User created successfully', { userId: result.id });
        res.status(201).json({ message: 'User created successfully', result });
    } catch (error) {
        userLogger.error('Error creating user', { error });
        res.status(500).json({ message: 'Error creating user', error });
    }
};

/**
 * Route handler for getting a user by ID.
 * @param {Request} req - The request object containing the user ID.
 * @param {Response} res - The response object.
 */
export const getUserById = async (req: Request, res: Response) => {
    try {
        const user = await getUserByIdDB(req.params.userId); // Call the getUserById database function
        if (user) {
            res.status(200).json(user);
        } else {
            userLogger.warn('User not found', { userId: req.params.userId });
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        userLogger.error('Error retrieving user', { error });
        res.status(500).json({ message: 'Error retrieving user', error });
    }
};

/**
 * Route handler for updating a user by ID.
 * @param {Request} req - The request object containing the user ID and update data.
 * @param {Response} res - The response object.
 */
export const updateUser = async (req: Request, res: Response) => {
    try {
        const result = await updateUserDB(req.params.userId, req.body); // Call the updateUser database function
        userLogger.info('User updated successfully', { userId: req.params.userId });
        res.status(200).json({ message: 'User updated successfully', result });
    } catch (error) {
        userLogger.error('Error updating user', { error });
        res.status(500).json({ message: 'Error updating user', error });
    }
};

/**
 * Route handler for deleting a user by ID.
 * @param {Request} req - The request object containing the user ID.
 * @param {Response} res - The response object.
 */
export const deleteUser = async (req: Request, res: Response) => {
    try {
        const result = await deleteUserDB(req.params.userId); // Call the deleteUser database function
        if (result.deletedCount > 0) {
            userLogger.info('User deleted successfully', { userId: req.params.userId });
            res.status(200).json({ message: 'User deleted successfully' });
        } else {
            userLogger.warn('User not found for deletion', { userId: req.params.userId });
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        userLogger.error('Error deleting user', { error });
        res.status(500).json({ message: 'Error deleting user', error });
    }
};

/**
 * Route handler for listing all users.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 */
export const listUsers = async (req: Request, res: Response) => {
    try {
        const users = await listUsersDB(); // Call the listUsers database function
        userLogger.info('List of users retrieved successfully', { userCount: users.length });
        res.status(200).json(users);
    } catch (error) {
        userLogger.error('Error listing users', { error });
        res.status(500).json({ message: 'Error listing users', error });
    }
};
