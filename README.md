# Node.js CCE (Crypto Currency Exchange) Core Connector

## Content
* [Project Description](#project-description)
* [Project Structure](#project-structure)
* [Built With](#built-with)
* [Installation](#installation)
* [Auto Testing](#auto-testing)
* [Socket](#socket)
* [Kafka](#kafka)
* [Module loading](#module-loading)
* [Authors](#authors)

### Project Description
Core Connector is a proxy server that communicates request from socket.io to kafka. Since all internal services of CCE communicate through the 
kafka we need a more regular way (like socket or REST) to communicate with outside world. So we need a proxy that listen for socket connections
and proxy all in and out request to kafka.

### Project Structure
```
dist - javascript folder with compiled typescript from src folder
src - source code folder (typescript)
-logic - project bisyness logic
-db - database folder (interfaces & models)
```

### Built With
* [Kafka](https://kafka.apache.org/quickstart) - how to install & run kafka
* [Kafka-node](https://www.npmjs.com/package/kafka-node) - node.js module for kafka
* [MongoDB](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu) - how to install & run mongo
* [Mongoose](https://www.npmjs.com/package/mongoose) - node.js module for mongoDb
* [Socket.IO](https://www.npmjs.com/package/socket.io) - node.js socket library


### Installation 
```shell
#run mongod
sudo service mongod start

#run zookeepr & kafka
sudo service zookeeper start
cd kafka && bin/kafka-server-start.sh config/server.properties

#create kafka topics
bin/kafka-topics.sh --create --zookeeper localhost:2181 --replication-factor 1 --partitions 1 --topic bitcoinProxyRequest
bin/kafka-topics.sh --create --zookeeper localhost:2181 --replication-factor 1 --partitions 1 --topic bitcoinProxyResponse
bin/kafka-topics.sh --create --zookeeper localhost:2181 --replication-factor 1 --partitions 1 --topic ethereumProxyRequest
bin/kafka-topics.sh --create --zookeeper localhost:2181 --replication-factor 1 --partitions 1 --topic ethereumProxyResponse

#clone & run project
git clone https://github.com/dgaydukov/nodejs-cce-core-connector.git
cd nodejs-cce-core-connector
npm i
npm start
# $pid - process id in pm2
npm start $pid --timestamp
```





### Auto Testing

You can run auto tests with `npm test`
For testing purpose we use the following arhitecture
testing framework + assertion module + test doubles + code coverage
* [Mocha](https://mochajs.org) - testing framework
* [Chai](http://www.chaijs.com) - assertion module
* [Sinon](http://sinonjs.org) - test doubles
* [Istanbul](https://github.com/gotwarlost/istanbul) - JS code coverage tool



### Socket

For socket testing there is a file src/testClient.ts. You can run it with `npm run client`

```shell
# Kafka response from bitcoin proxy
bin/kafka-console-producer.sh --broker-list localhost:9092 --topic bitcoinProxyResponse
{"data":{"address":"2N3AAagLvicDekStqY5mWAqQdrWsBvrAxNY"},"metadata":{"appId":"7132d44d-e8a6-443e-8ddd-a8285fd01112","methodName":"getAddress"}}
```

Inside socket message we should pass appId - constant id of application. We need this for, when the response from kafka server comes, we 
need to know to which app send the response. Also this params should be sent inside connection string. So if we have not sent messages,
on reconnect we will send all of them.




### Kafka

Kafka message request for creating new bitcoin address
```json
{
    "data": {
        "currency": "btc"
    },
    "metadata": {
        "guid": "12771913-e2a4-4f9f-8357-2b8aa6304fc0",
        "appId": "7132d44d-e8a6-443e-8ddd-a8285fd01112",
        "methodName": "getAddress",
        "timestamp": "1531145684401"
    }
}
```

Kafka message request for creating new bitcoin transaction
```json
{
    "data": {
        "currency": "btc",
        "to": "2NFpchMYyRTrY6eCr9YuiYQ62g6CdUjWfbk",
        "amount": "0.01"
    },
    "metadata": {
        "guid": "7890196a-58a6-4996-b0e2-bd606f9e1d75",
        "appId": "7132d44d-e8a6-443e-8ddd-a8285fd01112",
        "methodName": "sendTransaction",
        "timestamp": "1531145686616"
    }
}
```




## Module loading

For modules loading inside the project we use [module-alias](https://www.npmjs.com/package/module-alias). For this we write in package.json
```json
  "_moduleAliases": {
    "@root": "dist",
    "@db": "dist/db",
    "@logic": "dist/logic"
  }
```
But this only for compiled javascript to work. In order to use this functionality in typescript and compile successfully, we use standartd
typescript functions. For this purpose we write in typescript config ts.config.json the following
```json
{
    "baseUrl": ".",
    "paths": {
      "@root/*": ["src/*"],
      "@db/*": ["src/db/*"],
      "@logic/*": ["src/logic/*"]
      }
}
```


## Authors

* **Gaydukov Dmitiry** - *Take a look* - [How to become a Senior Javascript Developer](https://github.com/dgaydukov/how-to-become-a-senior-js-developer)
























