export { Command, SlashCommand, Meta, Aliases };
import { CommandInteraction, Guild, Message, TextChannel } from 'discord.js';
import { sendMessage, handler, ChannelSettings, ChannelSetting } from '../bot.js';

type notShowParanoia<T> = T extends "show paranoia" ? never : T
type ValidChannelSetting = notShowParanoia<ChannelSetting>

const Aliases = ["dis"]

async function Command(args: string[], message: Message, channelSettings: ChannelSettings) {
    let {guild, channel} = message

    let member = await guild!.members.fetch(message.author.id)
    let roles = await Promise.all(member.roles.cache.map(role => guild!.roles.fetch(role.id)))
    let admin = member.permissions.has("ADMINISTRATOR")
        || roles.some(role => role?.permissions.has("ADMINISTRATOR"))
    if (!admin) {
        sendMessage(channel, "You must be an administrator to use this command.");
    }
    else if (!args.length) {
        sendMessage(channel, "You must specify a command (truth, dare, etc.) or category (pg, irl, etc.) to disable.");
    }
    else {
        let settingNames = args.filter(item => item !== "server");
        if (!settingNames.length) {
            sendMessage(channel, "You must specify a command (truth, dare, etc.) or category (pg, irl, etc.) to disable.");
        }
        else {
            let commands = args.filter(item => ["truth", "dare", "wyr", "nhie", "paranoia"].includes(item));
            let categories = args.filter(item => ["pg", "pg13", "r", "d", "irl"].includes(item));
            let toBeDisabled: ValidChannelSetting[] = [];
            if (args.includes("all")) {
                toBeDisabled = ["truth pg", "truth pg13", "dare pg", "dare pg13", "dare d", "dare irl", "wyr pg", "wyr pg13", "nhie pg", "nhie pg13", "paranoia pg", "paranoia pg13"]
            }
            else if (commands.length !== 0) {
                for (let command of commands) {
                    if (categories.length !== 0) {
                        for (let category of categories) {
                            if (command === "dare" || (category !== "d" && category !== "irl")) {
                                toBeDisabled.push(<ValidChannelSetting>(command + " " + category));
                            }
                        }
                    }
                    else {
                        if (command !== "dare") {
                            ["pg", "pg13"].forEach(category => toBeDisabled.push(<ValidChannelSetting>(command + " " + category)));
                        }
                        else {
                            ["pg", "pg13", "d", "irl"].forEach(category => toBeDisabled.push(<ValidChannelSetting>("dare " + category)));
                        }
                    }
                }
            }
            else if (categories.length !== 0) {
                for (let category of categories) {
                    if (category === "d" || category === "irl") {
                        toBeDisabled.push(<ValidChannelSetting>("dare " + category));
                    }
                    else {
                        ["truth", "dare", "wyr", "nhie", "paranoia"].forEach(command => toBeDisabled.push(<ValidChannelSetting>(command + " " + category)));
                    }
                }
            }

            if (toBeDisabled.length === 0) {
                sendMessage(channel, "Could not find any valid commands or categories to disable. Double check that any commands or categories specified are spelled correctly and are not mutually exclusive (like `truth` and `irl`).");
            }
            else {
                if (args.includes("server")) {
                    let serverChannels = await handler.getServerChannels(guild!.id)
                    for (let c of serverChannels) {
                        let cs = await getCS(c, guild!)
                        for (let setting of toBeDisabled) {
                            cs[setting] = false
                        }
                        await handler.setChannelSettings(c, cs)
                    }
                } else {
                    for (let setting of toBeDisabled) {
                        channelSettings[setting] = false
                    }
                    await handler.setChannelSettings(channel.id, channelSettings)
                }
                let disabledString = joinToString(toBeDisabled);
                sendMessage(channel, `${disabledString} disabled ${(args.includes("server")) ? "serverwide" : "in this channel"}`);
            }
        }
    }
}

async function SlashCommand(interaction: CommandInteraction, channelSettings: ChannelSettings) {
    let { guild, channel, options } = interaction
    let serverwide = options.get('serverwide')!.value
    let command = options.get('command')!.value
    let category = options.get('category')!.value

    if ((command !== "dare" && command !== "all") && (category === "d" || category === "irl")) {
        interaction.editReply("The d and irl categories only apply to the dare command")
        return
    }

    let toBeDisabled: ValidChannelSetting[] = []
    let commandArray = command === "all" ? ["truth", "dare", "wyr", "nhie", "paranoia"] : [command]
    let categoryArray = category === "all" ? ["pg", "pg13", "r", "d", "irl"] : [category]
    for (let x of commandArray) {
        for (let y of categoryArray) {
            if (x === "dare" || (y !== "d" && y !== "irl")) {
                toBeDisabled.push(<ValidChannelSetting>(x + " " + y))
            }
        }
    }

    if (serverwide) {
        let serverChannels = await handler.getServerChannels(guild!.id)
        for (let c of serverChannels) {
            let cs = await getCS(c, guild!)
            for (let setting of toBeDisabled) {
                cs[setting] = false
            }
            await handler.setChannelSettings(c, cs)
        }

        interaction.editReply(joinToString(toBeDisabled) + " disabled serverwide")
    } else if (options.data.some(o => o.name === 'channel')) {
        if (options.get('channel')!.channel!.type !== "GUILD_TEXT") {
            interaction.editReply("The channel must be a text channel")
            return
        }

        let channelID = options.get('channel')!.channel!.id
        let cs = await getCS(channelID, guild!)
        for (let setting of toBeDisabled) {
            cs[setting] = false
        }
        await handler.setChannelSettings(channelID, cs)

        interaction.editReply(`${joinToString(toBeDisabled)} disabled in <#${channelID}>`)
    } else {
        for (let setting of toBeDisabled) {
            channelSettings[setting] = false
        }
        await handler.setChannelSettings(channel!.id, channelSettings)

        interaction.editReply(`${joinToString(toBeDisabled)} disabled in the current channel`)
    }
}

const Meta = {
    name: 'disable',
    description: 'Disable permissions for a specified command and category',
    defaultPermission: false,
    options: [
        {
            name: 'serverwide',
            description: "Whether the settings should be changed for all channels in the server",
            type: 'BOOLEAN',
            required: true
        },
        {
            name: 'command',
            description: "The command to disable",
            type: 'STRING',
            required: true,
            choices: [
                { name: "truth", value: "truth" },
                { name: "dare", value: "dare" },
                { name: "wyr", value: "wyr" },
                { name: "nhie", value: "nhie" },
                { name: "paranoia", value: "paranoia" },
                { name: "all", value: "all" }
            ]
        },
        {
            name: 'category',
            description: "The category to disable",
            type: 'STRING',
            required: true,
            choices: [
                { name: "pg", value: "pg" },
                { name: "pg13", value: "pg13" },
                { name: "r", value: "r" },
                { name: "d", value: "d" },
                { name: "irl", value: "irl" },
                { name: "all", value: "all" }
            ]
        },
        {
            name: 'channel',
            description: "If not serverwide, which channel to change settings in",
            type: 'CHANNEL',
            required: false
        }
    ]
}

function joinToString(array: string[]) {
    return (array.length > 2) ?
        `\`${array.slice(0, -1).join("\`, \`")}\`, and \`${array[array.length - 1]}\`` :
        (array.length === 2) ?
            `\`${array[0]}\` and \`${array[1]}\`` :
            `\`${array[0]}\``
}

const defaultSettings = { "muted?": false, "truth pg": true, "truth pg13": true, "truth r": false, "dare pg": true, "dare pg13": true, "dare r": false, "dare d": true, "dare irl": false, "wyr pg": true, "wyr pg13": true, "wyr r": false, "nhie pg": true, "nhie pg13": true, "nhie r": false, "paranoia pg": true, "paranoia pg13": true, "paranoia r": false, "show paranoia": "default" };
const rRatedSettings = { "muted?": false, "truth pg": true, "truth pg13": true, "truth r": true, "dare pg": true, "dare pg13": true, "dare r": true, "dare d": true, "dare irl": false, "wyr pg": true, "wyr pg13": true, "wyr r": true, "nhie pg": true, "nhie pg13": true, "nhie r": true, "paranoia pg": true, "paranoia pg13": true, "paranoia r": true, "show paranoia": "default" };

async function getCS(channelID: string, guild: Guild) {
    let cs = await handler.getChannelSettings(channelID);

    if (!cs) {
        console.log("Unindexed channel");

        let channel = await guild.channels.fetch(channelID)
        cs = (<TextChannel>channel).nsfw ? rRatedSettings : defaultSettings

        let serverChannels = await handler.getServerChannels(guild.id)
        let newServerChannels = serverChannels.includes(channelID) ? serverChannels :  [...serverChannels, channelID]
        handler.setChannelSettings(channelID, cs);
        handler.setServerChannels(guild.id, newServerChannels)
    }

    return cs
}