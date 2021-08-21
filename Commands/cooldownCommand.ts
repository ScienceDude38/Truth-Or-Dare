import { CommandInteraction, Guild } from "discord.js";
import { ChannelSettings, handler } from "../bot";


export { SlashCommand, Meta }

async function SlashCommand(interaction: CommandInteraction, channelSettings: ChannelSettings, premium: boolean) {
    let { guild, channelId, options } = interaction

    if (!premium) {
        interaction.editReply("This command is only available for servers with the premium version of the bot")
        return
    }

    let serverwide = <boolean>options.get("serverwide")!.value
    let length = <number>options.get("length")!.value

    if (serverwide) {
        if (length < 0) {
            interaction.editReply("Cooldown length must be a positive number")
        } else {
            let serverChannels = await getSC(guild!)
            for (let channel of serverChannels) {
                handler.setCooldown(channel, length * 1000)     // length in milliseconds to match Date.now()
            }
    
            interaction.editReply(`Cooldown set to ${length} seconds serverwide`)
        }
    } else {
        if (length < 0) {
            interaction.editReply("Cooldown length must be a positive number")
        } else {
            await handler.setCooldown(channelId, length * 1000)
            interaction.editReply(`Cooldown set to ${length} seconds`)
        }
    }
}

const Meta = {
    name: 'cooldown',
    description: "Change the cooldown for the bot",
    defaultPermission: false,
    options: [
        {
            name: 'serverwide',
            description: "Whether to set the cooldown for all channels in the server",
            type: "BOOLEAN",
            required: true
        },
        {
            name: "length",
            description: "The length of the bot's cooldown in seconds",
            type: "NUMBER",
            required: true
        }
    ]
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