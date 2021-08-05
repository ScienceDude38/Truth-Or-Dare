import dotenv from 'dotenv'
dotenv.config()

import heapdump from 'heapdump'

import ipc from 'node-ipc'
ipc.config.id = "handler"
ipc.config.retry = 15000
ipc.config.silent = true

ipc.serve(
    () => {
        ipc.server.on('message', async (data, socket) => {
            let {operation, args, operationID} = data

            if (operation in functions) {
                let result = await functions[operation](...args)
                ipc.server.emit(socket, operationID, result)
            }
        })
    }
)

import { default as mongodb, Collection } from "mongodb";
import { ChannelSettings, statistics } from './bot'
const MongoClient = mongodb.MongoClient

var collections: Record<string, Collection> = {}

async function initiateMongo(): Promise<boolean> {
    let mongoClient = new MongoClient(process.env.MONGOIP!, { "useUnifiedTopology": true, "poolSize": 45, "maxPoolSize": 120 });
    try {
        mongoClient.connect();
        let db = mongoClient.db("todBeta");
        ["prefixes", "channelSettings", "serverChannels", "paranoiaData", "statistics", "serverCounts", "questions"].forEach(coll => {
            collections[coll] = db.collection(coll)
        })
        return true;
    }
    catch {
        await new Promise((resolve, reject) => {
            setTimeout(resolve, 1000);
        });
        return initiateMongo();
    }
}

initiateMongo().then(() => {
    ipc.server.start()
})

const functions: Record<string, Function> = {
    getChannelSettings: async (id: string) => {
        let collection = collections.channelSettings
        let result = await collection.findOne({ "channelID": id })
        let returnData = result?.data
        return returnData
    },
    setChannelSettings: async (id: string, value: ChannelSettings) => {
        let collection = collections.channelSettings
        return collection.findOneAndReplace({ "channelID": id }, { "channelID": id, "data": value }, { "upsert": true });
    },
    deleteChannelSettings: async (id: string) => {
        let collection = collections.channelSettings
        return collection.deleteOne({ "channelID": id });
    },
    getServerChannels: async (id: string) => {
        let collection = collections.serverChannels
        let result = await collection.findOne({ "serverID": id })
        let returnData = result?.channels
        return returnData
    },
    setServerChannels: async (id: string, value: string[]) => {
        let collection = collections.serverChannels
        return collection.findOneAndReplace({ "serverID": id }, { "serverID": id, "channels": value }, { upsert: true })
    },
    deleteServerChannels: async (id: string) => {
        let collection = collections.serverChannels
        return collection.deleteOne({ "serverID": id })
    },
    getPrefix: async (id: string) => {
        if (id in prefixes) {
            return prefixes[id]
        } else {
            let collection = collections.prefixes
            let result = await collection.findOne({ "serverID": id });
            prefixes[id] = result?.data || '+'
            return result?.data || '+'
        }
    },
    setPrefix: async (id: string, value: string) => {
        prefixes[id] = value
        let collection = collections.prefixes
        return collection.findOneAndReplace({ "serverID": id }, { "serverID": id, "data": value }, { "upsert": true });
    },
    deletePrefix: async (id: string) => {
        delete prefixes[id]
        let collection = collections.prefixes
        return collection.deleteOne({ "serverID": id });
    },
    getParanoiaData: async (id: string) => {
        let collection = collections.paranoiaData
        let result = await collection.findOne({ "userID": id });
        let returnData = result?.data;
        return returnData;
    },
    setParanoiaData: async (id: string, value) => {
        let collection = collections.paranoiaData
        return collection.findOneAndReplace({ "userID": id }, { "userID": id, "data": value }, { "upsert": true })
    },
    deleteParanoiaData: async (id: string) => {
        let collection = collections.paranoiaData
        return collection.deleteOne({ "userID": id });
    },
    getServerCount: async () => {
        let collection = collections.serverCounts
        let count = 0
        let found = await collection.find({})
        await found.forEach(item => {
            count += item.count
        })
        return count
    },
    setServerCount: async (manager: number, count: number) => {
        let collection = collections.serverCounts
        return collection.findOneAndReplace({manager}, {manager, count}, {"upsert": true})
    },
    getStatistics: async () => {
        let collection = collections.statistics
        let found = await collection.find({})
        let statistics: Record<string, number> = {}
    
        await found.forEach(item => {
            for (let prop in item.statistics) {
                if (prop in statistics) {
                    statistics[prop] += item.statistics[prop]
                } else {
                    statistics[prop] = item.statistics[prop]
                }
            }
        })
    
        return <statistics>statistics
    },
    setStatistics: async (shardID: number, statistics: statistics) => {
        let collection = collections.statistics
        return collection.findOneAndReplace({ "shardID": shardID }, { "shardID": shardID, "statistics": statistics }, {"upsert": true})
    },
    getQuestions: async (name: string) => {
        let collection = collections.questions
        return (await collection.findOne({ name })).data
    }
}

var prefixes: Record<string, string> = {}

var dumps = 0
setInterval(() => {
    dumps++
    console.log("handler " + process.memoryUsage().heapUsed)
    heapdump.writeSnapshot("/root/dumps/handler_dump_" + dumps + ".heapsnapshot", () => {
        console.log("Heap written")
    })
}, 200000)