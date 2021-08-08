import { CommandInteraction } from "discord.js";
import { handler } from "../bot";

import { dareCategory, dareQuestionList, defaultDareQuestionList } from './dareCommand'
import { nhieCategory, nhieQuestionList, defaultNhieQuestionList } from "./nhieCommand";
import { paranoiaCategory, paranoiaQuestionList, defaultParanoiaQuestionList } from "./paranoiaCommand";
import { truthCategory, truthQuestionList, defaultTruthQuestionList } from "./truthCommand";
import { wyrCategory, wyrQuestionList, defaultWyrQuestionList } from "./wyrCommand";

export { SlashCommand, Meta }

async function SlashCommand(interaction: CommandInteraction) {
    let { guild, options } = interaction

    let truth = options.get('truth')
    let dare = options.get('dare')
    let wyr = options.get('wyr')
    let nhie = options.get('nhie')
    let paranoia = options.get('paranoia')

    let subCommandOptions = truth?.options || dare?.options || wyr?.options || nhie?.options || paranoia?.options
    let rating = subCommandOptions!.find(x => x.name === "rating")!.value
    let type = subCommandOptions!.find(x => x.name === "type")?.value
    let question = <string>subCommandOptions!.find(x => x.name === "question")!.value

    if (question.length <  15) {
        interaction.editReply("Question must be at least 15 characters long")
    } else if (dare?.options && type) {
        let customQuestions = <dareQuestionList>await handler.getCustomQuestions("dare", guild!.id)

        if (!customQuestions) {
            customQuestions = defaultDareQuestionList()
        }

        customQuestions[<dareCategory>(rating + "_" + type)].push(new Question(question))

        handler.setCustomQuestions("dare", guild!.id, customQuestions)
        interaction.editReply(`Question added as a ${rating} ${type} dare`)
    } else if (truth?.options) {
        let customQuestions = <truthQuestionList>await handler.getCustomQuestions("truth", guild!.id)

        if (!customQuestions) {
            customQuestions = defaultTruthQuestionList()
        }

        customQuestions[<truthCategory>rating].push(new Question(question))

        handler.setCustomQuestions("truth", guild!.id, customQuestions)
        interaction.editReply(`Question added as a ${rating} truth`)
    } else if (wyr?.options) {
        let customQuestions = <wyrQuestionList>await handler.getCustomQuestions("wyr", guild!.id)

        if (!customQuestions) {
            customQuestions = defaultWyrQuestionList()
        }

        customQuestions[<wyrCategory>rating].push(new Question(question))

        handler.setCustomQuestions("wyr", guild!.id, customQuestions)
        interaction.editReply(`Question added as a ${rating} wyr`)
    } else if (nhie?.options) {
        let customQuestions = <nhieQuestionList>await handler.getCustomQuestions("nhie", guild!.id)

        if (!customQuestions) {
            customQuestions = defaultNhieQuestionList()
        }

        customQuestions[<nhieCategory>rating].push(new Question(question))

        handler.setCustomQuestions("nhie", guild!.id, customQuestions)
        interaction.editReply(`Question added as a ${rating} nhie`)
    } else if (paranoia?.options) {
        let customQuestions = <paranoiaQuestionList>await handler.getCustomQuestions("paranoia", guild!.id)

        if (!customQuestions) {
            customQuestions = defaultParanoiaQuestionList()
        }

        customQuestions[<paranoiaCategory>rating].push(new Question(question))

        handler.setCustomQuestions("paranoia", guild!.id, customQuestions)
        interaction.editReply(`Question set as ${rating} paranoia`)
    } else {
        interaction.reply("Command not recognized")
    }
}

const Meta = {
    name: "add",
    description: "Used to add custom questions for the bot to your server",
    defaultPermission: false,
    options: [
        {
            name: "truth",
            description: "Add a question to the truth command",
            type: "SUB_COMMAND",
            options: [
                {
                    name: "rating",
                    description: "The rating of the question to be added",
                    type: "STRING",
                    required: true,
                    choices: [
                        { name: "pg", value: "pg" },
                        { name: "pg13", value: "pg13" },
                        { name: "r", value: "r" }
                    ]
                },
                {
                    name: "question",
                    description: "The question to add",
                    type: "STRING",
                    required: true
                }
            ]
        },
        {
            name: "dare",
            description: "Add a question to the dare command",
            type: "SUB_COMMAND",
            options: [
                {
                    name: "rating",
                    description: "The rating of the question to be added",
                    type: "STRING",
                    required: true,
                    choices: [
                        { name: "pg", value: "pg" },
                        { name: "pg13", value: "pg13" },
                        { name: "r", value: "r" }
                    ]
                },
                {
                    name: "type",
                    description: "The type of the question to be added",
                    required: true,
                    choices: [
                        { name: "d", value: "d" },
                        { name: "irl", value: "irl" }
                    ]
                },
                {
                    name: "question",
                    description: "The question to add",
                    type: "STRING",
                    required: true
                }
            ]
        },
        {
            name: "wyr",
            description: "Add a question to the wyr command",
            type: "SUB_COMMAND",
            options: [
                {
                    name: "rating",
                    description: "The rating of the question to be added",
                    type: "STRING",
                    required: true,
                    choices: [
                        { name: "pg", value: "pg" },
                        { name: "pg13", value: "pg13" },
                        { name: "r", value: "r" }
                    ]
                },
                {
                    name: "question",
                    description: "The question to add",
                    type: "STRING",
                    required: true
                }
            ]
        },
        {
            name: "nhie",
            description: "Add a question to the nhie command",
            type: "SUB_COMMAND",
            options: [
                {
                    name: "rating",
                    description: "The rating of the question to be added",
                    type: "STRING",
                    required: true,
                    choices: [
                        { name: "pg", value: "pg" },
                        { name: "pg13", value: "pg13" },
                        { name: "r", value: "r" }
                    ]
                },
                {
                    name: "question",
                    description: "The question to add",
                    type: "STRING",
                    required: true
                }
            ]
        },
        {
            name: "paranoia",
            description: "Add a question to the paranoia command",
            type: "SUB_COMMAND",
            options: [
                {
                    name: "rating",
                    description: "The rating of the question to be added",
                    type: "STRING",
                    required: true,
                    choices: [
                        { name: "pg", value: "pg" },
                        { name: "pg13", value: "pg13" },
                        { name: "r", value: "r" }
                    ]
                },
                {
                    name: "question",
                    description: "The question to add",
                    type: "STRING",
                    required: true
                }
            ]
        }
    ]
}

export interface Question {
    id: string,
    text: string
}

export class Question {
    constructor(text: string) {
        this.id = interweave(Date.now().toString(36))
        this.text = text
    }
}

function interweave(str: string): string {
    let even = str.split("").filter((v, i) => i % 2 === 0 ? v : null).filter(x => x !== null)
    let odd = str.split("").filter((v, i) => i % 2 === 1 ? v : null).filter(x => x !== null)

    return even.join("") + odd.join("")
}