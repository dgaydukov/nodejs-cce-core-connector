
import mongoose = require("mongoose")
import {default as config} from "@root/config.json"

export const connection: mongoose.Connection = mongoose.createConnection(config.MONGODB_CONNECTION,{
    autoReconnect: true,
    useNewUrlParser: true,
})