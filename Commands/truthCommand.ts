export { Command, SlashCommand, Meta, Aliases };
import { CommandInteraction, Message, TextBasedChannels } from 'discord.js';
import { ChannelSettings, ChannelSetting, handler, sendMessage, Question, Discord } from '../bot.js';

type truthCategory = "pg" | "pg13" | "r"
export type truthQuestions = Record<truthCategory, Question[]>

let truthQuestions: truthQuestions = {
    "pg": [],
    "pg13": [],
    "r": []
};

(async function() {
    await new Promise((res) => {
        setTimeout(res, 5000)
    })
    truthQuestions = <truthQuestions>await handler.getQuestions('truth')
})()

const Aliases = ["t"]

var questionLog: Record<string, string[]> = {};

function Command(args: string[], message: Message, channelSettings: ChannelSettings, prefix: string) {
    var index: number | null = null;
    var sentQuestionID: string | null = null
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
            } while (guild && questionLog[guild.id]?.includes(truthQuestions[rating][index].id));
            sendQuestion(message.channel, truthQuestions[rating][index]);
            sentQuestionID = truthQuestions[rating][index].id
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
                } while (guild && questionLog[guild.id]?.includes(truthQuestions[category][index].id));
                sendQuestion(message.channel, truthQuestions[category][index]);
                sentQuestionID = truthQuestions[category][index].id
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

function SlashCommand(interaction: CommandInteraction, channelSettings: ChannelSettings) {
    var index: number | null = null
    var sentQuestionID: string | null = null
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
    } while (guild && questionLog[guild.id]?.includes(truthQuestions[rating][index].id));
    sendQuestionSlash(interaction, truthQuestions[rating][index])
    sentQuestionID = truthQuestions[rating][index].id

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

function sendQuestion(channel: TextBasedChannels, question: Question) {
    let questionEmbed = new Discord.MessageEmbed()
        .setTitle(question.text)
        .setFooter(question.id)
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