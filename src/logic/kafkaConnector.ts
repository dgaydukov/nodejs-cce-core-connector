

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
    socket;

    constructor(socket = null){
        this.client = new kafka.KafkaClient({kafkaHost: config.KAFKA_CONNECTION})
        this.socket = socket
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
            km.save()
                .then(data=>{
                    if(cb){
                        cb(messageId)
                    }
                })
        })
    }

    listen(){
        /**
         * for testing purpose you can clear message table
         * KafkaMessage.collection.drop()
         */
        KafkaMessage.find({type: KM_TYPE.INPUT})
            .then(data=>{
                const hashList = {}
                data.map(item=>{
                    hashList[item.hash] = 1
                })
                return hashList
            })
            .then(hashList=>{
                const topicList = []
                const configTopicList = JSON.parse(config.KAFKA_TOPIC_LIST)
                Object.keys(configTopicList).map(key=>{
                    topicList.push({
                        topic: configTopicList[key].listen,
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
                    km.save()
                    try{
                        this.socket.send(message.value)
                    }
                    catch(e){
                        debug(`kafka input message error: ${e.message}`)
                    }
                });
            })
            .catch(ex=>{
                debug(`Error on KafkaConnector.listen: ${ex}`)
            })
    }
}