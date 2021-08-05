export { Command, SlashCommand, Meta, Aliases };
    import { CommandInteraction, Message } from 'discord.js';
import { sendMessage, handler, ChannelSetting, ChannelSettings } from '../bot.js';

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
            let serverChannels = await handler.getServerChannels(message.guild!.id)
            for (let channel of serverChannels) {
                let cs = await handler.getChannelSettings(channel)
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
        let serverChannels = await handler.getServerChannels(guild!.id)
        for (let channel of serverChannels) {
            let cs = await handler.getChannelSettings(channel)
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
        let cs = await handler.getChannelSettings(channelID)
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