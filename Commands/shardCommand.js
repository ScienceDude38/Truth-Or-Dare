export { Command }
import { client } from '../bot.js'

function Command(args, message) {
    sendMessage(message.channel, JSON.stringify(client.shard.ids));
}