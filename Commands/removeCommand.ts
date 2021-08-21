import { CommandInteraction } from "discord.js";
import { ChannelSettings, handler } from "../bot";
import { questions } from "../mongodbHandler";
import { Question } from "./addCommand";

import { dareCategory, dareQuestionList, defaultDareQuestionList } from './dareCommand'
import { nhieCategory, nhieQuestionList, defaultNhieQuestionList } from "./nhieCommand";
import { paranoiaCategory, paranoiaQuestionList, defaultParanoiaQuestionList } from "./paranoiaCommand";
import { truthCategory, truthQuestionList, defaultTruthQuestionList } from "./truthCommand";
import { wyrCategory, wyrQuestionList, defaultWyrQuestionList } from "./wyrCommand";

type overrides = string[]

export { SlashCommand, Meta }

async function SlashCommand(interaction: CommandInteraction, channelSettings: ChannelSettings, premium: boolean) {
    let { guild, options } = interaction

    if (!premium) {
        interaction.editReply("This command is only available for servers with the premium version of the bot")
        return
    }

    let subcommand = options.getSubcommand()

    let id = <string>options.get('id')!.value

    function removeCustomQuestion<T extends Record<string, Question[]>>(customQuestions: T, id: string, commandName: string, command: string) {
        let removed = null
        for (let category in customQuestions) {
            if (customQuestions[<keyof T>category].some(q => q.id === id)) {
                removed = customQuestions[<keyof T>category].find(q => q.id === id)
                customQuestions[<keyof T>category] = <T[keyof T]>customQuestions[<keyof T>category].filter(q => q.id !== id)
                break
            }
        }
        
        if (removed) {
            handler.setCustomQuestions(command, guild!.id, <questions><unknown>customQuestions)
            interaction.editReply(`Question ${removed.id}: ${removed.text} has been removed from the list of ${commandName} questions`)
        } else {
            interaction.editReply(`No question was found with ID ${id}`)
        }
    }

    function getNewOverrides<T extends Record<string, Question[]>>(questions: T, overrides: overrides, id: string): string | overrides {
        for (let category in questions) {
            if (questions[<keyof T>category].some(q => q.id === id)) {
                if (overrides.some(o => o === id)) {
                    return "Override already exists"
                } else {
                    return [...overrides, id]
                }
            }
        }
        return `There is no question with ID ${id}`
    }

    async function override(command: string) {
        let questions = await handler.getQuestions(command)
        let overrides = await handler.getOverrides(command, guild!.id)
        if (!Array.isArray(overrides)) {
            overrides = []
        }

        let result = getNewOverrides(questions, overrides, id)
        if (typeof result === "string") {
            interaction.editReply(result)
        } else {
            await handler.setOverrides(command, guild!.id, result)
            interaction.editReply(`Override added for question with ID: ${id}`)
        }
    }

    if (id.length === 8) {
        if (subcommand === "truth") {
            let customQuestions = <truthQuestionList>await handler.getCustomQuestions("truth", guild!.id)

            if (!customQuestions || Object.keys(customQuestions).length === 0) {
                customQuestions = defaultTruthQuestionList()
            }
            
            removeCustomQuestion(customQuestions, id, "truth", "truth")
        } else if (subcommand === "dare") {
            let customQuestions = <dareQuestionList>await handler.getCustomQuestions("dare", guild!.id)

            if (!customQuestions || Object.keys(customQuestions).length === 0) {
                customQuestions = defaultDareQuestionList()
            }

            removeCustomQuestion(customQuestions, id, "dare", "dare")
        } else if (subcommand === "wyr") {
            let customQuestions = <wyrQuestionList>await handler.getCustomQuestions("wyr", guild!.id)

            if (!customQuestions || Object.keys(customQuestions).length === 0) {
                customQuestions = defaultWyrQuestionList()
            }

            removeCustomQuestion(customQuestions, id, "Would You Rather", "wyr")
        } else if (subcommand === "nhie") {
            let customQuestions = <nhieQuestionList>await handler.getCustomQuestions("nhie", guild!.id)

            if (!customQuestions || Object.keys(customQuestions).length === 0) {
                customQuestions = defaultNhieQuestionList()
            }

            removeCustomQuestion(customQuestions, id, "Never Have I Ever", "nhie")
        } else if (subcommand === "paranoia") {
            let customQuestions = <paranoiaQuestionList>await handler.getCustomQuestions("paranoia", guild!.id)

            if (!customQuestions || Object.keys(customQuestions).length === 0) {
                customQuestions = defaultParanoiaQuestionList()
            }

            removeCustomQuestion(customQuestions, id, "paranoia", "paranoia")
        } else {
            interaction.editReply("Command not recognized")
        }
    } else if (id.length === 5) {
        if (subcommand === "truth" && id[0] === "T") {
            override("truth")
        } else if (subcommand === "dare" && id[0] === "D") {
            override("dare")
        } else if (subcommand === "wyr" && id[0] === "W") {
            override("wyr")
        } else if (subcommand === "nhie" && id[0] === "N") {
            override("nhie")
        } else if (subcommand === "paranoia" && id[0] === "P") {
            override("paranoia")
        }
    } else {
        interaction.editReply("Invalid ID")
    }
}

const Meta = {
    name: "remove",
    description: "Used to remove questions for the bot from your server",
    defaultPermission: false,
    options: [
        {
            name: "truth",
            description: "Remove a question from the truth command",
            type: "SUB_COMMAND",
            options: [
                {
                    name: "id",
                    description: "The id of the question to remove (find IDs using the list command)",
                    type: "STRING",
                    required: true
                }
            ]
        },
        {
            name: "dare",
            description: "Remove a question from the dare command",
            type: "SUB_COMMAND",
            options: [
                {
                    name: "id",
                    description: "The id of the question to remove (find IDs using the list command)",
                    type: "STRING",
                    required: true
                }
            ]
        },
        {
            name: "wyr",
            description: "Remove a question from the wyr command",
            type: "SUB_COMMAND",
            options: [
                {
                    name: "id",
                    description: "The id of the question to remove (find IDs using the list command)",
                    type: "STRING",
                    required: true
                }
            ]
        },
        {
            name: "nhie",
            description: "Remove a question from the nhie command",
            type: "SUB_COMMAND",
            options: [
                {
                    name: "id",
                    description: "The id of the question to remove (find IDs using the list command)",
                    type: "STRING",
                    required: true
                }
            ]
        },
        {
            name: "paranoia",
            description: "Remove a question from the paranoia command",
            type: "SUB_COMMAND",
            options: [
                {
                    name: "id",
                    description: "The id of the question to remove (find IDs using the list command)",
                    type: "STRING",
                    required: true
                }
            ]
        }
    ]
}