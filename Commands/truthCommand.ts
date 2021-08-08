export { Command, SlashCommand, Meta, Aliases };
import { CommandInteraction, Message } from 'discord.js';
import { ChannelSettings, ChannelSetting, handler, sendMessage } from '../bot.js';
import { Question } from './addCommand.js';

export type truthCategory = "pg" | "pg13" | "r"
export type truthQuestionList = Record<truthCategory, Question[]>

let truthQuestions: truthQuestionList = {
    "pg": [],
    "pg13": [],
    "r": []
};

(async function() {
    truthQuestions = <truthQuestionList>await handler.getQuestions('truth')
})()

const Aliases = ["t"]

var questionLog: Record<string, number[]> = {};

function Command(args: string[], message: Message, channelSettings: ChannelSettings, prefix: string) {
    var index: number | null = null;
    var { guild } = message;
    if (!channelSettings) return
    if (args.length > 1) {
        sendMessage(message.channel, "You can only specify one rating (pg, pg13, or r).");
    }
    else if (args.length === 0) {
        let categories: truthCategory[] = [];
        if (channelSettings["truth pg"]) {
            categories.push("pg");
        }
        if (channelSettings["truth pg13"]) {
            categories.push("pg13");
        }
        if (channelSettings["truth r"]) {
            categories.push("r");
        }
        if (categories.length === 0) {
            sendMessage(message.channel, `Truth questions are disabled here. To enable them, use \`${prefix}enable truth\``);
        }
        else {
            let rating = categories[Math.floor(Math.random() * categories.length)];
            do {
                index = Math.floor(Math.random() * truthQuestions[rating].length);
            } while (guild && questionLog[guild.id].includes(index));
            sendMessage(message.channel, truthQuestions[rating][index].text);
        }
    }
    else {
        if (!["pg", "pg13", "r"].includes(args[0])) {
            sendMessage(message.channel, args[0] + " is not a valid rating. Valid truth ratings are pg, pg13, and r.");
        }
        else {
            let category = <truthCategory>args[0]
            if (channelSettings[<ChannelSetting>("truth " + category)]) {
                do {
                    index = Math.floor(Math.random() * truthQuestions[category].length);
                } while (guild && questionLog[guild.id]?.includes(index));
                sendMessage(message.channel, truthQuestions[category][index].text);
            }
            else {
                sendMessage(message.channel, `That rating is disabled here. To enable it, use \`${prefix}enable truth ${category}\``);
            }
        }
    }

    if (guild) {
        if (!(guild.id in questionLog)) {
            questionLog[guild.id] = [];
        }
        if (questionLog[guild.id]?.length > 50) {
            questionLog[guild.id].shift();
        }
        if (index !== null) {
            questionLog[guild.id].push(index);
        }
    }
}

function SlashCommand(interaction: CommandInteraction, channelSettings: ChannelSettings) {
    var index: number | null = null
    var { guild, options } = interaction

    var rating: truthCategory
    if (options.data.some(o => o.name === 'rating')) {
        if (!channelSettings[<ChannelSetting>("truth " + options.get('rating')!.value)]) {
            interaction.editReply("That rating is disabled here")
            return
        } else {
            rating = <truthCategory>options.get('rating')!.value
        }
    } else {
        let ratings: truthCategory[] = [];
        if (channelSettings["truth pg"]) {
            ratings.push("pg");
        }
        if (channelSettings["truth pg13"]) {
            ratings.push("pg13");
        }
        if (channelSettings["truth r"]) {
            ratings.push("r");
        }

        if (ratings.length === 0) {
            interaction.editReply("All truth ratings are disabled here")
            return
        } else {
            rating = ratings[Math.floor(Math.random() * ratings.length)]
        }
    }

    do {
        index = Math.floor(Math.random() * truthQuestions[rating].length);
    } while (guild && questionLog[guild.id]?.includes(index));
    interaction.editReply(truthQuestions[rating][index].text)

    if (guild) {
        if (!(guild.id in questionLog)) {
            questionLog[guild.id] = [];
        }
        if (questionLog[guild.id]?.length > 50) {
            questionLog[guild.id].shift();
        }
        if (index !== null) {
            questionLog[guild.id].push(index);
        }
    }
}

const Meta = {
    name: 'truth',
    description: "Gives a random question that has to be answered truthfully",
    options: [
        {
            name: 'rating',
            description: "The maturity level of the topics the question can relate to",
            type: "STRING",
            required: false,
            choices: [
                { name: "pg", value: "pg" },
                { name: "pg13", value: "pg13" },
                { name: "r", value: "r" }
            ]
        }
    ]
}

export function defaultTruthQuestionList() {
    return {
        pg: [],
        pg13: [],
        r: []
    }
}