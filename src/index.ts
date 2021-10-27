import router from "./routes";
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors")
const log = require('loglevel');
log.setDefaultLevel("INFO")

const app = express();
require('dotenv').config()
app.use(bodyParser.json())
app.use(router)
app.use(cors({origin: false}))

app.listen(process.env.PORT, () => {
    log.info(`Server started on port ${process.env.PORT}` )
})
