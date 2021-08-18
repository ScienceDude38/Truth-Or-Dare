import { CommandInteraction } from "discord.js";
import { handler } from "../bot";

export { SlashCommand, Meta }

async function SlashCommand(interaction: CommandInteraction) {
    let { guild, options } = interaction

    let subcommand = options.getSubcommand()

    let id = <string>options.get('id')!.value

    if (subcommand === "truth") {
        readd(interaction, guild!.id, "truth", id)
    } else if (subcommand === "dare") {
        readd(interaction, guild!.id, "dare", id)
    } else if (subcommand === "wyr") {
        readd(interaction, guild!.id, "wyr", id)
    } else if (subcommand === "nhie") {
        readd(interaction, guild!.id, "nhie", id)
    } else if (subcommand === "paranoia") {
        readd(interaction, guild!.id, "paranoia", id)
    }
}

const Meta = {
    name: 'readd',
    description: "Used to remove overrides and re-add questions into the question pool",
    defaultPermission: false,
    options: [
        {
            name: "truth",
            description: "Re-add a question from the truth command",
            type: "SUB_COMMAND",
            options: [
                {
                    name: "id",
                    description: "The id of the question to re-add (find IDs using the overrides command)",
                    type: "STRING",
                    required: true
                }
            ]
        },
        {
            name: "dare",
            description: "Re-add a question from the dare command",
            type: "SUB_COMMAND",
            options: [
                {
                    name: "id",
                    description: "The id of the question to re-add (find IDs using the overrides command)",
                    type: "STRING",
                    required: true
                }
            ]
        },
        {
            name: "wyr",
            description: "Re-add a question from the wyr command",
            type: "SUB_COMMAND",
            options: [
                {
                    name: "id",
                    description: "The id of the question to re-add (find IDs using the overrides command)",
                    type: "STRING",
                    required: true
                }
            ]
        },
        {
            name: "nhie",
            description: "Re-add a question from the nhie command",
            type: "SUB_COMMAND",
            options: [
                {
                    name: "id",
                    description: "The id of the question to re-add (find IDs using the overrides command)",
                    type: "STRING",
                    required: true
                }
            ]
        },
        {
            name: "paranoia",
            description: "Re-add a question from the paranoia command",
            type: "SUB_COMMAND",
            options: [
                {
                    name: "id",
                    description: "The id of the question to re-add (find IDs using the overrides command)",
                    type: "STRING",
                    required: true
                }
            ]
        }
    ]
}

async function readd(interaction: CommandInteraction, guildID: string, command: string, id: string) {
    let overrides = await handler.getOverrides(command, guildID)
    if (!Array.isArray(overrides)) {
        overrides = []
    }

    if (overrides.some(x => x === id)) {
        overrides = overrides.filter(x => x !== id)
        await handler.setOverrides(command, guildID, overrides)
        interaction.editReply(`Override for question ${id} has been removed`)
    } else {
        interaction.editReply("There is no existing override with that ID")
    }
}