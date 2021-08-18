export { Command, SlashCommand, Meta, Aliases };
import { CommandInteraction, Message, TextBasedChannels } from 'discord.js';
import { ChannelSettings, ChannelSetting, handler, sendMessage, Discord } from '../bot.js';
import { Question } from './addCommand.js';

export type truthCategory = "pg" | "pg13" | "r"
export type truthQuestionList = Record<truthCategory, Question[]>

let truthQuestions: truthQuestionList = {
    "pg": [],
    "pg13": [],
    "r": []
};

(async function() {
    await new Promise((res) => {
        setTimeout(res, 5000)
    })
    truthQuestions = <truthQuestionList>await handler.getQuestions('truth')
})()

const Aliases = ["t"]

var questionLog: Record<string, string[]> = {};

async function Command(args: string[], message: Message, channelSettings: ChannelSettings, prefix: string) {
    var index: number | null = null;
    var sentQuestionID: string | null = null
    var { guild } = message;

    let customQuestions: truthQuestionList = guild ? <truthQuestionList>await handler.getCustomQuestions("truth", guild!.id) : defaultTruthQuestionList()
    if (!customQuestions || Object.keys(customQuestions).length === 0) {
        customQuestions = defaultTruthQuestionList()
    }
    let overrides = guild ? await handler.getOverrides("truth", guild!.id) : []
    if (!Array.isArray(overrides)) {
        overrides = []
    }
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
            let questions = [...truthQuestions[rating].filter(x => !overrides.includes(x.id)), ...customQuestions[rating]]
            do {
                index = Math.floor(Math.random() * questions.length);
            } while (guild && questionLog[guild.id]?.includes(questions[index].id));
            sendQuestion(message.channel, questions[index]);
            sentQuestionID = questions[index].id
        }
    }
    else {
        if (!["pg", "pg13", "r"].includes(args[0])) {
            sendMessage(message.channel, args[0] + " is not a valid rating. Valid truth ratings are pg, pg13, and r.");
        }
        else {
            let category = <truthCategory>args[0]
            if (channelSettings[<ChannelSetting>("truth " + category)]) {
                let questions = [...truthQuestions[category].filter(x => !overrides.includes(x.id)), ...customQuestions[category]]
                do {
                    index = Math.floor(Math.random() * questions.length);
                } while (guild && questionLog[guild.id]?.includes(questions[index].id));
                sendQuestion(message.channel, questions[index]);
                sentQuestionID = questions[index].id
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
        if (sentQuestionID !== null) {
            questionLog[guild.id].push(sentQuestionID);
        }
    }
}

async function SlashCommand(interaction: CommandInteraction, channelSettings: ChannelSettings) {
    var index: number | null = null
    var sentQuestionID: string | null = null
    var { guild, options } = interaction

    let customQuestions: truthQuestionList = guild ? <truthQuestionList>await handler.getCustomQuestions("truth", guild!.id) : defaultTruthQuestionList()
    if (!customQuestions || Object.keys(customQuestions).length === 0) {
        customQuestions = defaultTruthQuestionList()
    }
    let overrides = guild ? await handler.getOverrides("truth", guild!.id) : []
    if (!Array.isArray(overrides)) {
        overrides = []
    }

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

    let questions = [...truthQuestions[rating].filter(x => !overrides.includes(x.id)), ...customQuestions[rating]]
    do {
        index = Math.floor(Math.random() * questions.length);
    } while (guild && questionLog[guild.id]?.includes(questions[index].id));
    sendQuestionSlash(interaction, questions[index])
    sentQuestionID = questions[index].id

    if (guild) {
        if (!(guild.id in questionLog)) {
            questionLog[guild.id] = [];
        }
        if (questionLog[guild.id]?.length > 50) {
            questionLog[guild.id].shift();
        }
        if (sentQuestionID !== null) {
            questionLog[guild.id].push(sentQuestionID);
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

function sendQuestion(channel: TextBasedChannels, question: Question) {
    let questionEmbed = new Discord.MessageEmbed()
        .addField(question.text, question.id)
    sendMessage(channel, questionEmbed)
}

function sendQuestionSlash(interaction: CommandInteraction, question: Question) {
    let questionEmbed = new Discord.MessageEmbed()
        .setTitle(question.text)
        .setFooter(question.id)
    interaction.editReply({
        embeds: [questionEmbed]
    })
}