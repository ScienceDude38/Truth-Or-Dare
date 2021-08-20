export { Command, SlashCommand, Meta };
    import { CommandInteraction, Message, TextBasedChannels } from 'discord.js';
import { ChannelSettings, ChannelSetting, handler, sendMessage, Question, Discord } from '../bot.js';

type wyrCategory = "pg" | "pg13" | "r"
export type wyrQuestions = Record<wyrCategory, Question[]>

let wyrQuestions: wyrQuestions = {
    "pg": [],
    "pg13": [],
    "r": []
};

(async function() {
    await new Promise((res) => {
        setTimeout(res, 5000)
    })
    wyrQuestions = <wyrQuestions>await handler.getQuestions('wyr')
})()

var questionLog: Record<string, string[]> = {};

function Command(args: string[], message: Message, channelSettings: ChannelSettings, prefix: string) {
    var index: number | null = null;
    var sentQuestionID: string | null = null
    var { guild } = message;

    if (args.length > 1) {
        sendMessage(message.channel, "You can only specify one rating (pg, pg13, or r).");
    }
    else if (args.length === 0) {
        let categories: wyrCategory[] = [];
        if (channelSettings["wyr pg"]) {
            categories.push("pg");
        }
        if (channelSettings["wyr pg13"]) {
            categories.push("pg13");
        }
        if (channelSettings["wyr r"]) {
            categories.push("r");
        }
        if (categories.length === 0) {
            sendMessage(message.channel, `Would You Rather questions are disabled here. To enable them, use \`${prefix}enable wyr\``);
        }
        else {
            let rating = categories[Math.floor(Math.random() * categories.length)];
            do {
                index = Math.floor(Math.random() * wyrQuestions[rating].length);
            } while (guild && questionLog[guild.id]?.includes(wyrQuestions[rating][index].id));
            sendQuestion(message.channel, wyrQuestions[rating][index]);
            sentQuestionID = wyrQuestions[rating][index].id
        }
    }
    else {
        if (!["pg", "pg13", "r"].includes(args[0])) {
            sendMessage(message.channel, args[0] + " is not a valid rating. Valid Would You Rather ratings are pg, pg13, and r.");
        }
        else {
            let rating = <wyrCategory>args[0]
            if (channelSettings[<ChannelSetting>("wyr " + rating)]) {
                do {
                    index = Math.floor(Math.random() * wyrQuestions[rating].length);
                } while (guild && questionLog[guild.id]?.includes(wyrQuestions[rating][index].id));
                sendQuestion(message.channel, wyrQuestions[rating][index]);
                sentQuestionID = wyrQuestions[rating][index].id
            }
            else {
                sendMessage(message.channel, `That rating is disabled here. To enable it, use \`+enable wyr ${rating}\``);
            }
        }
    }

    if (guild) {
        if (!(guild?.id in questionLog)) {
            questionLog[guild.id] = [];
        }
        if (questionLog[guild?.id]?.length > 30) {
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

    var rating
    if (options.data.some(o => o.name === 'rating')) {
        if (!channelSettings[<ChannelSetting>("wyr " + options.get('rating')!.value)]) {
            interaction.editReply("That rating is disabled here")
            return
        } else {
            rating = <wyrCategory>options.get('rating')!.value
        }
    } else {
        let ratings: wyrCategory[] = [];
        if (channelSettings["wyr pg"]) {
            ratings.push("pg");
        }
        if (channelSettings["wyr pg13"]) {
            ratings.push("pg13");
        }
        if (channelSettings["wyr r"]) {
            ratings.push("r");
        }

        if (ratings.length === 0) {
            interaction.editReply("All Would You Rather ratings are disabled here")
            return
        } else {
            rating = ratings[Math.floor(Math.random() * ratings.length)]
        }
    }

    do {
        index = Math.floor(Math.random() * wyrQuestions[rating].length);
    } while (guild && questionLog[guild.id]?.includes(wyrQuestions[rating][index].id));
    sendQuestionSlash(interaction, wyrQuestions[rating][index])
    sentQuestionID = wyrQuestions[rating][index].id

    if (guild) {
        if (!(guild?.id in questionLog)) {
            questionLog[guild.id] = [];
        }
        if (questionLog[guild?.id]?.length > 30) {
            questionLog[guild.id].shift();
        }
        if (sentQuestionID !== null) {
            questionLog[guild.id].push(sentQuestionID);
        }
    }
}

const Meta = {
    name: 'wyr',
    description: "Gives a random Would You Rather question to be answered",
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