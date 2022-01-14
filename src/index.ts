import user from "./router/user";
import business from "./router/business";

const passport = require("passport")
const express = require("express");
const session = require("express-session")
const bodyParser = require("body-parser");
const cors = require("cors")
const log = require('loglevel');
log.setDefaultLevel("INFO")

const app = express();

//Passport config
// passport.use('local',require("./config/passport"))
require("./config/passport")(passport)
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
    resave: true,
    // saveUninitalized: true
}))

//Passport Middleware
app.use(passport.initialize())
app.use(passport.session())

app.use('/user', user)
app.use('/business', business)
app.get('/health' , (req: any, res: any)=>{
    res.status(200).json('Health Check '+req.body)
    log.info('Health Check')
})

app.listen(process.env.PORT, () => {
    log.info(`Server started on port ${process.env.PORT}` )
})
