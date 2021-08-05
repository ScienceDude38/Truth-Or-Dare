import ipc from 'node-ipc'
ipc.config.retry = 15000
ipc.config.silent = true

import type { ChannelSettings, statistics } from './bot'
import { dareQuestions } from './Commands/dareCommand'
import { nhieQuestions } from './Commands/nhieCommand'
import { paranoiaQuestions } from './Commands/paranoiaCommand'
import { ParanoiaData } from './Commands/paranoiaData'
import { truthQuestions } from './Commands/truthCommand'
import { wyrQuestions } from './Commands/wyrCommand'

interface MongoHandler {
    handler: any
}

type questions = truthQuestions | paranoiaQuestions | nhieQuestions | dareQuestions | wyrQuestions

class MongoHandler {
    async init(shardID: number) {
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

    

    async getChannelSettings(id: string): Promise<ChannelSettings | undefined> {
        let operationID = Date.now().toString() + Math.random().toString(10).substr(2, 9)
    
        this.handler.emit('message', {
            operation: "getChannelSettings",
            args: [id],
            operationID
        })

        return await new Promise((res, rej) => {
            this.handler.once(operationID, (data: ChannelSettings | undefined) => {
                res(data)
            })
        })
    }

    async setChannelSettings(id: string, value: ChannelSettings) {
        let operationID = Date.now().toString() + Math.random().toString(10).substr(2, 9)
    
        this.handler.emit('message', {
            operation: "setChannelSettings",
            args: [id, value],
            operationID
        })

        return await new Promise((res, rej) => {
            this.handler.once(operationID, (data: any) => {
                res(data)
            })
        })
    }

    async deleteChannelSettings(id: string) {
        let operationID = Date.now().toString() + Math.random().toString(10).substr(2, 9)
    
        this.handler.emit('message', {
            operation: "deleteChannelSettings",
            args: [id],
            operationID
        })

        return await new Promise((res, rej) => {
            this.handler.once(operationID, (data: any) => {
                res(data)
            })
        })
    }

    async getServerChannels(id: string): Promise<string[]> {
        let operationID = Date.now().toString() + Math.random().toString(10).substr(2, 9)
    
        this.handler.emit('message', {
            operation: "getServerChannels",
            args: [id],
            operationID
        })

        return await new Promise((res, rej) => {
            this.handler.once(operationID, (data: string[]) => {
                res(data)
            })
        })
    }

    async setServerChannels(id: string, value: string[]) {
        let operationID = Date.now().toString() + Math.random().toString(10).substr(2, 9)
    
        this.handler.emit('message', {
            operation: "setServerChannels",
            args: [id, value],
            operationID
        })

        return await new Promise((res, rej) => {
            this.handler.once(operationID, (data: any) => {
                res(data)
            })
        })
    }

    async deleteServerChannels(id: string) {
        let operationID = Date.now().toString() + Math.random().toString(10).substr(2, 9)
    
        this.handler.emit('message', {
            operation: "deleteServerChannels",
            args: [id],
            operationID
        })

        return await new Promise((res, rej) => {
            this.handler.once(operationID, (data: any) => {
                res(data)
            })
        })
    }

    async getPrefix(id: string): Promise<string> {
        let operationID = Date.now().toString() + Math.random().toString(10).substr(2, 9)
    
        this.handler.emit('message', {
            operation: "getPrefix",
            args: [id],
            operationID
        })

        return await new Promise((res, rej) => {
            this.handler.once(operationID, (data: string) => {
                res(data)
            })
        })
    }

    async setPrefix(id: string, value: string) {
        let operationID = Date.now().toString() + Math.random().toString(10).substr(2, 9)
    
        this.handler.emit('message', {
            operation: "setPrefix",
            args: [id, value],
            operationID
        })

        return await new Promise((res, rej) => {
            this.handler.once(operationID, (data: any) => {
                res(data)
            })
        })
    }

    async deletePrefix(id: string) {
        let operationID = Date.now().toString() + Math.random().toString(10).substr(2, 9)
    
        this.handler.emit('message', {
            operation: "deletePrefix",
            args: [id],
            operationID
        })

        return await new Promise((res, rej) => {
            this.handler.once(operationID, (data: any) => {
                res(data)
            })
        })
    }

    async getParanoiaData(id: string): Promise<ParanoiaData> {
        let operationID = Date.now().toString() + Math.random().toString(10).substr(2, 9)
    
        this.handler.emit('message', {
            operation: "getParanoiaData",
            args: [id],
            operationID
        })

        return await new Promise((res, rej) => {
            this.handler.once(operationID, (data: ParanoiaData) => {
                res(data)
            })
        })
    }

    async setParanoiaData(id: string, value: ParanoiaData) {
        let operationID = Date.now().toString() + Math.random().toString(10).substr(2, 9)
    
        this.handler.emit('message', {
            operation: "setParanoiaData",
            args: [id, value],
            operationID
        })

        return await new Promise((res, rej) => {
            this.handler.once(operationID, (data: any) => {
                res(data)
            })
        })
    }

    async deleteParanoiaData(id: string) {
        let operationID = Date.now().toString() + Math.random().toString(10).substr(2, 9)
    
        this.handler.emit('message', {
            operation: "deleteParanoiaData",
            args: [id],
            operationID
        })

        return await new Promise((res, rej) => {
            this.handler.once(operationID, (data: any) => {
                res(data)
            })
        })
    }

    async getServerCount(): Promise<number> {
        let operationID = Date.now().toString() + Math.random().toString(10).substr(2, 9)
    
        this.handler.emit('message', {
            operation: "getServerCount",
            args: [],
            operationID
        })

        return await new Promise((res, rej) => {
            this.handler.once(operationID, (data: number) => {
                res(data)
            })
        })
    }

    async setServerCount(manager: number, count: number) {
        let operationID = Date.now().toString() + Math.random().toString(10).substr(2, 9)
    
        this.handler.emit('message', {
            operation: "setServerCount",
            args: [manager, count],
            operationID
        })

        return await new Promise((res, rej) => {
            this.handler.once(operationID, (data: any) => {
                res(data)
            })
        })
    }

    async getStatistics(): Promise<statistics> {
        let operationID = Date.now().toString() + Math.random().toString(10).substr(2, 9)
    
        this.handler.emit('message', {
            operation: "getStatistics",
            args: [],
            operationID
        })

        return await new Promise((res, rej) => {
            this.handler.once(operationID, (data: statistics) => {
                res(data)
            })
        })
    }

    async setStatistics(shardID: number, statistics: statistics) {
        let operationID = Date.now().toString() + Math.random().toString(10).substr(2, 9)
    
        this.handler.emit('message', {
            operation: "setStatistics",
            args: [shardID, statistics],
            operationID
        })

        return await new Promise((res, rej) => {
            this.handler.once(operationID, (data: any) => {
                res(data)
            })
        })
    }

    async getQuestions(name: string): Promise<questions> {
        let operationID = Date.now().toString() + Math.random().toString(10).substr(2, 9)
    
        this.handler.emit('message', {
            operation: "getQuestions",
            args: [name],
            operationID
        })

        return await new Promise((res, rej) => {
            this.handler.once(operationID, (data: questions) => {
                res(data)
            })
        })
    }
}

export {MongoHandler}