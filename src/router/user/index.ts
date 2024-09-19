import { createUser, loginUser, getUserById, updateUser, deleteUser, listUsers } from "./routes";
const log = require('loglevel');
log.setDefaultLevel("INFO");
const express = require('express');
const user = express.Router();

// Route to create a new user (Signup)
user.post('/auth/signup', createUser);

// Route for user login
user.post('/auth/login', loginUser); // Assuming `loginUser` is defined elsewhere

// Route to get a user by ID
user.get('/:userId', getUserById);

// Route to update a user by ID
user.put('/:userId', updateUser);

// Route to delete a user by ID
user.delete('/:userId', deleteUser);

// Route to list all users
user.get('/', listUsers);

export default user;
