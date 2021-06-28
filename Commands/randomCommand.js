export { Command }
import { client, sendMessage } from '../bot.js'

function Command(args, message, channelSettings) {
    let categories = [];
    if (channelSettings["truth pg"] || channelSettings["truth pg13"] || channelSettings["truth r"]) {
        categories.push("truth");
    }
    if ((channelSettings["dare pg"] || channelSettings["dare pg13"] || channelSettings["dare r"]) && (channelSettings["dare d"] || channelSettings["dare irl"])) {
        categories.push("dare");
    }
    if (channelSettings["wyr pg"] || channelSettings["wyr pg13"] || channelSettings["wyr r"]) {
        categories.push("wyr");
    }
    if (channelSettings["nhie pg"] || channelSettings["nhie pg13"] || channelSettings["nhie r"]) {
        categories.push("nhie");
    }

    if (categories.length === 0) {
        sendMessage(message.channel, "All question commands are disabled here")
        return
    }

    let command = Math.floor(Math.random() * categories.length)
    client.commands.get(command)(args, message, channelSettings)
}