import user from "./router/user";
import business from "./router/business";
import passportService from './config/passport'
const passport = require("passport")
const express = require("express");
const session = require("express-session")
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors")

const log = require('loglevel');
log.setDefaultLevel("INFO")

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

//Debugging Middleware
// app.use((req: any, res: any, next: any) => {
//     console.log(req.session);
//     next();
// })

//Passport Middleware
app.use(passport.initialize())
app.use(passport.session())

app.use('/user', user)
app.use('/business', business)
app.get('/health' , (req: any, res: any)=> {
    res.status(200).json('Health Check '+req.body)
    log.info('Health Check')
})

const HOST = '0.0.0.0';
app.listen(process.env.PORT, HOST,() => {
    log.info(`Server started on port ${process.env.PORT}` )
})
