import router from "./routes";
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors")
const log = require('loglevel');
log.setDefaultLevel("INFO")

const app = express();
require('dotenv').config()
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use(router)
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

app.listen(process.env.PORT, () => {
    log.info(`Server started on port ${process.env.PORT}` )
})
