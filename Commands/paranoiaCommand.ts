export { Command, SlashCommand, Meta, Aliases };
import { CommandInteraction, Message, User } from 'discord.js';
import { ChannelSettings, ChannelSetting, handler, sendMessage } from '../bot.js';
import { Question } from './addCommand.js';
import { checkUserParanoia, checkUserAns, addUser } from './paranoiaData.js';

export type paranoiaCategory = "pg" | "pg13" | "r"
export type paranoiaQuestionList = Record<paranoiaCategory, Question[]>

let paranoiaQuestions: paranoiaQuestionList = {
    "pg": [],
    "pg13": [],
    "r": []
};

(async function() {
    await new Promise((res) => {
        setTimeout(res, 5000)
    })
    paranoiaQuestions = <paranoiaQuestionList>await handler.getQuestions('paranoia')
})()

const Aliases = ["p"]

var questionLog: Record<string, number[]> = {};

async function Command(args: string[], message: Message, channelSettings: ChannelSettings, prefix: string) {
    var index: number | null = null;
    var { guild } = message
    var mentionedUsers = message.mentions.users;
    var check = mentionedUsers ? await checkUserParanoia(mentionedUsers.first()?.id!, message.guild!.id) : null
    if (mentionedUsers.size === 0) {
        sendMessage(message.channel, "You have to mention someone to send them a question.");
    }
    else if (mentionedUsers.size > 1) {
        sendMessage(message.channel, "You can only send a question to one user at a time.");
    }
    else if (args.length > 2) {
        sendMessage(message.channel, "You can only specify one rating (pg, pg13, or r).");
    }
    else if (check) {
        sendMessage(message.channel, "That user already has a question active.");
        let ansCheck = await checkUserAns(mentionedUsers.first()?.id!)
        if (!ansCheck) {
            console.log('paranoia check:')
            console.dir(check)
            console.log('ans check:')
            console.dir(ansCheck)
        }
    }
    else if (args.length === 1) {
        let categories: paranoiaCategory[] = [];
        if (channelSettings["paranoia pg"]) {
            categories.push("pg");
        }
        if (channelSettings["paranoia pg13"]) {
            categories.push("pg13");
        }
        if (channelSettings["paranoia r"]) {
            categories.push("r");
        }
        if (categories.length === 0) {
            sendMessage(message.channel, `Paranoia questions are disabled here. To enable them, use \`${prefix}enable paranoia\``);
        }
        else {
            let rating = categories[Math.floor(Math.random() * categories.length)];
            do {
                index = Math.floor(Math.random() * paranoiaQuestions[rating].length);
            } while (guild && questionLog[guild.id]?.includes(index));
            sendQuestionToUser(mentionedUsers.first()!, rating, index, message);
        }
    }
    else if (args.length === 2) {
        let rating: paranoiaCategory;
        if (/<@!?[0-9]+>/.test(args[0])) {
            rating = <paranoiaCategory>args[1];
        }
        else {
            rating = <paranoiaCategory>args[0];
        }
        if (!["pg", "pg13", "r"].includes(rating)) {
            sendMessage(message.channel, rating + " is not a valid rating. Valid paranoia ratings are pg, pg13, and r.");
        }
        else {
            if (channelSettings[<ChannelSetting>("paranoia " + rating)]) {
                do {
                    index = Math.floor(Math.random() * paranoiaQuestions[rating].length);
                } while (guild && questionLog[guild.id]?.includes(index));
                sendQuestionToUser(mentionedUsers.first()!, rating, index, message)
            }
            else {
                sendMessage(message.channel, `${rating.toUpperCase()} paranoia questions are disabled here. To enable them, use \`${prefix}enable paranoia ${rating}\``);
            }
        }
    }

    if (guild) {
        if (!(guild.id in questionLog)) {
            questionLog[guild.id] = [];
        }
        if (questionLog[guild.id].length > 30) {
            questionLog[guild.id].shift();
        }
        if (index !== null) {
            questionLog[guild.id].push(index);
        }
    }
}

async function SlashCommand(interaction: CommandInteraction, channelSettings: ChannelSettings) {
    var index: number | null = null
    var { guild, options } = interaction
    var user = <User>options.get('target')!.user
    var check = await checkUserParanoia(user.id, guild!.id);

    if (user.bot) {
        interaction.editReply("Bots can't answer paranoia questions, no matter how hard they try")
        return
    } else if (check) {
        interaction.editReply("That user already has a question active from this server")
        return
    }

    var rating: paranoiaCategory
    if (options.data.some(o => o.name === 'rating')) {
        if (!channelSettings[<ChannelSetting>("paranoia " + options.get('rating')!.value)]) {
            interaction.editReply("That rating is disabled here")
            return
        } else {
            rating = <paranoiaCategory>options.get('rating')!.value
        }
    } else {
        let ratings: paranoiaCategory[] = [];
        if (channelSettings["paranoia pg"]) {
            ratings.push("pg");
        }
        if (channelSettings["paranoia pg13"]) {
            ratings.push("pg13");
        }
        if (channelSettings["paranoia r"]) {
            ratings.push("r");
        }

        if (ratings.length === 0) {
            interaction.editReply("All paranoia ratings are disabled here")
            return
        } else {
            rating = ratings[Math.floor(Math.random() * ratings.length)]
        }
    }

    do {
        index = Math.floor(Math.random() * paranoiaQuestions[rating].length);
    } while (guild && questionLog[guild.id]?.includes(index));
    user.send(`Question from ${interaction.user.username} in ${guild!.name}: \n${paranoiaQuestions[rating][index].text}\nReply with \`/ans\``)
        .then(() => {
            addUser(user.id, guild!.id, interaction.channel!.id, paranoiaQuestions[rating][index!].text)
            interaction.editReply("Paranoia question sent")
        })
        .catch((err) => {
            interaction.editReply("That user has their DMs set to closed")
            console.log(err)
        });

    if (guild) {
        if (!(guild.id in questionLog)) {
            questionLog[guild.id] = [];
        }
        if (questionLog[guild.id].length > 30) {
            questionLog[guild.id].shift();
        }
        if (index !== null) {
            questionLog[guild.id].push(index);
        }
    }
}

const Meta = {
    name: 'paranoia',
    description: "Sends a paranoia question to the target through DMs",
    options: [
        {
            name: 'target',
            description: "The user to send the paranoia question to",
            type: "USER",
            required: true
        },
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

function sendQuestionToUser(user: User, rating: paranoiaCategory, index: number, message: Message) {
    user.send(`Question from ${message.author.username} in ${message.guild!.name}: \n${paranoiaQuestions[rating][index]}\nReply with \`+ans [answer]\`.`)
        .then(() => {
            addUser(user.id, message.guild!.id, message.channel.id, paranoiaQuestions[rating][index].text)
            sendMessage(message.channel, "Paranoia question sent")
        })
        .catch((err) => {
            sendMessage(message.channel, "That user has their DMs set to closed.")
            console.log(err)
        });
}

export function defaultParanoiaQuestionList() {
    return {
        pg: [],
        pg13: [],
        r: []
    }
}
