import { createUser, getUserById, updateUser, deleteUser, listUsers } from "../index";

const express = require('express');
const user = express.Router();

//TODO: Make an authenticated route
// Route to create a new user (Signup)
user.post('/auth/signup', createUser);

// Route to get a user by ID
user.get('/:userId', getUserById);

// Route to update a user by ID
user.put('/:userId', updateUser);

// Route to delete a user by ID
user.delete('/:userId', deleteUser);

// Route to list all users
user.get('/', listUsers);

export default user;
