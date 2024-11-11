import user from "./router/user";
import business from "./router/business/routes";
import passportService from './config/passport'
import utility from "./router/utilities";
import requestLogger from "./logger/requestLogger";
import logger from "./logger/logger";
import {healthDB} from "./database";
import card from "./router/card";


const passport = require("passport")
const express = require("express");
const session = require("express-session")
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors")

const mainLogger = logger.child({context:'main'})

const app = express();

//Passport config
passportService(passport)
require('dotenv').config()
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json({limit:'1mb'}))
app.use(cors());

//Preflight check rules and default headers
app.use((req: any, res: any, next: any) => {
    res.header('Access-Control-Allow-Origin','*')
    res.header('Access-Control-Allow-Headers','Origin',
        'X-Requested-With', 'Content-Type','Accept',
        'Authorization'
    )
    
    if(req.method==='OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT,POST,PATCH,GET,DELETE')
        return res.status(200).json({})
    }
    next();
})

app.use(session({
    secret:'secret',
    saveUninitialized: true,
    resave: false,
    cookie: {
        httpOnly: true,
        maxAge: 3600000
    }
}))

app.use(cookieParser('secret'))

//Logs all requests
app.use(requestLogger)

//Passport Middleware
app.use(passport.initialize())
app.use(passport.session())

app.use('/user', user)
app.use('/business', business)
app.use('/util', utility)
app.use('/card', card)

app.get('/health' , async (req: any, res: any)=> {
    try {

        const healthReport: { dbConnection: string; status: string; uptime: number; timestamp: Date } = await healthDB();
        mainLogger.info(`Health check performed: ${JSON.stringify(healthReport)}`);

        if (healthReport.status === 'healthy') {
            res.status(200).json(healthReport);
        } else {
            res.status(503).json(healthReport);
        }
    } catch (error) {
        logger.error('Error during health check', error);
        res.status(500).json({ status: 'error', message: 'Health check failed' });
    }
})

const HOST = '0.0.0.0';
app.listen(process.env.PORT, HOST,() => {
    mainLogger.info(`Server started on HOST:${HOST} and PORT:${process.env.PORT}` )
})
