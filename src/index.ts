
require('module-alias/register')

import express = require('express')
import {KafkaConnector} from "@logic/kafkaConnector"
import {SocketConnector} from "@logic/socketConnector"

const app = express()
const port = process.env.PORT

app.get('/', (req, res)=>{
    res.send("crypto connector proxy to pass request from socket to kafka\n")
});

const server = app.listen(port, (err) => {
    if (err) {
        return console.error(err)
    }
    console.log(`Listening http://127.0.0.1:${port}`)
})


const kafka = require("debug")("kafka")
const socket = require("debug")("socket")

const sc = new SocketConnector(server)
sc.listen()

const kc = new KafkaConnector()
kc.listen(sc)