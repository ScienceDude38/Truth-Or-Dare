import { CommandInteraction } from "discord.js";
import { handler, Discord } from "../bot";
import { Question } from "./addCommand";
import { dareCategory, dareQuestionList, defaultDareQuestionList } from './dareCommand'
import { nhieCategory, nhieQuestionList, defaultNhieQuestionList } from "./nhieCommand";
import { paranoiaCategory, paranoiaQuestionList, defaultParanoiaQuestionList } from "./paranoiaCommand";
import { truthCategory, truthQuestionList, defaultTruthQuestionList } from "./truthCommand";
import { wyrCategory, wyrQuestionList, defaultWyrQuestionList } from "./wyrCommand";

type questions = dareQuestionList | nhieQuestionList | paranoiaQuestionList | truthQuestionList | wyrQuestionList

export { SlashCommand, Meta }

async function SlashCommand(interaction: CommandInteraction) {
    let { options, guild } = interaction

    let subcommand = options.getSubcommand()

    let rating = options.get('rating')?.value
    let type = options.get('type')?.value
    let page = <number>options.get('page')?.value || 0

    function sendPage<T extends Record<string, Question[]>>(customQuestions: T, index: keyof T, typeLabel: string) {
        let questionArray = customQuestions[index]
        let pages = getPages(questionArray)
        if (page >= pages.length || page < 0) {
            page = 0
        }
        
        if (pages.length === 0) {
            let listEmbed = new Discord.MessageEmbed()
                .setTitle(`${typeLabel} Questions`)
                .setColor('#e73c3b')
                .addField("Empty List", `There are no custom ${typeLabel} questions for this server`)
                .setTimestamp()

            interaction.editReply({
                embeds: [listEmbed]
            })
        } else {
            let listEmbed = new Discord.MessageEmbed()
                .setTitle(`${typeLabel} Questions`)
                .setDescription(`Page ${page + 1} of ${pages.length}`)
                .setColor('#e73c3b')
                .addFields(pages[page].map(x => {return { name: x.text, value: x.id }}))
                .setTimestamp()
                .setFooter(`Page ${page + 1} of ${pages.length}`)
        
            interaction.editReply({
                embeds: [listEmbed]
            })
        }
    }

    function sendSummary<T extends Record<string, Question[]>>(customQuestions: T, typeLabel: string) {
        let listEmbed = new Discord.MessageEmbed()
            .setTitle(`${typeLabel} Questions`)
            .setColor("#e73c3b")
            .setTimestamp()
        
        for (let category in customQuestions) {
            listEmbed.addField(category.replace("_", " "), customQuestions[<keyof T>category].length + " questions")
        }

        interaction.editReply({
            embeds: [listEmbed]
        })
    } 

    if (subcommand === "dare") {
        let customQuestions = <dareQuestionList>await handler.getCustomQuestions("dare", guild!.id)

        if (!customQuestions || Object.keys(customQuestions).length === 0) {
            customQuestions = defaultDareQuestionList()
        }

        if (rating && type) {
            sendPage(customQuestions, <dareCategory>(rating + "_" + type),`Dare ${rating} ${type}`)
        } else {
            sendSummary(customQuestions, "Dare")
        }
    } else if (subcommand === "truth") {
        let customQuestions = <truthQuestionList>await handler.getCustomQuestions("truth", guild!.id)

        if (!customQuestions || Object.keys(customQuestions).length === 0) {
            customQuestions = defaultTruthQuestionList()
        }

        if (rating) {
            sendPage(customQuestions, <truthCategory>rating, `Truth ${rating}`)
        } else {
            sendSummary(customQuestions, "Truth")
        }
    } else if (subcommand === "wyr") {
        let customQuestions = <wyrQuestionList>await handler.getCustomQuestions("wyr", guild!.id)

        if (!customQuestions || Object.keys(customQuestions).length === 0) {
            customQuestions = defaultWyrQuestionList()
        }

        if (rating) {
            sendPage(customQuestions, <wyrCategory>rating, `Would You Rather ${rating}`)
        } else {
            sendSummary(customQuestions, "Would You Rather")
        }
    } else if (subcommand === "nhie") {
        let customQuestions = <nhieQuestionList>await handler.getCustomQuestions("nhie", guild!.id)

        if (!customQuestions || Object.keys(customQuestions).length === 0) {
            customQuestions = defaultNhieQuestionList()
        }

        if (rating) {
            sendPage(customQuestions, <nhieCategory>rating, `Never Have I Ever ${rating}`)
        } else {
            sendSummary(customQuestions, "Never Have I Ever")
        }
    } else if (subcommand === "paranoia") {
        let customQuestions = <paranoiaQuestionList>await handler.getCustomQuestions("paranoia", guild!.id)

        if (!customQuestions || Object.keys(customQuestions).length === 0) {
            customQuestions = defaultParanoiaQuestionList()
        }

        if (rating) {
            sendPage(customQuestions, <paranoiaCategory>rating, `Paranoia ${rating}`)
        } else {
            sendSummary(customQuestions, "Paranoia")
        }
    } else {
        interaction.editReply("Command not recognized")
    }
}

const Meta = {
    name: "list",
    description: "Lists the custom questions for a command",
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
                    required: false,
                    choices: [
                        { name: "pg", value: "pg" },
                        { name: "pg13", value: "pg13" },
                        { name: "r", value: "r" }
                    ]
                },
                {
                    name: "page",
                    description: "The page number of questions to display",
                    type: "INTEGER",
                    required: false
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
                    required: false,
                    choices: [
                        { name: "pg", value: "pg" },
                        { name: "pg13", value: "pg13" },
                        { name: "r", value: "r" }
                    ]
                },
                {
                    name: "type",
                    description: "The type of the question to be added",
                    type: "STRING",
                    required: false,
                    choices: [
                        { name: "d", value: "d" },
                        { name: "irl", value: "irl" }
                    ]
                },
                {
                    name: "page",
                    description: "The page number of questions to display",
                    type: "INTEGER",
                    required: false
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
                    required: false,
                    choices: [
                        { name: "pg", value: "pg" },
                        { name: "pg13", value: "pg13" },
                        { name: "r", value: "r" }
                    ]
                },
                {
                    name: "page",
                    description: "The page number of questions to display",
                    type: "INTEGER",
                    required: false
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
                    required: false,
                    choices: [
                        { name: "pg", value: "pg" },
                        { name: "pg13", value: "pg13" },
                        { name: "r", value: "r" }
                    ]
                },
                {
                    name: "page",
                    description: "The page number of questions to display",
                    type: "INTEGER",
                    required: false
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
                    required: false,
                    choices: [
                        { name: "pg", value: "pg" },
                        { name: "pg13", value: "pg13" },
                        { name: "r", value: "r" }
                    ]
                },
                {
                    name: "page",
                    description: "The page number of questions to display",
                    type: "INTEGER",
                    required: false
                }
            ]
        }
    ]
}

function getPages(questions: Question[]) {
    let pages = []
    for (let i = 0; i < questions.length; i += 20) {
        pages.push(questions.slice(i, Math.min(i + 20, questions.length)))
    }
    return pages
}

