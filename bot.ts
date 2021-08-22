import Discord, { Options, ClientOptions, Collection, CommandInteraction, GuildChannel, Message, TextBasedChannels, TextChannel, MessageEmbed } from 'discord.js-light'

import dotenv from 'dotenv'
dotenv.config()

export type statistics = { 
    timeCreated: number, 
    truth: number, 
    dare: number, 
    wyr: number, 
    nhie: number, 
    paranoia: number, 
    serversJoined: number, 
    serversLeft: number 
}

export type ChannelSetting = "muted?" | "truth pg" | "truth pg13" | "truth r" | "dare pg" | "dare pg13" | "dare r" | "dare d" | "dare irl" | "wyr pg" | "wyr pg13" | "wyr r" | "nhie pg" | "nhie pg13" | "nhie r" | "paranoia pg" | "paranoia pg13" | "paranoia r" | "show paranoia"
export type ChannelSettings = {
    [key in ChannelSetting]: key extends "show paranoia" ? string : boolean
}

export type Question = {
    text: string,
    id: string
}

interface CustomClient extends Discord.Client {
    commands: Collection<string, Function>,
    slashCommands: Collection<string, Function>,
    statistics: statistics,
    numberTruths: number,
    numberDares: number,
    numberWyr: number,
    numberNhie: number,
    numberParanoias: number
}

class CustomClient extends Discord.Client {
    constructor(options: ClientOptions, commands: Collection<string, Function>, slashCommands: Collection<string, Function>, statistics: statistics) {
        super(options)
        this.commands = commands
        this.slashCommands = slashCommands,
        this.statistics = statistics
        this.numberTruths = 0
        this.numberDares = 0
        this.numberWyr = 0
        this.numberNhie = 0
        this.numberParanoias = 0
    }
}

const client: CustomClient = new CustomClient({
    makeCache: Options.cacheWithLimits({
        ApplicationCommandManager: 0,
        BaseGuildEmojiManager: 0,
        ChannelManager: 1,
        GuildBanManager: 0,
        GuildChannelManager: 1,
        GuildInviteManager: 0,
        GuildManager: 15,
        GuildMemberManager: 0,
        GuildStickerManager: 0,
        MessageManager: 0,
        PermissionOverwriteManager: 0,
        PresenceManager: 0,
        ReactionManager: 0,
        ReactionUserManager: 0,
        RoleManager: 0,
        StageInstanceManager: 0,
        ThreadManager: 0,
        ThreadMemberManager: 0,
        UserManager: 0,
        VoiceStateManager: 0
    }),
    allowedMentions: { parse:['users'], repliedUser: true },
    intents: ["GUILDS", "GUILD_MESSAGES", "DIRECT_MESSAGES"]
}, new Discord.Collection(), new Discord.Collection(), { "timeCreated": Date.now(), "truth": 0, "dare": 0, "wyr": 0, "nhie": 0, "paranoia": 0, "serversJoined": 0, "serversLeft": 0 });

import * as topgg from '@top-gg/sdk'
const topggAPI = new topgg.Api(process.env.TOPGG!);

import fs from 'fs'

export const defaultSettings = () => { return { "muted?": false, "truth pg": true, "truth pg13": true, "truth r": false, "dare pg": true, "dare pg13": true, "dare r": false, "dare d": true, "dare irl": false, "wyr pg": true, "wyr pg13": true, "wyr r": false, "nhie pg": true, "nhie pg13": true, "nhie r": false, "paranoia pg": true, "paranoia pg13": true, "paranoia r": false, "show paranoia": "default" }}
export const rRatedSettings = () => {return { "muted?": false, "truth pg": true, "truth pg13": true, "truth r": true, "dare pg": true, "dare pg13": true, "dare r": true, "dare d": true, "dare irl": false, "wyr pg": true, "wyr pg13": true, "wyr r": true, "nhie pg": true, "nhie pg13": true, "nhie r": true, "paranoia pg": true, "paranoia pg13": true, "paranoia r": true, "show paranoia": "default" }}
const dmSettings = () => {return { "muted?": false, "truth pg": true, "truth pg13": true, "truth r": true, "dare pg": true, "dare pg13": true, "dare r": true, "dare d": true, "dare irl": true, "wyr pg": true, "wyr pg13": true, "wyr r": true, "nhie pg": true, "nhie pg13": true, "nhie r": true, "paranoia pg": false, "paranoia pg13": false, "paranoia r": false, "show paranoia": "default" }} 
const dmCommands = ['ans', 'a', 'truth', 't', 'dare', 'd', 'wyr', 'nhie', 'help', 'h', 'clear', '', 'links', 'link', 'vote', 'invite', 'ping', 'random', 'shard', 'stats', 's']
var channelTime: Record<string, number> = {};

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
import { truthQuestionList } from "./Commands/truthCommand.js";
import { dareQuestionList } from "./Commands/dareCommand.js";
import { wyrQuestionList } from "./Commands/wyrCommand.js";
import { nhieQuestionList } from "./Commands/nhieCommand.js";
import { paranoiaQuestionList } from "./Commands/paranoiaCommand.js";
const handler = new MongoHandler()
handler.init(client.shard!.ids[0]).then(async () => {
    console.log("MongoDB connected")

    let truthQuestions = <truthQuestionList>await handler.getQuestions("truth")
    client.numberTruths = truthQuestions.pg.length + truthQuestions.pg13.length + truthQuestions.r.length

    let dareQuestions = <dareQuestionList>await handler.getQuestions("dare")
    client.numberDares = dareQuestions.pg_d.length + dareQuestions.pg13_d.length + dareQuestions.r_d.length + dareQuestions.pg_irl.length + dareQuestions.pg13_irl.length + dareQuestions.r_irl.length
    
    let wyrQuestions = <wyrQuestionList>await handler.getQuestions("wyr")
    client.numberWyr = wyrQuestions.pg.length + wyrQuestions.pg13.length + wyrQuestions.r.length
    
    let nhieQuestions = <nhieQuestionList>await handler.getQuestions("nhie")
    client.numberNhie = nhieQuestions.pg.length + nhieQuestions.pg13.length + nhieQuestions.r.length
    
    let paranoiaQuestions = <paranoiaQuestionList>await handler.getQuestions("paranoia")
    client.numberParanoias = paranoiaQuestions.pg.length + paranoiaQuestions.pg13.length + paranoiaQuestions.r.length

    client.login(process.env.TOKEN).catch(console.log)
})

import * as commandIDs from './commandIDs.json'

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
        if (cmd.Aliases) cmd.Aliases.forEach((a: string) => {
            client.commands.set(a, cmd.Command)
        })
        if (cmd.SlashCommand) client.slashCommands.set(file.split('Command')[0].toLowerCase(), cmd.SlashCommand);
    }
});

client.on('debug', console.log)
client.on('ready', () => {
    console.log("Connected");
    client.user!.setActivity('truth or dare | Shard ' + client.shard!.ids[0], { type: "PLAYING" });
});
client.on('rateLimit', (info) => {
    console.log(`Rate limit hit, Time: ${info.timeout ? info.timeout : 'Unknown timeout '}, Path: ${info.path || 'Unknown path'}, Route: ${info.route || 'Unknown route'}`);
});
client.on('guildCreate', async (guild) => {
    console.log(`Server joined: ${guild.name} (${guild.id})`);

    let serverChannels: string[] = []
    guild.channels.cache
        .filter(c => c.type === 'GUILD_TEXT')
        .forEach(c => {
            serverChannels.push(c.id)
            if ((<TextChannel>c).nsfw) { 
                handler.setChannelSettings(c.id, rRatedSettings())
            } else {
                handler.setChannelSettings(c.id, defaultSettings())
            }
        });
        handler.setServerChannels(guild.id, serverChannels);

    handler.setServerCount(client.shard!.ids[0], client.guilds.cache.size)
    client.statistics.serversJoined++;
    /* await topggAPI.postStats({
        serverCount: client.guilds.cache.size,
        shardId: client.shard.ids[0],
        shardCount: client.options.shardCount
    }); */
    handler.setStatistics(client.shard!.ids[0], client.statistics)

    console.log("Server count updated for shard " + client.shard!.ids[0] + ": " + client.guilds.cache.size);

    handler.setPrefix(guild.id, '+');
});
client.on('guildDelete', async (guild) => {
    console.log(`Server left: ${guild.name} (${guild.id})`);

    handler.setServerCount(client.shard!.ids[0], client.guilds.cache.size)
    client.statistics.serversLeft++;
    /* await topggAPI.postStats({
        serverCount: client.guilds.cache.size,
        shardId: client.shard.ids[0],
        shardCount: client.options.shardCount
    }); */
    handler.setStatistics(client.shard!.ids[0], client.statistics)

    let serverChannels = await handler.getServerChannels(guild.id)
    if (Array.isArray(serverChannels)) {
        serverChannels.forEach?.(id => {
        handler.deleteChannelSettings(id)
    })
}

    console.log("Server count updated for shard " + client.shard!.ids[0] + ": " + client.guilds.cache.size);
    
    handler.deletePrefix(guild.id);
});

client.on('channelDelete', async (channel) => {
    if (channel?.type === "GUILD_TEXT") {
        let serverChannels = await handler.getServerChannels(channel.guild.id)
        if (Array.isArray(serverChannels)) {
            handler.setServerChannels(channel.guild.id, serverChannels.filter(c => c !== channel.id))
        } else {
            serverChannels = channel.guild.channels.cache
                .filter(x => x.type === "GUILD_TEXT")
                .map(x => x.id)
            handler.setServerChannels(channel.guild.id, serverChannels)
        }
        handler.deleteChannelSettings(channel.id)
    }
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;
    const { channelId, guild, commandName } = interaction

    if (guild) {
        let channelSettings = channelId ? await handler.getChannelSettings(channelId) : undefined

        if ((!channelSettings || Object.keys(channelSettings).length === 0) && channelId && guild) {
            console.log("Unindexed channel")

            channelSettings = defaultSettings()

            let oldServerChannels = await handler.getServerChannels(guild.id)
            if (!Array.isArray(oldServerChannels)) {
                oldServerChannels = []
            }
            let serverChannels = [...oldServerChannels, channelId]
            handler.setChannelSettings(channelId, channelSettings);
            handler.setServerChannels(guild.id, serverChannels)
        }

        if (client.slashCommands.has(commandName) && commandName !== "ans") {
            await interaction.deferReply()
            let premium = await handler.getPremiumServer(guild.id)
            client.slashCommands.get(commandName)!(interaction, channelSettings, premium);
        }
    } else if (dmCommands.includes(commandName)) {
        await interaction.deferReply()
        client.slashCommands.get(commandName)!(interaction, dmSettings(), false)
    }
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || (message.channel.type !== "GUILD_TEXT" && message.channel.type !== "DM")) {
        return;
    }

    const { guild, channelId } = message;
    if (guild) {
        let prefix = await handler.getPrefix(guild.id);

        if (!prefix || (typeof prefix === "object" && Object.keys(prefix).length === 0)) {
            prefix = '+'
            handler.setPrefix(guild.id, prefix)
        }

        if (message.content.startsWith(prefix)) {
            let channelSettings = await handler.getChannelSettings(channelId);

            if ((!channelSettings || Object.keys(channelSettings).length === 0) && channelId) {
                console.log("Unindexed channel")

                channelSettings = defaultSettings()

                let oldServerChannels = await handler.getServerChannels(guild.id)
                if (!Array.isArray(oldServerChannels)) {
                    oldServerChannels = []
                }
                let serverChannels = [...oldServerChannels, channelId]
                handler.setChannelSettings(channelId, channelSettings);
                handler.setServerChannels(guild.id, serverChannels)
            }

            let premium = await handler.getPremiumServer(guild.id)
            processCommand(message, channelSettings!, prefix, false, premium);

            if (Math.random() < 0.007) {
                let linkEmbed = new Discord.MessageEmbed()
                    .setColor('#e91e62')
                    .setTitle("Links")
                    .addField('\u200B', 'Enjoying the bot? Make sure to [give feedback](https://truthordarebot.xyz/feedback) and [suggest questions](https://truthordarebot.xyz/question_submit).')
                    .setTimestamp();
                sendMessage(message.channel, {
                    embeds: [linkEmbed]
                });
            }
        }
    }
    else {
        if (message.content.startsWith('+')) {
            processCommand(message, dmSettings(), '+', true, false);
        }
    }
});

async function processCommand(message: Message, channelSettings: ChannelSettings, prefix: string, dm: boolean, premium: boolean) {
    var fullCommand = dm ? message.content.substr(1) : message.content.substr(prefix.length)
    let splitCommand = fullCommand.toLowerCase().trim().split(/ +|\n/gm);
    let primaryCommand = splitCommand[0];
    let args = splitCommand.slice(1);
    if (args.some(item => { return /\[.+\]/.test(item); }) && primaryCommand !== "ans") {
        sendMessage(message.channel, `You don't need to enclose your arguments in brackets, the help command uses them as placeholders. Example: Use ${prefix}truth pg, not ${prefix}truth [pg]`);
    }
    else {
        if (!dm) {
            if (Date.now() - channelTime[message.channelId] < (premium ? await handler.getCooldown(message.channelId) || 0 : 3000)) {
                sendMessage(message.channel, "You're sending commands too fast, wait a few seconds before trying another");
            }
            else if (!channelSettings["muted?"]) {
                if (client.commands.has(primaryCommand) && primaryCommand !== "ans") {
                    client.commands.get(primaryCommand)!(args, message, channelSettings, prefix);
                    channelTime[message.channelId] = Date.now();
                }
            } else if (primaryCommand === "unmute" || primaryCommand === "um") {
                client.commands.get(primaryCommand)!(args, message, channelSettings, premium, prefix)
            }
        } else {
            if(dmCommands.includes(primaryCommand)) {
                client.commands.get(primaryCommand)!(args, message, channelSettings, premium, prefix);
            } else if (client.commands.has(primaryCommand)) {
                sendMessage(message.channel, "That command cannot be used in DMs")
            }
        }
    }
}

function sendMessage(channel: TextBasedChannels, messageContent: any) {
    if (messageContent instanceof MessageEmbed) {
        channel.send({
            embeds: [messageContent]
        }).catch(() => { console.log("Missing permissions") })
    } else {
        channel.send(messageContent).catch(() => { console.log("Missing permissions"); });
    }
}
