

import mongoose = require("mongoose")
import { ISocketMessage } from "@db/interfaces/iSocketMessage"
import {connection} from "@db/connection"


export interface ISocketMessageModel extends ISocketMessage, mongoose.Document {
    //custom methods for your model would be defined here
}

//type - тип сообщения, входящее - 0, изходящее - 1
const SocketMessageSchema: mongoose.Schema = new mongoose.Schema({
    name: String,
    value: String,
    appId: String,
    type: Number,
    hash: String,
    processed: { type: Number, default: 0},
    createdAt: Date,
});

export const SM_TYPE = {
    INPUT: 0,
    OUTPUT: 1,
}

export const SocketMessage: mongoose.Model<ISocketMessageModel> = connection.model<ISocketMessageModel>("SocketMessage", SocketMessageSchema)