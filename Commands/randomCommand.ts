export { Command }
import { Message } from 'discord.js';
import { ChannelSettings, client, sendMessage } from '../bot.js'

function Command(args: string, message: Message, channelSettings: ChannelSettings) {
    let commands = [];
    if (channelSettings["truth pg"] || channelSettings["truth pg13"] || channelSettings["truth r"]) {
        commands.push("truth");
    }
    if ((channelSettings["dare pg"] || channelSettings["dare pg13"] || channelSettings["dare r"]) && (channelSettings["dare d"] || channelSettings["dare irl"])) {
        commands.push("dare");
    }
    if (channelSettings["wyr pg"] || channelSettings["wyr pg13"] || channelSettings["wyr r"]) {
        commands.push("wyr");
    }
    if (channelSettings["nhie pg"] || channelSettings["nhie pg13"] || channelSettings["nhie r"]) {
        commands.push("nhie");
    }

    if (commands.length === 0) {
        sendMessage(message.channel, "All question commands are disabled here")
        return
    }

    let index = Math.floor(Math.random() * commands.length)
    client.commands.get(commands[index])!(args, message, channelSettings)
}