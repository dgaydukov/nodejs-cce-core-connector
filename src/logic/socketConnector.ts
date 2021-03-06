
const socketIo = require('socket.io')
const debug = require("debug")("socket")
const sha256 = require("sha256")
import {KafkaConnector} from "@logic/kafkaConnector"
import {SocketMessage, SM_TYPE} from "@db/models/socketMessage"
import {default as config} from "@root/config.json"


const userList = {}
const CHAT_NAME = "connector";

export class SocketConnector{
    io;

    constructor(server){
        this.io = socketIo(server)
    }

    send(msg: string, sm = null){
        const message = JSON.parse(msg)
        const appId = message.metadata.appId || process.env.DEFAULT_APP_ID
        if(!sm){
            sm = new SocketMessage({
                name: CHAT_NAME,
                value: JSON.stringify(message),
                appId: appId,
                type: SM_TYPE.OUTPUT,
            })
        }
        const user = this.io.sockets.connected[userList[appId]]
        if(user){
            debug(`sent msg to user`, message)
            user.emit(CHAT_NAME, message)
            sm.processed = 1
        }
        else{
            debug("user disconnected", message)
        }
        sm.save()
    }

    private async sendUnprocessedMessages(appId){
        const dbSmList = await SocketMessage.find({appId: appId, type: SM_TYPE.OUTPUT, processed: 0})
        for(const item of dbSmList){
            this.send(item.value, item)
        }
    }

    async listen(){
        const kc = new KafkaConnector()
        const dbSmList = await SocketMessage.find({type: SM_TYPE.INPUT})
        const hashList = {};
        dbSmList.map(item=>{
            hashList[item.hash] = 1
        })
        const topicList = JSON.parse(config.KAFKA_TOPIC_LIST)
        this.io.use((socket, next) => {
            const appId = socket.handshake.query.appId
            const socketId = socket.id
            if (appId) {
                userList[appId] = socketId
                this.sendUnprocessedMessages(appId)
                return next();
            }
            next(new Error('Authentication Failed'));
        });
        this.io.on('connection', (client)=>{
            const socketId = client.id
            debug(`user connected ${socketId}`)
            client.on('disconnect', ()=>{
                debug(`user disconnected ${socketId}`)
            })
            client.on(CHAT_NAME, message=>{
                try{
                    const hash = sha256(JSON.stringify(message))
                    if(hashList[hash]){
                        return
                    }
                    debug("--------------new socket message--------------", message)
                    const appId = message.metadata.appId
                    const sm = new SocketMessage({
                        name: CHAT_NAME,
                        value: JSON.stringify(message),
                        hash: hash,
                        appId: appId,
                        type: SM_TYPE.INPUT,
                        processed: 1,
                    })
                    sm.save()
                    userList[appId] = socketId
                    const topic = topicList[message.data.currency].send
                    kc.send(topic, message);
                }
                catch(ex){
                    debug(`Error SocketConnector.listen: ${ex}`)
                }
            })
        });
    }
}