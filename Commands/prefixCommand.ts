export { Command };
    import { Message } from 'discord.js';
import { sendMessage, handler, ChannelSettings } from '../bot.js';
async function Command(args: string[], message: Message, channelSettings: ChannelSettings, premium: boolean, prefix: string) {
    let { guild } = message
    let member = await guild!.members.fetch(message.author.id)
    let roles = await Promise.all(member.roles.cache.map(role => guild!.roles.fetch(role.id)))
    let admin = member.permissions.has("ADMINISTRATOR")
        || roles.some(role => role?.permissions.has("ADMINISTRATOR"))
    if (!admin) {
        sendMessage(message.channel, "You must be an administrator to use this command.");
    }
    else if (args.length === 0) {
        sendMessage(message.channel, "Your current prefix is " + prefix);
    }
    else if (args.length === 1) {
        handler.setPrefix(guild!.id, args[0]);
        sendMessage(message.channel, `Prefix set to ${args[0]} followed by no space. To put a space between your prefix and the command, use ${args[0]}prefix [new prefix] s`);
    }
    else if (args.length === 2) {
        if (args[1] === "s") {
            handler.setPrefix(guild!.id, args[0] + " ");
            sendMessage(message.channel, `Prefix set to ${args[0]} followed by a space.`);
        }
        else {
            sendMessage(message.channel, "Your new prefix cannot contain any spaces");
        }
    }
    else {
        sendMessage(message.channel, "Your new prefix cannot contain any spaces");
    }
}
