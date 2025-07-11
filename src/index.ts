/**
 * @file Main application entry point. Configures Express server, middleware, routes,
 * authentication, and GraphQL API. Also handles health checks and server startup.
 * @module index
 */

import user from "./router/user/routes";
import business from "./router/business/routes";
import card from "./router/card/routes";
import metric from "./router/cardMetric/routes";
import utility from "./router/utilities/routes";
import auth from "./router/auth/routes";

import passportService from './config/passport';
import requestLogger from "./logger/requestLogger";
import logger from "./logger/logger";
import {healthDB} from "./database";
import {graphqlHTTP} from "express-graphql";

import schema from "./schemas/index";
// import resolvers from "./resolvers/index";
import * as db from "./database/index";
import flash from 'connect-flash';

const passport = require("passport");
const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");

/**
 * Logger instance specifically for main application context
 * @type {object}
 */
const mainLogger = logger.child({context: 'main'});

/**
 * Root resolver for GraphQL
 * @type {object}
 */
// const root = resolvers;

/**
 * Express application instance
 * @type {express.Application}
 */
const app = express();

// Passport configuration
passportService(passport);
require('dotenv').config();

// Middleware configuration
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json({limit: '1mb'}));
app.use(cors());

/**
 * Middleware for handling CORS preflight requests and setting default headers
 * @param {express.Request} req - Express request object
 * @param {express.Response} res - Express response object
 * @param {express.NextFunction} next - Express next middleware function
 */
app.use((req: any, res: any, next: any) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin',
        'X-Requested-With', 'Content-Type', 'Accept',
        'Authorization'
    );

    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT,POST,PATCH,GET,DELETE');
        return res.status(200).json({});
    }
    next();
});

/**
 * Session configuration middleware
 * @type {express.RequestHandler}
 */
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: false,
    cookie: {
        httpOnly: true,
        maxAge: 3600000
    }
}));

app.use(cookieParser('secret'));
app.use(requestLogger); // Request logging middleware
app.use(passport.initialize()); // Passport authentication middleware
app.use(passport.session()); // Persistent login sessions

/**
 * GraphQL API endpoint configuration
 * @type {express.RequestHandler}
 */
app.use('/graphql',
    graphqlHTTP({
        schema: schema,
        // rootValue: root,
        graphiql: true,
        customFormatErrorFn: (err) => {
            console.error('GraphQL Error:', err);
            return err;
        },
    }));

// Route handlers
app.use('/user', user); // User-related routes
app.use('/business', business); // Business-related routes
app.use('/util', utility); // Utility routes
app.use('/card', card); // Card-related routes
app.use('/metric', metric); // Metric-related routes
app.use('/auth', auth); // Authentication routes

/**
 * Health check endpoint
 * @name GET /health
 * @function
 * @async
 * @param {express.Request} req - Express request object
 * @param {express.Response} res - Express response object
 * @returns {Promise<void>} Sends health status response
 */
app.get('/health', async (req: any, res: any) => {
    try {
        const healthReport: { dbConnection: string; status: string; uptime: number; timestamp: Date } = await healthDB();
        mainLogger.info(`Health check performed: ${JSON.stringify(healthReport)}`);

        if (healthReport.status === 'healthy') {
            res.status(200).json(`Health check performed: ${JSON.stringify(healthReport)}`);
        } else {
            res.status(503).json(healthReport);
        }
    } catch (error) {
        logger.error('Error during health check', error);
        res.status(500).json({ status: 'error', message: 'Health check failed' });
    }
});

/**
 * Server host configuration
 * @constant {string}
 */
const HOST = '0.0.0.0';

/**
 * Starts the Express server
 * @listens {number} process.env.PORT - Port from environment variables
 * @listens {string} HOST - Host address
 */
app.listen(process.env.PORT, HOST, () => {
    mainLogger.info(`Server started on HOST:${HOST} and PORT:${process.env.PORT}`);
});