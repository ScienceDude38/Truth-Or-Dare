import dotenv from 'dotenv'
dotenv.config()

import { fork } from 'child_process'
import { Shard } from "discord.js";
import { ShardingManager } from 'discord.js';

const manager = new ShardingManager('./bot.js', {
    token: process.env.TOKEN,
    respawn: true,
    execArgv: ["--trace-warnings"],
    totalShards: parseInt(process.env.TOTALSHARDS!),
    shardList: process.env.SHARDLIST!.split(",").map(x => parseInt(x))
});
manager.on('shardCreate', (shard: Shard) => {
    console.log(`Launched shard ${shard.id}`);
    shard.on('ready', () => {
        console.log('Shard ready');
    });
    shard.on('disconnect', () => {
        console.log('Shard disconnected');
    });
    shard.on('reconnecting', () => {
        console.log('Shard reconnecting');
    });
    shard.on('death', () => {
        console.log('Shard died');
    });
});
try {

    let handlerProcess = fork('./mongodbHandler.js')
    handlerProcess.on('error', console.error)
    manager.spawn();
} catch (e) {
    console.log(e)
}
