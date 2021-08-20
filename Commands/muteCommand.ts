export { Command, SlashCommand, Meta, Aliases };
    import { CommandInteraction, Guild, Message, TextChannel } from 'discord.js';
import { sendMessage, handler, ChannelSetting, ChannelSettings, rRatedSettings, defaultSettings } from '../bot.js';

const Aliases = ["m"]

async function Command(args: string[], message: Message, channelSettings: ChannelSettings, prefix: string) {
    let { guild } = message
    let member = await guild!.members.fetch(message.author.id)
    let roles = await Promise.all(member.roles.cache.map(role => guild!.roles.fetch(role.id)))
    let admin = member.permissions.has("ADMINISTRATOR")
        || roles.some(role => role?.permissions.has("ADMINISTRATOR"))
    if (!admin) {
        sendMessage(message.channel, "You must be an administrator to use this command");
    }
    else {
        if (args.includes('server') && args.length === 1) {
            let serverChannels = await getSC(guild!)
            for (let channel of serverChannels) {
                let cs = await getCS(channel, guild!)
                if (cs) {
                    cs["muted?"] = true
                    handler.setChannelSettings(channel, cs)
                }
            }
            sendMessage(message.channel, `Muted serverwide. Use ${prefix}unmute to unmute`);
        }
        else if (args.length === 0) {
            if (channelSettings["muted?"] === true) {
                sendMessage(message.channel, "I am already muted");
            }
            else {
                channelSettings["muted?"] = true;
                handler.setChannelSettings(message.channel.id, channelSettings);
                sendMessage(message.channel, `Muted in this channel. Use ${prefix}unmute to unmute`);
            }
        }
    }
}

async function SlashCommand(interaction: CommandInteraction, channelSettings: ChannelSettings) {
    let { guild, options } = interaction
    let serverwide = options.get('serverwide')!.value
    if (serverwide) {
        let serverChannels = await getSC(guild!)
        for (let channel of serverChannels) {
            let cs = await getCS(channel, guild!)
            if (cs) {
                cs["muted?"] = true
                handler.setChannelSettings(channel, cs)
            }
        }
        interaction.editReply("Muted serverwide. Use `/unmute` to unmute")
    } else if (options.data.some(o => o.name === 'channel')) {
        if (options.get('channel')!.channel!.type !== "GUILD_TEXT") {
            interaction.editReply("The channel must be a text channel")
            return
        }

        let channelID = options.get('channel')!.channel!.id
        let cs = await getCS(channelID, guild!)
        if (cs) {
            cs["muted?"] = true
            handler.setChannelSettings(channelID, cs)
        }
        interaction.editReply(`Muted in <#${channelID}>. Use \`/unmute\` to unmute>`)
    } else {
        channelSettings["muted?"] = true
        handler.setChannelSettings(interaction.channel!.id, channelSettings)
        interaction.editReply("Muted in this channel. Use `/unmute` to unmute")
    }
}

const Meta = {
    name: 'mute',
    description: "Used to mute the bot in the channel the message was sent",
    defaultPermission: false,
    options: [
        {
            name: 'serverwide',
            description: "Whether the bot should be muted across the whole server",
            type: "BOOLEAN",
            required: true
        },
        {
            name: 'channel',
            description: "If not muting serverwide, which channel the bot should be muted in",
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