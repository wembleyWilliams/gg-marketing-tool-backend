import { Request, Response } from 'express';
const passport = require("passport")
import { createUserDB, getUserByIdDB, updateUserDB, deleteUserDB, listUsersDB } from '../../../database'; // Import your database functions

//Logging
const log = require('loglevel');
log.setDefaultLevel("INFO")

export const  loginUser = (req: any, res: any, next: any) => {
  log.info('Logging in user')
  
  passport.authenticate('local',
    (err: any, user: any, info: any) => {
      if (err) {
        res.status(401).send(err);
      } else if (!user) {
        res.status(401).send(info);
      } else {
        
        req.logIn(user, (err: any) =>{
          if(err) throw err;
          log.info("Session created")
          log.info(req.session)
          req.session.isAuth = true;
          res.status(200).send({session: req.session, user: user})
        })
        
        next();
      }
    })(req, res, next)
  
}

// Route handler for user signup
export const createUser = async (req: Request, res: Response) => {
    try {
        const result = await createUserDB(req.body); // Call the createUser database function
        res.status(201).json({ message: 'User created successfully', result });
    } catch (error) {
        res.status(500).json({ message: 'Error creating user', error });
    }
};

// Route handler for user login
// export const loginUser = async (req: Request, res: Response) => {
//     try {
//         const user = await loginUserDb(req.body); // Call the loginUser database function
//         if (user) {
//             res.status(200).json({ message: 'Login successful', user });
//         } else {
//             res.status(401).json({ message: 'Invalid credentials' });
//         }
//     } catch (error) {
//         res.status(500).json({ message: 'Error logging in', error });
//     }
// };

// Route handler for getting a user by ID
export const getUserById = async (req: Request, res: Response) => {
    try {
        const user = await getUserByIdDB(req.params.userId); // Call the getUserById database function
        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving user', error });
    }
};

// Route handler for updating a user by ID
export const updateUser = async (req: Request, res: Response) => {
    try {
        const result = await updateUserDB(req.params.userId, req.body); // Call the updateUser database function
        res.status(200).json({ message: 'User updated successfully', result });
    } catch (error) {
        res.status(500).json({ message: 'Error updating user', error });
    }
};

// Route handler for deleting a user by ID
export const deleteUser = async (req: Request, res: Response) => {
    try {
        const result = await deleteUserDB(req.params.userId); // Call the deleteUser database function
        if (result.deletedCount > 0) {
            res.status(200).json({ message: 'User deleted successfully' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error });
    }
};

// Route handler for listing all users
export const listUsers = async (req: Request, res: Response) => {
    try {
        const users = await listUsersDB(); // Call the listUsers database function
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error listing users', error });
    }
};
