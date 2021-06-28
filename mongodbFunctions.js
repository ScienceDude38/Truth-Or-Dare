import { createRequire } from "module";
const require = createRequire(import.meta.url);

var ipc = require('node-ipc')
ipc.config.retry = 15000
ipc.config.silent = true

class MongoHandler {
    async init(shardID) {
        this.handler = await new Promise((res) => {
            ipc.config.id = "shard_" + shardID
            ipc.connectTo("handler", () => {
                var handler = ipc.of.handler
                handler.on('connect', () => {
                    ipc.log('Connected to handler')

                    res(handler)
                })
            })
        })
    }

    

    async getChannelSettings(id) {
        let operationID = Date.now().toString() + Math.random().toString(10).substr(2, 9)
    
        this.handler.emit('message', {
            operation: "getChannelSettings",
            args: [id],
            operationID
        })

        return await new Promise((res, rej) => {
            this.handler.once(operationID, (data) => {
                res(data)
            })
        })
    }

    async setChannelSettings(id, value) {
        let operationID = Date.now().toString() + Math.random().toString(10).substr(2, 9)
    
        this.handler.emit('message', {
            operation: "setChannelSettings",
            args: [id, value],
            operationID
        })

        return await new Promise((res, rej) => {
            this.handler.once(operationID, (data) => {
                res(data)
            })
        })
    }

    async deleteChannelSettings(id) {
        let operationID = Date.now().toString() + Math.random().toString(10).substr(2, 9)
    
        this.handler.emit('message', {
            operation: "deleteChannelSettings",
            args: [id],
            operationID
        })

        return await new Promise((res, rej) => {
            this.handler.once(operationID, (data) => {
                res(data)
            })
        })
    }

    async getServerChannels(id) {
        let operationID = Date.now().toString() + Math.random().toString(10).substr(2, 9)
    
        this.handler.emit('message', {
            operation: "getServerChannels",
            args: [id],
            operationID
        })

        return await new Promise((res, rej) => {
            this.handler.once(operationID, (data) => {
                res(data)
            })
        })
    }

    async setServerChannels(id, value) {
        let operationID = Date.now().toString() + Math.random().toString(10).substr(2, 9)
    
        this.handler.emit('message', {
            operation: "setServerChannels",
            args: [id, value],
            operationID
        })

        return await new Promise((res, rej) => {
            this.handler.once(operationID, (data) => {
                res(data)
            })
        })
    }

    async deleteServerChannels(id) {
        let operationID = Date.now().toString() + Math.random().toString(10).substr(2, 9)
    
        this.handler.emit('message', {
            operation: "deleteServerChannels",
            args: [id],
            operationID
        })

        return await new Promise((res, rej) => {
            this.handler.once(operationID, (data) => {
                res(data)
            })
        })
    }

    async getPrefix(id) {
        let operationID = Date.now().toString() + Math.random().toString(10).substr(2, 9)
    
        this.handler.emit('message', {
            operation: "getPrefix",
            args: [id],
            operationID
        })

        return await new Promise((res, rej) => {
            this.handler.once(operationID, (data) => {
                res(data)
            })
        })
    }

    async setPrefix(id, value) {
        let operationID = Date.now().toString() + Math.random().toString(10).substr(2, 9)
    
        this.handler.emit('message', {
            operation: "setPrefix",
            args: [id, value],
            operationID
        })

        return await new Promise((res, rej) => {
            this.handler.once(operationID, (data) => {
                res(data)
            })
        })
    }

    async deletePrefix(id) {
        let operationID = Date.now().toString() + Math.random().toString(10).substr(2, 9)
    
        this.handler.emit('message', {
            operation: "deletePrefix",
            args: [id],
            operationID
        })

        return await new Promise((res, rej) => {
            this.handler.once(operationID, (data) => {
                res(data)
            })
        })
    }

    async getParanoiaData(id) {
        let operationID = Date.now().toString() + Math.random().toString(10).substr(2, 9)
    
        this.handler.emit('message', {
            operation: "getParanoiaData",
            args: [id],
            operationID
        })

        return await new Promise((res, rej) => {
            this.handler.once(operationID, (data) => {
                res(data)
            })
        })
    }

    async setParanoiaData(id, value) {
        let operationID = Date.now().toString() + Math.random().toString(10).substr(2, 9)
    
        this.handler.emit('message', {
            operation: "setParanoiaData",
            args: [id, value],
            operationID
        })

        return await new Promise((res, rej) => {
            this.handler.once(operationID, (data) => {
                res(data)
            })
        })
    }

    async deleteParanoiaData(id) {
        let operationID = Date.now().toString() + Math.random().toString(10).substr(2, 9)
    
        this.handler.emit('message', {
            operation: "deleteParanoiaData",
            args: [id],
            operationID
        })

        return await new Promise((res, rej) => {
            this.handler.once(operationID, (data) => {
                res(data)
            })
        })
    }

    async getServerCount() {
        let operationID = Date.now().toString() + Math.random().toString(10).substr(2, 9)
    
        this.handler.emit('message', {
            operation: "getServerCount",
            args: [],
            operationID
        })

        return await new Promise((res, rej) => {
            this.handler.once(operationID, (data) => {
                res(data)
            })
        })
    }

    async setServerCount(manager, count) {
        let operationID = Date.now().toString() + Math.random().toString(10).substr(2, 9)
    
        this.handler.emit('message', {
            operation: "setServerCount",
            args: [manager, count],
            operationID
        })

        return await new Promise((res, rej) => {
            this.handler.once(operationID, (data) => {
                res(data)
            })
        })
    }

    async getStatistics() {
        let operationID = Date.now().toString() + Math.random().toString(10).substr(2, 9)
    
        this.handler.emit('message', {
            operation: "getStatistics",
            args: [],
            operationID
        })

        return await new Promise((res, rej) => {
            this.handler.once(operationID, (data) => {
                res(data)
            })
        })
    }

    async setStatistics(shardID, statistics) {
        let operationID = Date.now().toString() + Math.random().toString(10).substr(2, 9)
    
        this.handler.emit('message', {
            operation: "setStatistics",
            args: [shardID, statistics],
            operationID
        })

        return await new Promise((res, rej) => {
            this.handler.once(operationID, (data) => {
                res(data)
            })
        })
    }
}

export {MongoHandler}