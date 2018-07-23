

import kafka = require('kafka-node')
const sha256 = require("sha256")
const debug = require("debug")("kafka")
import {KafkaMessage, KM_TYPE} from "@db/models/kafkaMessage"
import {default as config} from "@root/config.json"

interface iMessage{
    topic: string,
    value: string,
    offset: number,
    partition: number,
    key?: string,
    timestamp: Date,
}

export class KafkaConnector{
    client: kafka.Client;

    constructor(){
        this.client = new kafka.KafkaClient({kafkaHost: config.KAFKA_CONNECTION})
    }

    send(topic: string, message: Object, cb = null){
        const km = new KafkaMessage(Object.assign({}, message, {type: KM_TYPE.OUTPUT, processed: 1}))
        const producer = new kafka.Producer(this.client);
        const payloads = [
            { topic: topic, messages: [JSON.stringify(message)]},
        ]
        producer.send(payloads,  (err, data)=>{
            const messageId = data[topic][0]
            debug(`sent to kafka, topic: ${topic}, messageId: ${messageId}, initial message: `, message)
            km.save((err, data)=>{
            })
            if(cb){
                cb(messageId)
            }
        })
    }

    listen(socket){
        /**
         * for testing purpose you can clear message table
         * KafkaMessage.collection.drop()
         */
        KafkaMessage.find({type: KM_TYPE.INPUT}, (err, data)=>{
            const hashList = {}
            data.map(item=>{
                hashList[item.hash] = 1
            })
            listener(hashList)
        })

        const listener = (hashList)=>{
            const topicList = []
            const list = JSON.parse(config.KAFKA_TOPIC_LIST)
            Object.keys(list).map(key=>{
                topicList.push({
                    topic: list[key].listen,
                    partition: 0,
                })
            })

            const consumer = new kafka.Consumer(
                this.client,
                topicList,
                {
                    autoCommit: false,
                    fromOffset: true,
                }
            )
            consumer.on('message', (message: iMessage)=>{
                const hash = sha256(message.topic+message.value+message.offset)
                if(hashList[hash]){
                    return
                }
                debug(`------------new kafka message------------`, JSON.stringify(message))
                const km = new KafkaMessage(Object.assign({}, message, {type: KM_TYPE.INPUT, processed: 1, hash: hash}))
                km.save((err, data)=>{
                    if(err){
                        debug(`save KafkaMessage error: ${err}`)
                    }
                })
                try{
                    socket.send(message.value)
                }
                catch(e){
                    debug(`kafka input message error: ${e.message}`)
                }
            });
        }
    }
}