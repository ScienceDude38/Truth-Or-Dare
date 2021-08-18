import { CommandInteraction } from "discord.js";
import { Discord, handler } from "../bot";
import { questions } from "../mongodbHandler";
import { Question } from "./addCommand";

export { SlashCommand, Meta }

async function SlashCommand(interaction: CommandInteraction) {
    let { options, guild } = interaction

    let command = options.get('command')!.value

    let page = <number>options.get('page')?.value || 0

    async function sendPage(typeLabel: string, inlineTypeLabel: string, command: string) {
        let overrides = await handler.getOverrides(command, guild!.id)

        if (!overrides || Object.keys(overrides).length === 0) {
            overrides = []
        }

        let questions = await handler.getQuestions(command)
        let pages = getPages(overrides, questions)
        if (page >= pages.length || page < 0) {
            page = 0
        }

        if (pages.length === 0) {
            let overridesEmbed = new Discord.MessageEmbed()
                .setTitle(`${typeLabel} Overrides`)
                .setColor('#e73c3b')
                .addField("Empty List", `There are no ${inlineTypeLabel} overrides for this server`)
                .setTimestamp()
            
            interaction.editReply({
                embeds: [overridesEmbed]
            })
        } else {
            let listEmbed = new Discord.MessageEmbed()
                .setTitle(`${typeLabel} Overrides`)
                .setDescription(`Page ${page + 1} of ${pages.length}`)
                .setColor('#e73c3b')
                .addFields(pages[page].map(x => {return { name: x.id, value: x.text }}))
                .setTimestamp()
                .setFooter(`Page ${page + 1} of ${pages.length}`)
        
            interaction.editReply({
                embeds: [listEmbed]
            })
        }
    }

    if (command === "dare") {
        sendPage("Dare", "dare", "dare")
    } else if (command === "truth") {
        sendPage("Truth", "truth", "truth")
    } else if (command === "wyr") {
        sendPage("Would You Rather", "Would You Rather", "wyr")
    } else if (command === "nhie") {
        sendPage("Never Have I Ever", "Never Have I Ever", "nhie")
    } else if (command === "paranoia") {
        sendPage("Paranoia", "paranoia", "paranoia")
    }
}

const Meta = {
    name: "overrides",
    description: "Lists questions overrides for a specific command",
    options: [
        {
            name: "command", 
            description: "The command to list overrides for",
            type: "STRING",
            choices: [
                { name: "truth", value: "truth" },
                { name: "dare", value: "dare" },
                { name: "wyr", value: "wyr" },
                { name: "nhie", value: "nhie" },
                { name: "paranoia", value: "paranoia" }
            ],
            required: true
        },
        {
            name: "page",
            description: "The page number of overrides to display",
            type: "INTEGER",
            required: false
        }
    ]
}

function getPages(overrideArray: string[], questions: questions) {
    let pages = []
    for (let i = 0; i < overrideArray.length; i += 20) {
        let chunk = overrideArray.slice(i, Math.min(i + 20, overrideArray.length))
        pages.push(chunk.map(id => {
            let text
            for (let category in questions) {
                let temp = (<Question[]>questions[<keyof questions>category]).find(q => q.id === id)?.text
                if (temp) {
                    text = temp
                    break
                }
            }
            return {
                id,
                text
            }
        }).filter(x => {
            return x.text !== undefined
        }))
    }
    return <{id: string, text: string}[][]>pages
}