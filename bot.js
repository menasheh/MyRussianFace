const telebot = require('telebot'),
    translate = require('google-translate-api'),
    redis = require("redis"),
    client = redis.createClient(),
    {promisify} = require('util'),
    hget = promisify(client.hget).bind(client),
    {
        TELEBOT_TOKEN: TOKEN,
    } = process.env,
    USER_ID = Number(process.env.USER_ID),
    GROUP_ID = Number(process.env.GROUP_ID),
    LANG_NATIVE = 'en',
    LANG_FOREIGN = 'ru',
    bot = new telebot({
        token: TOKEN,
    });

function getSenderLink(msg) {
    let name = msg.from.first_name + (msg.from.last_name ? (' ' + msg.from.last_name) : '');
    return `[${name}](tg://user?id=${msg.from.id})`;
}

async function getResponseConfig(msg) {
    let destChat;
    let destLang;
    let destReply = -1;
    if (msg.chat.id === USER_ID) {
        destChat = GROUP_ID;
        destLang = LANG_FOREIGN;
    } else if (msg.chat.id === GROUP_ID) {
        destChat = USER_ID;
        destLang = LANG_NATIVE
    } else {
        console.log(`Unknown party ${msg.chat.id} has accessed the bot!.`);
        console.log(msg.from.language_code);
        //TODO - respond in user's own language
        if (msg.chat.id === msg.from.id) { // Don't respond to public chats
            bot.sendMessage(msg.chat.id, "I'm a translation bot for @menasheh. He's planning to make one that more" +
                "people can use, but hasn't yet. In the meantime, you can host your own copy. See " +
                "https://github.com/menasheh/myrussianface", {
                preview: false
            });
        }
        return -1;
    }
    if (msg.reply_to_message) {
        destReply = await hget(msg.reply_to_message.chat.id, msg.reply_to_message.message_id);
    }
    return {
        chat: destChat,
        lang: destLang,
        reply: destReply
    }
}


bot.on('text', async (msg) => {
    let dest = await getResponseConfig(msg);
    let text = msg.text;

    return translate(text, {to: dest.lang}).then((response) => {
        let replyText = text;
        if (response.from.language.iso !== dest.lang) {
            replyText = text + "\n---\n" + response.text;
        }

        if (msg.chat.id === GROUP_ID) {
            replyText = `${getSenderLink(msg)}:\n${replyText}`;
        }
        return bot.sendMessage(dest.chat, replyText, {
            parse: "markdown",
            replyToMessage: dest.reply,
            preview: false,
        }).then((msg2) => {
            /* When user sends a message to the bot, the bot sends a message to channel. If someone replies to a channel
               message, the bot must be able to reply to the user to the parallel message in the bot's chat with the user.
               So too if user replies to message that he sent, we need to have the bot respond to chat that it sent in channel
             */
            client.hset([msg.chat.id, msg.message_id, msg2.message_id], redis.print);
            client.hset([msg2.chat.id, msg2.message_id, msg.message_id], redis.print);
        })
    })
});

bot.on('forward', (msg) => {
    let dest = getResponseConfig(msg);
    bot.sendMessage(dest.chat, `${getSenderLink(msg)}:`, {parse: "markdown"}).then(() => {
        bot.forwardMessage(dest.chat, msg.chat.id, msg.message_id).then(() => {
            translate(msg.text, {to: dest.lang}).then((response) => {
                if (response.from.language.iso !== dest.lang) {
                    bot.sendMessage(dest.chat, response.text);
                }
            });
        });
    });
});

bot.on('sticker', (msg) => {
    let dest = getResponseConfig(msg);
    bot.forwardMessage(dest.chat, msg.chat.id, msg.message_id);
});

bot.start();
