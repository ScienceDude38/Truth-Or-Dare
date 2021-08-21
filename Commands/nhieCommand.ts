export { Command, SlashCommand, Meta };
import { CommandInteraction, Message, TextBasedChannels } from 'discord.js';
import { ChannelSettings, ChannelSetting, handler, sendMessage, Question, Discord } from '../bot.js';

export type nhieCategory = "pg" | "pg13" | "r"
export type nhieQuestionList = Record<nhieCategory, Question[]>


let nhieQuestions: nhieQuestionList = {
    "pg": [],
    "pg13": [],
    "r": []
};

(async function() {
    await new Promise((res) => {
        setTimeout(res, 5000)
    })
    nhieQuestions = <nhieQuestionList>await handler.getQuestions('nhie')
})()

var questionLog: Record<string, string[]> = {};

async function Command(args: string[], message: Message, channelSettings: ChannelSettings, prefix: string) {
    var index: number | null = null;
    var sentQuestionID: string | null = null
    var { guild } = message;

    let customQuestions: nhieQuestionList = guild ? <nhieQuestionList>await handler.getCustomQuestions("nhie", guild!.id) : defaultNhieQuestionList()
    if (!customQuestions || Object.keys(customQuestions).length === 0) {
        customQuestions = defaultNhieQuestionList()
    }
    let overrides = guild ? await handler.getOverrides("nhie", guild!.id) : []
    if (!Array.isArray(overrides)) {
        overrides = []
    }
    if (!channelSettings) return

    if (args.length > 1) {
        sendMessage(message.channel, "You can only specify one rating (pg, pg13, or r).");
    }
    else if (args.length === 0) {
        let categories: nhieCategory[] = [];
        if (channelSettings["nhie pg"]) {
            categories.push("pg");
        }
        if (channelSettings["nhie pg13"]) {
            categories.push("pg13");
        }
        if (channelSettings["nhie r"]) {
            categories.push("r");
        }
        if (categories.length === 0) {
            sendMessage(message.channel, `Never Have I Ever questions are disabled here. To enable them, use \`${prefix}enable nhie\``);
        }
        else {
            let rating = categories[Math.floor(Math.random() * categories.length)];
            let questions = [...nhieQuestions[rating].filter(x => !overrides.includes(x.id)), ...customQuestions[rating]]
            do {
                index = Math.floor(Math.random() * questions.length);
            } while (guild && questionLog[guild.id]?.includes(questions[index].id));
            sendQuestion(message.channel, questions[index]);
            sentQuestionID = questions[index].id
        }
    }
    else {
        if (!["pg", "pg13", "r"].includes(args[0])) {
            sendMessage(message.channel, args[0] + " is not a valid rating. Valid Never Have I Ever ratings are pg, pg13, and r.");
        }
        else {
            let category = <nhieCategory>args[0]
            if (channelSettings[<ChannelSetting>("nhie " + category)]) {
                let questions = [...nhieQuestions[category].filter(x => !overrides.includes(x.id)), ...customQuestions[category]]
                do {
                    index = Math.floor(Math.random() * questions.length);
                } while (guild && questionLog[guild.id]?.includes(questions[index].id));
                sendQuestion(message.channel, questions[index]);
                sentQuestionID = questions[index].id
            }
            else {
                sendMessage(message.channel, `That rating is disabled here. To enable it, use \`+enable nhie ${category}\``);
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

async function SlashCommand(interaction: CommandInteraction, channelSettings: ChannelSettings) {
    var index: number | null = null
    var sentQuestionID: string | null = null
    var { guild, options } = interaction
    let customQuestions: nhieQuestionList = guild ? <nhieQuestionList>await handler.getCustomQuestions("nhie", guild!.id) : defaultNhieQuestionList()
    if (!customQuestions || Object.keys(customQuestions).length === 0) {
        customQuestions = defaultNhieQuestionList()
    }
    let overrides = guild ? await handler.getOverrides("nhie", guild!.id) : []
    if (!Array.isArray(overrides)) {
        overrides = []
    }

    var rating: nhieCategory
    if (options.data.some(o => o.name === 'rating')) {
        if (!channelSettings[<ChannelSetting>("nhie " + options.get('rating')!.value)]) {
            interaction.editReply("That rating is disabled here")
            return
        } else {
            rating = <nhieCategory>options.get('rating')!.value
        }
    } else {
        let ratings: nhieCategory[] = [];
        if (channelSettings["nhie pg"]) {
            ratings.push("pg");
        }
        if (channelSettings["nhie pg13"]) {
            ratings.push("pg13");
        }
        if (channelSettings["nhie r"]) {
            ratings.push("r");
        }

        if (ratings.length === 0) {
            interaction.editReply("All Never Have I Ever ratings are disabled here")
            return
        } else {
            rating = ratings[Math.floor(Math.random() * ratings.length)]
        }
    }

    let questions = [...nhieQuestions[rating].filter(x => !overrides.includes(x.id)), ...customQuestions[rating]]
    do {
        index = Math.floor(Math.random() * questions.length);
    } while (guild && questionLog[guild.id]?.includes(questions[index].id));
    sendQuestionSlash(interaction, questions[index])
    sentQuestionID = questions[index].id

    if (guild) {
        if (!(guild.id in questionLog)) {
            questionLog[guild.id] = [];
        }
        if (questionLog[guild.id]?.length > 30) {
            questionLog[guild.id].shift();
        }
        if (sentQuestionID !== undefined) {
            questionLog[guild.id].push(sentQuestionID);
        }
    }
}

const Meta = {
    name: 'nhie',
    description: "Gives a random Never Have I Ever question to be answered",
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

export function defaultNhieQuestionList() {
    return {
        pg: [],
        pg13: [],
        r: []
    }
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