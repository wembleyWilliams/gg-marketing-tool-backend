import user from "./router/user";
import business from "./router/business";

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors")
const log = require('loglevel');
log.setDefaultLevel("INFO")

const app = express();
require('dotenv').config()
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use(cors());
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

app.use('/user', user)
app.use('/business', business)
app.get('/health' , (req: any, res: any)=>{
    res.status(200).json(req.body)
    log.info('Health Check')
})

app.listen(process.env.PORT, () => {
    log.info(`Server started on port ${process.env.PORT}` )
})
