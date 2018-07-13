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

bot.on('text', (msg) => {
    let text = msg.text;
    let chatId = msg.chat.id;
    let messageId = msg.message_id;

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
            return bot.sendMessage(chatId, "I'm a translation bot for @menasheh. He's planning to make one that more" +
                "people can use, but hasn't yet. In the meantime, you can host your own copy. See " +
                "https://github.com/menasheh/myrussianface", {
                preview: false
            });
        }
        return
    }

    return translate(text, {to: destLang}).then((response) => {
        let translatedText = response.text;
        let languageId = response.from.language.iso;
        let replyText = text;
        if (languageId !== destLang) {
            replyText = text + "\n---\n" + translatedText;
        }

        if (msg.chat.id === GROUP_ID){
            let name = msg.from.first_name + (msg.from.last_name ? (' ' + msg.from.last_name) : '');
            replyText = `[${name}](tg://user?id=${msg.from.id}):\n${replyText}`;
        }

        return bot.sendMessage(destChat, replyText, {
            parse: "markdown",
            preview: false
        });
    });



});

bot.start();
