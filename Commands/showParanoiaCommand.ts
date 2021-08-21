export { Command, SlashCommand, Meta, Aliases };
    import { CommandInteraction, Guild, Message, TextChannel } from 'discord.js';
import { ChannelSetting, ChannelSettings, defaultSettings, handler, rRatedSettings, sendMessage } from '../bot.js';

const Aliases = ["sp"]

async function Command(args: string[], message: Message, channelSettings: ChannelSettings, premium: boolean, prefix: string) {
    let { guild, channel } = message
    let member = await guild!.members.fetch(message.author.id)
    let roles = await Promise.all(member.roles.cache.map(role => guild!.roles.fetch(role.id)))
    let admin = member.permissions.has("ADMINISTRATOR")
        || roles.some(role => role?.permissions.has("ADMINISTRATOR"))
    if (!admin) {
        sendMessage(message.channel, "You must be an administrator to use this command.");
    }
    else {
        let server = args.includes("server");
        if (server) {
            if (args.length === 1) {
                sendMessage(channel, "You have to specify how many paranoia questions you want shown using `all`, `none`, or `default` (half).");
            } else if (args.length > 2) {
                sendMessage(channel, "You can only specify one setting")
            } else {
                let serverChannels = await getSC(guild!)
                let value

                if (args.includes("all")) {
                    value = "all"
                    sendMessage(channel, `All paranoia questions serverwide will now show after they are answered. To change this, use \`${prefix}showparanoia\``)
                } else if (args.includes("none")) {
                    value = "none"
                    sendMessage(channel, `No paranoia questions serverwide will be shown after they are answered. To change this, use \`${prefix}showparanoia\``)
                } else if (args.includes("default") || args.includes("half")) {
                    value = "default"
                    sendMessage(channel, `Half of the paranoia questions answered serverwide will have the questions displayed (intended behavior). To change this, use \`${prefix}showparanoia\``)
                } else {
                    sendMessage(channel, "That is not a valid option. Specify `all`, `none`, or `default`")
                }

                if (value) {
                    for (let c of serverChannels) {
                        let cs = await getCS(c, guild!)
                        if (cs) {
                            cs["show paranoia"] = value
                            handler.setChannelSettings(c, cs)
                        }
                    }
                }
            }
        }
        else {
            if (args.length === 0) {
                sendMessage(channel, "You have to specify how many paranoia questions you want shown using `all`, `none`, or `default` (half).");
            } else if (args.length > 1) {
                sendMessage(channel, "You can only specify one setting")
            } else {
                let value

                if (args[0] === "all") {
                    value = "all"
                    sendMessage(channel, `All paranoia questions will now show after they are answered. To change this, use \`${prefix}showparanoia\``)
                } else if (args[0] === "none") {
                    value = "none"
                    sendMessage(channel, `No paranoia questions will be shown after they are answered. To change this, use \`${prefix}showparanoia\``)
                } else if (args[0] === "default" || args[0] === "half") {
                    value = "default"
                    sendMessage(channel, `Half of the paranoia questions answered will have the questions displayed (intended behavior). To change this, use \`${prefix}showparanoia\``)
                } else {
                    sendMessage(channel, "That is not a valid option. Specify `all`, `none`, or `default`")
                }

                if (value) {
                    channelSettings["show paranoia"] = value
                    handler.setChannelSettings(channel.id, channelSettings)
                }
            }
        }
    }
}

async function SlashCommand(interaction: CommandInteraction, channelSettings: ChannelSettings) {
    let { options, channelId, guild } = interaction
    
    let server = options.get('serverwide')!.value
    let value = options.get('value')!.value
    if (server) {
        if (value === "all") {
            interaction.editReply("All paranoia questions serverwide will now show after they are answered. To change this, use \`/showparanoia\`")
        } else if (value === "none") {
            interaction.editReply("No paranoia questions serverwide will be shown after they are answered. To change this, use \`/showparanoia\`")
        } else if (value === "default") {
            interaction.editReply("Half of the paranoia questions answered serverwide will have the questions displayed (intended behavior). To change this, use \`/showparanoia\`")
        }

        let serverChannels = await getSC(guild!)
        for (let c of serverChannels) {
            let cs = await getCS(c, guild!)
            if (cs) {
                cs["show paranoia"] = <string>value
                handler.setChannelSettings(c, cs)
            }
        }
    } else if (options.data.some(o => o.name === 'channel')) {
        if (options.get('channel')!.channel!.type !== "GUILD_TEXT") {
            interaction.editReply("The channel must be a text channel")
            return
        }

        let targetChannel = options.get('channel')!.channel
        let cs = await getCS(targetChannel!.id, guild!)

        if (value === "all") {
            interaction.editReply(`All paranoia questions in <#${targetChannel!.id}> will now show after they are answered. To change this, use \`/showparanoia\``)
        } else if (value === "none") {
            interaction.editReply(`No paranoia questions in <#${targetChannel!.id}> will be shown after they are answered. To change this, use \`/showparanoia\``)
        } else if (value === "default") {
            interaction.editReply(`Half of the paranoia questions in <#${targetChannel!.id}> answered will have the questions displayed (intended behavior). To change this, use \`/showparanoia\``)
        }

        cs["show paranoia"] = <string>value
        handler.setChannelSettings(targetChannel!.id, cs)
    } else {
        if (value === "all") {
            interaction.editReply("All paranoia questions will now show after they are answered. To change this, use \`/showparanoia\`")
        } else if (value === "none") {
            interaction.editReply("No paranoia questions will be shown after they are answered. To change this, use \`/showparanoia\`")
        } else if (value === "default") {
            interaction.editReply("Half of the paranoia questions answered will have the questions displayed (intended behavior). To change this, use \`/showparanoia\`")
        }

        channelSettings["show paranoia"] = <string>value
        handler.setChannelSettings(channelId, channelSettings)
    }
}

const Meta = {
    name: 'showparanoia',
    description: "Change how often the question is shown for paranoia questions",
    options: [
        {
            name: 'serverwide',
            description: "Whether the setting applies to all channels in the server",
            type: "BOOLEAN",
            required: true
        },
        {
            name: 'value',
            description: "The value to change the setting to",
            type: "STRING",
            required: true,
            choices: [
                { name: "all", value: "all" },
                { name: "none", value: "none" },
                { name: "default", value: "default" }
            ]
        },
        {
            name: 'channel',
            description: "If not serverwide, the channel to change the setting in",
            type: "CHANNEL",
            required: false
        }
    ]
}

async function getCS(channelID: string, guild: Guild) {
    let cs = await handler.getChannelSettings(channelID);

    if (!cs || Object.keys(cs).length === 0) {
        console.log("Unindexed channel");

        let channel = await guild.channels.fetch(channelID)
        cs = (<TextChannel>channel).nsfw ? rRatedSettings() : defaultSettings()

        let serverChannels = await getSC(guild)
        let newServerChannels = serverChannels.includes(channelID) ? serverChannels :  [...serverChannels, channelID]
        handler.setChannelSettings(channelID, cs);
        handler.setServerChannels(guild.id, newServerChannels)
    }

    return cs
}

async function getSC(guild: Guild) {
    let sc = await handler.getServerChannels(guild.id)

    if (!Array.isArray(sc)) {
        sc = guild.channels.cache
            .filter(x => x.type === "GUILD_TEXT")
            .map(x => x.id)
    }

    return sc
}