export { Command }
import { Message } from 'discord.js';
import { client, sendMessage } from '../bot.js'

function Command(args: string[], message: Message) {
    sendMessage(message.channel, JSON.stringify(client.shard!.ids));
}