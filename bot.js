import { createRequire } from "module";
const require = createRequire(import.meta.url);
const Discord = require("discord.js-light");
const { Intents:{ FLAGS }} = Discord;
require('dotenv').config();
const heapdump = require("heapdump")
const client = new Discord.Client({
    cacheGuilds: true,
    cacheChannels: false,
    cacheOverwrites: false,
    cacheRoles: false,
    cacheEmojis: false,
    cachePresences: false,
    allowedMentions: { parse:['users'], repliedUser: true },
    intents: ["GUILDS", "GUILD_MESSAGES", "DIRECT_MESSAGES"]
});
const topgg = require('@top-gg/sdk');
const topggAPI = new topgg.Api(process.env.TOPGG);
const fs = require('fs');
const originalLog = console.log;
console.log = function (input) {
    let date = new Date();
    originalLog(`${(date.getHours() >= 10) ? date.getHours() : "0" + date.getHours()}:${(date.getMinutes() >= 10) ? date.getMinutes() : "0" + date.getMinutes()}:${(date.getSeconds() >= 10) ? date.getSeconds() : "0" + date.getSeconds()}    ${input}`);
};

client.commands = new Discord.Collection();
client.slashCommands = new Discord.Collection();
const defaultSettings = { "muted?": false, "truth pg": true, "truth pg13": true, "truth r": false, "dare pg": true, "dare pg13": true, "dare r": false, "dare d": true, "dare irl": false, "wyr pg": true, "wyr pg13": true, "wyr r": false, "nhie pg": true, "nhie pg13": true, "nhie r": false, "paranoia pg": true, "paranoia pg13": true, "paranoia r": false, "show paranoia": "default" };
const rRatedSettings = { "muted?": false, "truth pg": true, "truth pg13": true, "truth r": true, "dare pg": true, "dare pg13": true, "dare r": true, "dare d": true, "dare irl": false, "wyr pg": true, "wyr pg13": true, "wyr r": true, "nhie pg": true, "nhie pg13": true, "nhie r": true, "paranoia pg": true, "paranoia pg13": true, "paranoia r": true, "show paranoia": "default" };
const dmSettings = { "muted?": false, "truth pg": true, "truth pg13": true, "truth r": true, "dare pg": true, "dare pg13": true, "dare r": true, "dare d": true, "dare irl": true, "wyr pg": true, "wyr pg13": true, "wyr r": true, "nhie pg": true, "nhie pg13": true, "nhie r": true, "paranoia pg": false, "paranoia pg13": false, "paranoia r": false, "show paranoia": "default" }; 
const dmCommands = ['ans', 'a', 'truth', 't', 'dare', 'd', 'wyr', 'nhie', 'help', 'h', 'clear', '', 'links', 'link', 'vote', 'invite', 'ping', 'random', 'shard', 'stats', 's']
var channelTime = {};
client.statistics = { "timeCreated": Date.now(), "truth": 0, "dare": 0, "wyr": 0, "nhie": 0, "paranoia": 0, "serversJoined": 0, "serversLeft": 0 };
setInterval(() => {
    if (Date.now() - client.statistics.timeCreated > 3600000) {
        client.statistics = {
            "timeCreated": Date.now(),
            "truth": 0,
            "dare": 0,
            "wyr": 0,
            "nhie": 0,
            "paranoia": 0,
            "serversJoined": 0,
            "serversLeft": 0
        };
        console.log("Statistics reset");
    }
}, 600000);

import { MongoHandler } from './mongodbFunctions.js';
const handler = new MongoHandler()
handler.init().then(async () => {
    console.log("MongoDB connected")

    let truthQuestions = await handler.getQuestions("truth")
    client.numberTruths = truthQuestions.pg.length + truthQuestions.pg13.length + truthQuestions.r.length

    let dareQuestions = await handler.getQuestions("dare")
    client.numberDares = dareQuestions.pg_d.length + dareQuestions.pg13_d.length + dareQuestions.r_d.length + dareQuestions.pg_irl.length + dareQuestions.pg13_irl.length + dareQuestions.r_irl.length
    
    let wyrQuestions = await handler.getQuestions("wyr")
    client.numberWyr = wyrQuestions.pg.length + wyrQuestions.pg13.length + wyrQuestions.r.length
    
    let nhieQuestions = await handler.getQuestions("nhie")
    client.numberNhie = nhieQuestions.pg.length + nhieQuestions.pg13.length + nhieQuestions.r.length
    
    let paranoiaQuestions = await handler.getQuestions("paranoia")
    client.numberParanoias = paranoiaQuestions.pg.length + paranoiaQuestions.pg13.length + paranoiaQuestions.r.length

    client.login(process.env.TOKEN)
})

const commandIDs = require('./commandIDs.json')

export {
    Discord,
    client,
    fs,
    sendMessage,
    handler,
    commandIDs,
    topggAPI
};

fs.readdirSync('./Commands/').forEach(async file => {
    const cmd = (await import(`./Commands/${file}`));
    if (file.includes("Command")) {
        if (cmd.Command) client.commands.set(file.split('Command')[0].toLowerCase(), cmd.Command);
        if (cmd.Aliases) cmd.Aliases.forEach(a => {
            client.commands.set(a, cmd.Command)
        })
        if (cmd.SlashCommand) client.slashCommands.set(file.split('Command')[0], cmd.SlashCommand);
    }
});

client.on('debug', console.log)
client.on('ready', () => {
    console.log("Connected");
    client.user.setActivity('truth or dare | Shard ' + client.shard.ids[0], { type: "PLAYING" });
});
client.on('rateLimit', (info) => {
    console.log(`Rate limit hit, Time: ${info.timeout ? info.timeout : 'Unknown timeout '}, Path: ${info.path || 'Unknown path'}, Route: ${info.route || 'Unknown route'}`);
});
client.on('guildCreate', async (guild) => {
    console.log(`Server joined: ${guild.name} (${guild.id})`);

    let serverChannels = []
    guild.channels.cache
        .filter(c => c.type === 'text')
        .forEach(c => {
            serverChannels.push(c.id)
            if (c.nsfw) { 
                handler.setChannelSettings(c.id, rRatedSettings)
            } else {
                handler.setChannelSettings(c.id, defaultSettings)
            }
        });
        handler.setServerChannels(guild.id, serverChannels);

    handler.setServerCount(client.shard.ids[0], client.guilds.cache.size)
    client.statistics.serversJoined++;
    /* await topggAPI.postStats({
        serverCount: client.guilds.cache.size,
        shardId: client.shard.ids[0],
        shardCount: client.options.shardCount
    }); */
    handler.setStatistics(client.shard.ids[0], client.statistics)

    console.log("Server count updated for shard " + client.shard.ids[0] + ": " + client.guilds.cache.size);

    handler.setPrefix(guild.id, '+');
});
client.on('guildDelete', async (guild) => {
    console.log(`Server left: ${guild.name} (${guild.id})`);

    handler.setServerCount(client.shard.ids[0], client.guilds.cache.size)
    client.statistics.serversLeft++;
    /* await topggAPI.postStats({
        serverCount: client.guilds.cache.size,
        shardId: client.shard.ids[0],
        shardCount: client.options.shardCount
    }); */
    handler.setStatistics(client.shard.ids[0], client.statistics)

    let serverChannels = await handler.getServerChannels(guild.id)
    if (serverChannels) {
        serverChannels.forEach?.(id => {
        handler.deleteChannelSettings(id)
    })
}

    console.log("Server count updated for shard " + client.shard.ids[0] + ": " + client.guilds.cache.size);
    
    handler.deletePrefix(guild.id);
});

client.on('channelDelete', async (channel) => {
    if (channel?.type === "text") {
        let serverChannels = await handler.getServerChannels(channel.guild.id)
        if (serverChannels.filter) {
            handler.setServerChannels(channel.guild.id, serverChannels.filter(c => c !== channel.id))
        } else {
            if (serverChannels) {
                console.log("serverChannels:")
                console.dir(serverChannels)
            }
            let serverChannels = channel.guild.channels.cache
                .filter(x => x.type === "text")
                .map(x => x.id)
            handler.setServerChannels(channel.guild.id, serverChannels)
        }
        handler.deleteChannelSettings(channel.id)
    }
});

client.on('interaction', async (interaction) => {
    const { channel, guild, commandName } = interaction
    if (!interaction.isCommand()) return;
    let channelSettings = channel?.type === "text" ?
        await handler.getChannelSettings(channel.id) :
        dmSettings

    if (!channelSettings && channel?.type === "text") {
        console.log("Unindexed channel");

        channelSettings = channel.nsfw ? rRatedSettings : defaultSettings

        let serverChannels = [...handler.getServerChannels(guild.id), channel.id]
        handler.setChannelSettings(channel.id, channelSettings);
        handler.setServerChannels(guild.id, serverChannels)
    }

    if (channel?.type === 'text' && client.slashCommands.has(commandName) && commandName !== 'ans') {
        interaction.defer();
        client.slashCommands.get(commandName)(interaction, channelSettings);
    } else if (channel?.type === 'dm' && dmCommands.includes(commandName)) {
        interaction.defer()
        client.slashCommands.get(commandName)(interaction, dmSettings)
    }
});

client.on('message', async (message) => {
    if (message.author.bot || (message.channel.type !== "text" && message.channel.type !== "dm")) {
        return;
    }

    const { guild, channel } = message;
    if (guild) {
        let prefix = await handler.getPrefix(guild.id);

        if (!prefix) {
            prefix = '+'
            handler.setPrefix(guild.id, prefix)
        }

        if (message.content.startsWith(prefix)) {
            let channelSettings = await handler.getChannelSettings(channel.id);

            if (!channelSettings) {
                console.log("Unindexed channel");

                channelSettings = channel.nsfw ? rRatedSettings : defaultSettings

                let serverChannels = await handler.getServerChannels(guild.id)
                let newServerChannels = serverChannels.includes(channel.id) ? serverChannels :  [...serverChannels, channel.id]
                handler.setChannelSettings(channel.id, channelSettings);
                handler.setServerChannels(guild.id, newServerChannels)
            }

            processCommand(message, channelSettings, prefix, false);

            if (Math.random() < 0.007) {
                let linkEmbed = new Discord.MessageEmbed()
                    .setColor('#e91e62')
                    .setTitle("Links")
                    .addField('\u200B', 'Enjoying the bot? Make sure to [give feedback](https://truthordarebot.xyz/feedback) and [suggest questions](https://truthordarebot.xyz/question_submit).')
                    .setTimestamp();
                sendMessage(channel, linkEmbed);
            }
        }
    }
    else {
        if (message.content.startsWith('+')) {
            processCommand(message, dmSettings, '+', true);
        }
    }
});

async function processCommand(message, channelSettings, prefix, dm) {
    var fullCommand = dm ? message.content.substr(1) : message.content.substr(prefix.length)
    let splitCommand = fullCommand.toLowerCase().trim().split(/ +|\n/gm);
    let primaryCommand = splitCommand[0];
    let args = splitCommand.slice(1);
    if (args.some(item => { return /\[.+\]/.test(item); }) && primaryCommand !== "ans") {
        sendMessage(message.channel, `You don't need to enclose your arguments in brackets, the help command uses them as placeholders. Example: Use ${prefix}truth pg, not ${prefix}truth [pg]`);
    }
    else {
        if (!dm) {
            if (Date.now() - channelTime[message.channel.id] < 3000) {
                sendMessage(message.channel, "You're sending commands too fast, wait a few seconds before trying another");
            }
            else if (!channelSettings["muted?"]) {
                if (client.commands.has(primaryCommand) && primaryCommand !== "ans") {
                    client.commands.get(primaryCommand)(args, message, channelSettings, prefix);
                    channelTime[message.channel.id] = Date.now();
                }
            } else if (primaryCommand === "unmute" || primaryCommand === "um") {
                client.commands.get(primaryCommand)(args, message, channelSettings, prefix)
            }
        } else {
            if(dmCommands.includes(primaryCommand)) {
                client.commands.get(primaryCommand)(args, message, channelSettings, prefix);
            } else if (client.commands.has(primaryCommand)) {
                sendMessage(message.channel, "That command cannot be used in DMs")
            }
        }
    }
}

function sendMessage(channel, messageContent) {
    channel.send(messageContent).catch(() => { console.log("Missing permissions"); });
}

// var dumps = 0
// setInterval(() => {
//     dumps++
//     console.log(client.shard.ids[0] + " " + process.memoryUsage().heapUsed)
//     heapdump.writeSnapshot("/root/dumps/" + client.shard.ids[0] + "_dump_" + dumps + ".heapsnapshot", () => {
//         console.log("Heap written")
//     })
// }, 200000)