export { Command, SlashCommand, Meta, Aliases };
import { CommandInteraction, Message, User } from 'discord.js';
import { ChannelSettings, ChannelSetting, handler, sendMessage, Question, Discord, client } from '../bot.js';
import { checkUserParanoia, checkUserAns, addUser } from './paranoiaData.js';

type paranoiaCategory = "pg" | "pg13" | "r"
export type paranoiaQuestions = Record<paranoiaCategory, Question[]>

let paranoiaQuestions: paranoiaQuestions = {
    "pg": [],
    "pg13": [],
    "r": []
};

(async function() {
    await new Promise((res) => {
        setTimeout(res, 5000)
    })
    paranoiaQuestions = <paranoiaQuestions>await handler.getQuestions('paranoia')
})()

const Aliases = ["p"]

var questionLog: Record<string, string[]> = {};

async function Command(args: string[], message: Message, channelSettings: ChannelSettings, prefix: string) {
    var index: number | null = null;
    var sentQuestionID: string | null = null
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
            } while (guild && questionLog[guild.id]?.includes(paranoiaQuestions[rating][index].id));
            let fetchedGuild = await client.guilds.fetch(guild!.id)
            sendQuestionToUser(mentionedUsers.first()!, paranoiaQuestions[rating][index], message, fetchedGuild.name);
            sentQuestionID = paranoiaQuestions[rating][index].id
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
                } while (guild && questionLog[guild.id]?.includes(paranoiaQuestions[rating][index].id));
                let fetchedGuild = await client.guilds.fetch(guild!.id)
                sendQuestionToUser(mentionedUsers.first()!, paranoiaQuestions[rating][index], message, fetchedGuild.name)
                sentQuestionID = paranoiaQuestions[rating][index].id
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
        if (sentQuestionID !== null) {
            questionLog[guild.id].push(sentQuestionID);
        }
    }
}

async function SlashCommand(interaction: CommandInteraction, channelSettings: ChannelSettings) {
    var index: number | null = null
    var sentQuestionID: string | null = null
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
    } while (guild && questionLog[guild.id]?.includes(paranoiaQuestions[rating][index].id));
    
    let paranoiaEmbed = new Discord.MessageEmbed()
        .setTitle(paranoiaQuestions[rating][index].text)
        .setDescription(`Paranoia Question from ${interaction.user.username} in ${guild!.name}`)
        .setFooter(`${paranoiaQuestions[rating][index].id} | Reply with +ans [answer]`)
        
    user.send({embeds: [paranoiaEmbed]})
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
        if (sentQuestionID !== null) {
            questionLog[guild.id].push(sentQuestionID);
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

function sendQuestionToUser(user: User, question: Question, message: Message, guildName: string) {
    let paranoiaEmbed = new Discord.MessageEmbed()
        .setTitle(question.text)
        .setDescription(`Paranoia Question from ${message.author.username} in ${guildName}`)
        .setFooter(`${question.id} | Reply with +ans [answer]`)

    user.send({embeds: [paranoiaEmbed]})
        .then(() => {
            addUser(user.id, message.guild!.id, message.channel.id, question.text)
            sendMessage(message.channel, "Paranoia question sent")
        })
        .catch((err) => {
            sendMessage(message.channel, "That user has their DMs set to closed.")
            console.log(err)
        });
}
