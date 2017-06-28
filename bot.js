const TeleBot = require('telebot');
const translate = require('google-translate-api');

const {
    TELEBOT_TOKEN: TOKEN,
    //TELEBOT_URL: URL,
    //TELEBOT_HOST: HOST,
    //TELEBOT_PORT: PORT,
} = process.env;

const USER_ID = process.env.USER_ID;
const GROUP_ID = process.env.GROUP_ID;
const LANG_NATIVE = 'en';
const LANG_FOREIGN = 'ru';

const bot = new TeleBot({
    token: TOKEN,
    //url: URL,
    //host: HOST,
    //port: PORT
});

bot.on('text', (msg) => {

    const text = msg.text;
    const chatId = msg.chat.id;
    const messageId = msg.message_id;

    console.log('+', chatId, messageId, text);

    if(msg.chat.id === USER_ID){

        console.log("Received message from user...");

    return translate(text, {to: LANG_FOREIGN}).then((response) => {

        const translatedText = response.text;
        const languageId = response.from.language.iso;
        let replyText = text;

        if (languageId !== LANG_FOREIGN) {
            replyText = translatedText;
        }

        return bot.sendMessage(GROUP_ID, `${replyText}`, {
            preview: false
        });

    });

    } else if(msg.chat.id === GROUP_ID){

        console.log("Received message from group...");
        console.log(msg);

        return translate(text, {to: LANG_NATIVE}).then((response) => {

            const translatedText = response.text;
            const languageId = response.from.language.iso;
            let replyText = text;

            if (languageId !== LANG_NATIVE) {
                replyText = translatedText;
            }

            return bot.sendMessage(USER_ID, `${msg.from.first_name} \@${msg.from.username}:\n${replyText}`, {
                preview: false
            });

        });

    } else {
        console.log("Unknown party has accessed the bot!.");
        console.log(msg);
        //TODO - respond in user's language
        return bot.sendMessage(chatId, "We're sorry, this bot does not want to talk to you.  Stay tuned for info on how to make your own!", {
            preview: false
        });
    }

});

bot.updateId = -1;
bot.start();