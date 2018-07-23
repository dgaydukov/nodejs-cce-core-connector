/**
 * Test socket connection
 */
const debug = require("debug")("client")
const CHAT_NAME = "connector"
const SERVER_PORT = 3335
const APP_ID = "7132d44d-e8a6-443e-8ddd-a8285fd01112"
const GUID = "12771913-e2a4-4f9f-8357-2b8aa6304fc0"
const TIMESTAMP = + new Date()
const socket = require('socket.io-client')(`http://127.0.0.1:${SERVER_PORT}?appId=${APP_ID}`)

const btc_new_address = {
    "data": {
        "currency": "btc",
    },
    "metadata": {
        "guid": GUID,
        "appId": APP_ID,
        "methodName": "getAddress",
        "timestamp": TIMESTAMP,
        "context": ""
    }
}
const eth_new_address = {
    "data": {
        "currency": "eth",
    },
    "metadata": {
        "guid": GUID,
        "appId": APP_ID,
        "methodName": "getAddress",
        "timestamp": TIMESTAMP,
        "context": ""
    }
}
const btc_address_info = {
    "data": {
        "currency": "btc",
        "address": "2N3AAagLvicDekStqY5mWAqQdrWsBvrAxNY",
    },
    "metadata": {
        "guid": GUID,
        "appId": APP_ID,
        "methodName": "getAddressInfo",
        "timestamp": TIMESTAMP,
        "context": ""
    }
}
const eth_address_info = {
    "data": {
        "currency": "eth",
        "address": "0x40db6ac6887c3b95008d826bc046ed15d09d8299",
    },
    "metadata": {
        "guid": GUID,
        "appId": APP_ID,
        "methodName": "getAddressInfo",
        "timestamp": TIMESTAMP,
        "context": ""
    }
}
const btc_tx_info = {
    "data": {
        "currency": "btc",
        "txId": "a0bc07af2a8c0f934d1baaf06d77adfca08a67facd218f95c85b0d7916f8c829",
    },
    "metadata": {
        "guid": GUID,
        "appId": APP_ID,
        "methodName": "getTransactionInfo",
        "timestamp": TIMESTAMP,
        "context": ""
    }
}
const eth_tx_info = {
    "data": {
        "currency": "eth",
        "txId": "c7d45dacf74113e099d4a6d8272f72c6d829c1fe873fe9757f737c448039dec7",
    },
    "metadata": {
        "guid": GUID,
        "appId": APP_ID,
        "methodName": "getTransactionInfo",
        "timestamp": TIMESTAMP,
        "context": ""
    }
}
const btc_transaction = {
    "data": {
        "currency": "btc",
        "to": "2N1BcnHjh8hHDMLNtC6MjZKttS1gXy7eVgm",
        "amount": "0.01"
    },
    "metadata": {
        "guid": GUID,
        "appId": APP_ID,
        "methodName": "sendTransaction",
        "timestamp": TIMESTAMP,
        "context": ""
    }
}
const eth_transaction = {
    "data": {
        "currency": "eth",
        "from": "0x40db6ac6887c3b95008d826bc046ed15d09d8299",
        "to": "0x94f4fd6219851cce017874009b9f80ad8df4a7fd",
        "amount": "0.01"
    },
    "metadata": {
        "guid": GUID,
        "appId": APP_ID,
        "methodName": "sendTransaction",
        "timestamp": TIMESTAMP,
        "context": ""
    }
}


socket.on('connect', () => {
    socket.on(CHAT_NAME, (data) => {
        debug(+new Date(), data)
    });

    setTimeout(()=>{
        socket.emit(CHAT_NAME, btc_address_info)
    }, 1*1000)
});