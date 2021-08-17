export { checkUserParanoia, addUser, checkUserAns, removeUser };
import { handler } from '../bot.js';
async function checkUserParanoia(user: string, guild: string) {
    if (user === undefined) {
        return false;
    }
    let userData = await handler.getParanoiaData(user);
    if (Array.isArray(userData)) {
        return userData.some((a) => a.guild === guild && Date.now() - a.time < 86400000);
    }
    else {
        return false;
    }
}
async function addUser(user: string, guild: string, channel: string, question: string) {
    let userData = await handler.getParanoiaData(user);
    if (Array.isArray(userData)) {
        userData.push(new ParanoiaQuestion(user, guild, channel, question));
        handler.setParanoiaData(user, userData);
    }
    else {
        let newUserData = [ new ParanoiaQuestion(user, guild, channel, question) ]
        handler.setParanoiaData(user, newUserData);
    }
}
async function checkUserAns(user: string) {
    let userData = await handler.getParanoiaData(user);
    if (Array.isArray(userData)) {
        if (userData[0] === undefined || !userData[0].hasOwnProperty("time")) {
        }
        else {
            while (Date.now() - userData[0]?.time > 86400000) {
                userData.shift();
            }
            if (userData[0]) {
                handler.setParanoiaData(user, userData);
                return userData[0];
            }
            else {
                removeUser(user)
                return undefined;
            }
        }
    }
    else {
        return undefined;
    }
}
async function removeUser(user: string) {
    let userData = await handler.getParanoiaData(user);
    userData.shift();
    if (userData.length === 0) {
        handler.deleteParanoiaData(user);
    }
    else {
        handler.setParanoiaData(user, userData);
    }
}

interface ParanoiaQuestion {
    user: string,
    guild: string,
    channel: string,
    question: string,
    time: number
}

class ParanoiaQuestion {
    constructor(user: string, guild: string, channel: string, question: string) {
        this.user = user;
        this.guild = guild;
        this.channel = channel;
        this.question = question;
        this.time = Date.now();
    }
}

export type ParanoiaData = ParanoiaQuestion[]