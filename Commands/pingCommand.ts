export { Command, SlashCommand, Meta };
    import { CommandInteraction, Message } from 'discord.js';
import { client } from '../bot.js';
function Command(args: string[], message: Message) {
    message.channel.send("Ping: " + client.ws.ping + "ms");
}
function SlashCommand(interaction: CommandInteraction) {
    return interaction.editReply("Ping " + client.ws.ping + "ms");
}
const Meta = {
    name: 'ping',
    description: "Displays the average ping between the bot and Discord's webservers"
}
