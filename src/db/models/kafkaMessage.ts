

import mongoose = require("mongoose")
import { IKafkaMessage } from "@db/interfaces/iKafkaMessage"
import {connection} from "@db/connection"


export interface IKafkaMessageModel extends IKafkaMessage, mongoose.Document {
    //custom methods for your model would be defined here
}

//type - тип сообщения, входящее - 0, изходящее - 1
const KafkaMessageSchema: mongoose.Schema = new mongoose.Schema({
    topic: String,
    value: String,
    offset: Number,
    partition: Number,
    highWaterOffset: Number,
    key: String,
    timestamp: Date,
    hash: String,
    type: Number,
    processed: { type: Number, default: 0},
});

export const KM_TYPE = {
    INPUT: 0,
    OUTPUT: 1,
}

export const KafkaMessage: mongoose.Model<IKafkaMessageModel> = connection.model<IKafkaMessageModel>("KafkaMessage", KafkaMessageSchema)