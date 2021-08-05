export { Command }
import { client, sendMessage } from '../bot.js'

function Command(args, message) {
    sendMessage(message.channel, JSON.stringify(client.shard.ids));
}