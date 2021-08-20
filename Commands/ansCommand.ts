export { Command, SlashCommand, Meta, Aliases };
    import { CommandInteraction, Message, TextBasedChannels } from 'discord.js';
import { client, sendMessage, handler } from '../bot.js';
import { checkUserAns, checkUserParanoia, removeUser } from './paranoiaData.js';

const Aliases = ["a"]

async function Command(args: string[], message: Message) {
    let checkUser = await checkUserAns(message.author.id);
    if (checkUser) {
        if (args.length === 0) {
            sendMessage(message.channel, "You have to provide an answer");
        }
        else {
            let channelSettings = await handler.getChannelSettings(checkUser.channel);
            if (!channelSettings || Object.keys(channelSettings).length === 0) {
                sendMessage(message.channel, "Channel to send reply to was not found")
            } else if ((Math.random() < 0.55 && channelSettings["show paranoia"] === "default") || channelSettings["show paranoia"] === "all") {
                let channel = await client.channels.fetch(checkUser.channel, { cache: false, force: true, allowUnknownGuild: true })
                if (channel) {
                    (<TextBasedChannels>channel).send(`Question: ${checkUser.question}\n${message.author.username} said: ${escapeString(args.join(" "))}`).catch(() => console.log("Invalid channel ID"));
                } else {
                    sendMessage(message.channel, "Channel to send reply to was not found")
                }
            }
            else {
                let channel = await client.channels.fetch(checkUser.channel, { cache: false, force: true, allowUnknownGuild: true })
                if (channel) {
                    (<TextBasedChannels>channel).send(`Question is kept secret\n${message.author.username} said: ${escapeString(args.join(" "))}`).catch(() => console.log("Invalid channel ID"));
                } else {
                    sendMessage(message.channel, "Channel to send reply to was not found")
                }
            }
            if (/\[.+\]/.test(args.join(" "))) {
                sendMessage(message.channel, "You don't need to enclose your answer in brackets. Example: Use '+ans John', not '+ans [John]'.");
            }
            removeUser(message.author.id);
        }
    }
    else {
        sendMessage(message.channel, "You currently have no active questions");
    }
}

async function SlashCommand(interaction: CommandInteraction) {
    let checkUser = await checkUserAns(interaction.user.id)
    if (checkUser) {
        let channelSettings = await handler.getChannelSettings(checkUser.channel)
        if (!channelSettings || Object.keys(channelSettings).length === 0) {
            interaction.editReply("Channel to send reply to was not found")
        } else if ((Math.random() < 0.55 && channelSettings["show paranoia"] === "default") || channelSettings["show paranoia"] === "all") {
            let channel = await client.channels.fetch(checkUser.channel, { cache: false, force: true, allowUnknownGuild: true })
            if (channel) {
                (<TextBasedChannels>channel).send(`Question: ${checkUser.question}\n${interaction.user.username} said: ${escapeString(<string>interaction.options.get('answer')!.value)}`).catch(() => console.log("Invalid channel ID"))
            } else {
                interaction.editReply("Channel to send reply to was not found")
            }
        } else {
            let channel = await client.channels.fetch(checkUser.channel, { cache: false, force: true, allowUnknownGuild: true })
            if (channel) {
                (<TextBasedChannels>channel).send(`Question is kept secret\n${interaction.user.username} said: ${escapeString(<string>interaction.options.get('answer')!.value)}`).catch(() => console.log("Invalid channel ID"))
            } else {
                interaction.editReply("Channel to send reply to was not found")
            }
        }
        removeUser(interaction.user.id)
        interaction.editReply("Answer sent")
    } else {
        interaction.editReply("You currently have no active questions")
    }
}

const Meta = {
    name: 'ans',
    description: 'Used to answer a paranoia question, can only be used in DMs',
    options: [
        {
            name: 'answer',
            type: 'STRING',
            description: "Your answer to the question",
            required: true
        }
    ]
}

function escapeString(string: string) {
    return (string
        .replace(/\\/g, '\\\\')
        .replace(/\n/g, "\\n")
        .replace(/\"/g, '\\"')
        .replace(/\(/g, '\\(')
        .replace(/\)/g, '\\)')
        .replace(/\;/g, '\\;'));
}
