const TeleBot = require('telebot');
const translate = require('google-translate-api');
const {
    TELEBOT_TOKEN: TOKEN,
} = process.env;

const USER_ID = Number(process.env.USER_ID);
const GROUP_ID = Number(process.env.GROUP_ID);
const LANG_NATIVE = 'en';
const LANG_FOREIGN = 'ru';

const bot = new TeleBot({
    token: TOKEN,
});

function getResponseConfig(msg) {
    let destChat;
    let destLang;
    if (msg.chat.id === USER_ID) {
        destChat = GROUP_ID;
        destLang = LANG_FOREIGN;
    } else if (msg.chat.id === GROUP_ID) {
        destChat = USER_ID;
        destLang = LANG_NATIVE
    } else {
        console.log("Unknown party has accessed the bot!.");
        console.log(msg.chat.id);
        //TODO - respond in user's own language
        if (msg.chat.id === msg.from.id) { // Don't respond to public chats
            bot.sendMessage(chatId, "I'm a translation bot for @menasheh. He's planning to make one that more" +
                "people can use, but hasn't yet. In the meantime, you can host your own copy. See " +
                "https://github.com/menasheh/myrussianface", {
                preview: false
            });
        }
        return -1;
    }
    return {
        chat: destChat,
        lang: destLang
    }
}


bot.on('text', (msg) => {
    let dest = getResponseConfig(msg);
    let text = msg.text;

    return translate(text, {to: dest.lang}).then((response) => {
        let replyText = text;
        if (response.from.language.iso !== dest.lang) {
            replyText = text + "\n---\n" + response.text;
        }

        if (msg.chat.id === GROUP_ID) {
            let name = msg.from.first_name + (msg.from.last_name ? (' ' + msg.from.last_name) : '');
            replyText = `[${name}](tg://user?id=${msg.from.id}):\n${replyText}`;
        }

        return bot.sendMessage(destChat, replyText, {
            parse: "markdown",
            preview: false
        })
    })
});

bot.on('forward', (msg) => {
    let dest = getResponseConfig(msg);
    bot.forwardMessage(dest.chat, msg.chat.id, msg.message_id).then(() => {
        translate(msg.text, {to: dest.lang}).then((response) => {
            if (response.from.language.iso !== dest.lang) {
                bot.sendMessage(dest.chat, response.text);
            }
        });
    });
});

bot.on('sticker', (msg) => {
    let dest = getResponseConfig(msg);
    bot.forwardMessage(dest.chat, msg.chat.id, msg.message_id);
});

bot.start();
