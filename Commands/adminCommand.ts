export { SlashCommand, Meta }
import { ChannelSettings, client, commandIDs } from '../bot.js'
import { CommandInteraction } from 'discord.js'

type T = "disable" | "enable" | "mute" | "unmute" | "showparanoia" | "add" | "remove"

async function SlashCommand(interaction: CommandInteraction, channelSettings: ChannelSettings, premium: boolean) {
    let { guild, user, options } = interaction
    let member = await guild!.members.fetch(user.id)
    let roles = await Promise.all(member.roles.cache.map(role => guild!.roles.fetch(role.id)))
    let admin = member.permissions.has("ADMINISTRATOR")
        || roles.some(role => role?.permissions.has("ADMINISTRATOR"))

    if (!admin) {
        interaction.editReply("This command can only be used by those with admin permissions in this server")
        return
    }

    let role = options.get('role')!.role
    let command = options.get('command')!.value

    if (command === "enable/disable") {
        await client.application!.commands.permissions.add({
            command: commandIDs["enable"],
            permissions: [
                {
                    id: role!.id,
                    type: "ROLE",
                    permission: options.getSubcommand() === "set"
                }
            ],
            guild: guild!
        })
        await client.application!.commands.permissions.add({
            command: commandIDs["disable"],
            permissions: [
                {
                    id: role!.id,
                    type: "ROLE",
                    permission: options.getSubcommand() === "set"
                }
            ],
            guild: guild!
        })
        interaction.editReply(options.getSubcommand() === "set" ? "Role set as an admin role" : "Role removed as an admin role")
    } else if (command === "mute/unmute") {
        await client.application!.commands.permissions.add({
            command: commandIDs["mute"],
            permissions: [
                {
                    id: role!.id,
                    type: "ROLE",
                    permission: options.getSubcommand() === "set"
                }
            ],
            guild: guild!
        })
        await client.application!.commands.permissions.add({
            command: commandIDs["unmute"],
            permissions: [
                {
                    id: role!.id,
                    type: "ROLE",
                    permission: options.getSubcommand() === "set"
                }
            ],
            guild: guild!
        })
        interaction.editReply(options.getSubcommand() === "set" ? "Role set as an admin role" : "Role removed as an admin role")
    } else if (command === "showparanoia") {
        await client.application!.commands.permissions.add({
            command: commandIDs["showparanoia"],
            permissions: [
                {
                    id: role!.id,
                    type: "ROLE",
                    permission: options.getSubcommand() === "set"
                }
            ],
            guild: guild!
        })
        interaction.editReply(options.getSubcommand() === "set" ? "Role set as an admin role" : "Role removed as an admin role")
    } else if (command === "add/remove/readd") {
        if (!premium) {
            interaction.editReply("These commands are only available for servers with the premium version of the bot")
            return
        }

        await client.application!.commands.permissions.add({
            command: commandIDs["add"],
            permissions: [
                {
                    id: role!.id,
                    type: "ROLE",
                    permission: options.getSubcommand() === "set"
                }
            ],
            guild: guild!
        })
        await client.application!.commands.permissions.add({
            command: commandIDs["remove"],
            permissions: [
                {
                    id: role!.id,
                    type: "ROLE",
                    permission: options.getSubcommand() === "set"
                }
            ],
            guild: guild!
        })
        await client.application!.commands.permissions.add({
            command: commandIDs["readd"],
            permissions: [
                {
                    id: role!.id,
                    type: "ROLE",
                    permission: options.getSubcommand() === "set"
                }
            ],
            guild: guild!
        })
        interaction.editReply(options.getSubcommand() === "set" ? "Role set as an admin role" : "Role removed as an admin role")
    } else if (command === "cooldown") {
        await client.application!.commands.permissions.add({
            command: commandIDs["cooldown"],
            permissions: [
                {
                    id: role!.id,
                    type: "ROLE",
                    permission: options.getSubcommand() === "set"
                }
            ],
            guild: guild!
        })
        interaction.editReply(options.getSubcommand() === "set" ? "Role set as an admin role" : "Role removed as an admin role")
    }
}

const Meta = {
    name: 'admin',
    description: "Used to set or remove a role as an admin role (can use commands like enable and disable)",
    options: [
        {
            name: 'set',
            description: "Set a role as an admin role",
            type: "SUB_COMMAND",
            options: [
                {
                    name: 'role',
                    description: "The role to mark as an admin",
                    type: 'ROLE',
                    required: true
                },
                {
                    name: 'command',
                    description: "The command(s) to add admin permissions for",
                    type: "STRING",
                    choices: [
                        { name: "enable/disable", value: "enable/disable" },
                        { name: "mute/unmute", value: "mute/unmute" },
                        { name: "showparanoia", value: "showparanoia" },
                        { name: "add/remove/readd", value: "add/remove/readd" },
                        { name: "cooldown", value: "cooldown" }
                    ],
                    required: true
                }
            ]
        },
        {
            name: 'remove',
            description: "Remove admin permissions from a role",
            type: "SUB_COMMAND",
            options: [
                {
                    name: 'role',
                    description: "The role to mark as an admin",
                    type: 'ROLE',
                    required: true
                },
                {
                    name: 'command',
                    description: "The command(s) to remove admin permissions for",
                    type: "STRING",
                    choices: [
                        { name: "enable/disable", value: "enable/disable" },
                        { name: "mute/unmute", value: "mute/unmute" },
                        { name: "showparanoia", value: "showparanoia" },
                        { name: "add/remove/readd", value: "add/remove/readd" },
                        { name: "cooldown", value: "cooldown" }
                    ],
                    required: true
                }
            ]
        }
    ]
}