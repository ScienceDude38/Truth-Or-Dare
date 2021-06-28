export { Command }
import { client, sendMessage } from '../bot.js'

function Command(args, message, channelSettings) {
    let truthEnabled = channelSettings["truth pg"] || channelSettings["truth pg13"] || channelSettings["truth r"];
    let dareEnabled = (channelSettings["dare pg"] || channelSettings["dare pg13"] || channelSettings["dare r"]) && (channelSettings["dare irl"] || channelSettings["dare d"]);
    if (truthEnabled && dareEnabled) {
        (Math.random() < 0.5)
        ? client.commands.get('truth')(args, message, channelSettings)
        : client.commands.get('dare')(args, message, channelSettings);
    }
    else if (truthEnabled) {
        client.commands.get('truth')(args, message, channelSettings);
    }
    else if (dareEnabled) {
        client.commands.get('dare')(args, message, channelSettings);
    }
    else {
        sendMessage(message.channel, "Truths and dares are disabled here");
    }
}