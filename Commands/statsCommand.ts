
export { Command, SlashCommand, Meta, Aliases };
    import { CommandInteraction, Message } from 'discord.js';
import { client, Discord, sendMessage, handler, topggAPI } from '../bot.js';

const Aliases = ["s"]

async function Command(args: string[], message: Message) {
    let serverCount = await handler.getServerCount();
    let upvoteCount = (await topggAPI.getBot("692045914436796436")).monthlyPoints
    let statistics = await handler.getStatistics()
    let serverDifference = statistics.serversJoined - statistics.serversLeft;
    let statsEmbed = new Discord.MessageEmbed()
        .setColor("#e91e62")
        .setTitle("Truth or Dare Stats")
        .addFields({ name: "__Total Server Count__", value: serverCount.toString() }, { name: "__Top.gg Upvotes This Month__", value: upvoteCount.toString() }, { name: "__Servers Joined__", value: statistics.serversJoined.toString() }, { name: "__Servers Left__", value: statistics.serversLeft.toString() }, { name: "__Net Server Gain__", value: (serverDifference > 0) ? ("+" + serverDifference) : serverDifference.toString() }, { name: "__Commands Sent__", value: `Truth: ${statistics.truth}\nDare: ${statistics.dare}\nWould You Rather: ${statistics.wyr}\nNever Have I Ever: ${statistics.nhie}\nParanoia: ${statistics.paranoia}` }, { name: "__Number of Questions__", value: `Truth: ${client.numberTruths}\nDare: ${client.numberDares}\nWould You Rather: ${client.numberWyr}\nNever Have I Ever: ${client.numberNhie}\nParanoia: ${client.numberParanoias}` })
        .setTimestamp()
        .setFooter("All counts except total server count and top.gg upvotes are for the past hour.");
    sendMessage(message.channel, statsEmbed);
}
async function SlashCommand(interaction: CommandInteraction) {
    let serverCount = await handler.getServerCount();
    let upvoteCount = (await topggAPI.getBot("692045914436796436")).monthlyPoints
    let statistics = await handler.getStatistics()
    let serverDifference = statistics.serversJoined - statistics.serversLeft;
    console.log(serverCount)
    console.log(serverDifference)
    let statsEmbed = new Discord.MessageEmbed()
        .setColor("#e91e62")
        .setTitle("Truth or Dare Stats")
        .addFields( { name: "__Total Server Count__", value: serverCount.toString() }, { name: "__Top.gg Upvotes This Month__", value: upvoteCount.toString() }, { name: "__Servers Joined__", value: statistics.serversJoined.toString() }, { name: "__Servers Left__", value: statistics.serversLeft.toString() }, { name: "__Net Server Gain__", value: (serverDifference > 0) ? ("+" + serverDifference) : serverDifference.toString() }, { name: "__Commands Sent__", value: `Truth: ${statistics.truth}\nDare: ${statistics.dare}\nWould You Rather: ${statistics.wyr}\nNever Have I Ever: ${statistics.nhie}\nParanoia: ${statistics.paranoia}` }, { name: "__Number of Questions__", value: `Truth: ${client.numberTruths}\nDare: ${client.numberDares}\nWould You Rather: ${client.numberWyr}\nNever Have I Ever: ${client.numberNhie}\nParanoia: ${client.numberParanoias}` })
        .setTimestamp()
        .setFooter("All counts except total server count and top.gg upvotes are for the past hour.");
    return interaction.editReply({
        embeds: [statsEmbed]
    })
}
const Meta = {
    name: 'stats',
    description: 'Lists various measures and statistics about the bot and its performance'
}
