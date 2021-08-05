export { Command, SlashCommand, Meta, Aliases };
    import { CommandInteraction, Message } from 'discord.js';
import { sendMessage, handler } from '../bot.js';

const Aliases = ["c"]

function Command(args: string[], message: Message) {
    handler.deleteParanoiaData(message.author.id).then(() => {
        sendMessage(message.channel, "Paranoia question queue cleared");
    });
}

function SlashCommand(interaction: CommandInteraction) {
    handler.deleteParanoiaData(interaction.user.id).then(() => {
        interaction.reply("Paranoia question queue cleared")
    })
}

const Meta = {
    name: 'clear',
    description: "Used to clear a user's queue of paranoia questions"
}
