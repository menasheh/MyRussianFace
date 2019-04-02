const
    telebot = require('telebot'),
    bot = new telebot({ token: process.env.BOT_TOKEN }),
    translate = require('google-translate-api'),

    // database stuff
    redis = require("redis"),
    client = redis.createClient(),
    {promisify} = require('util'),
    hget = promisify(client.hget).bind(client),

    // config which we'll move to database
    USER_ID = Number(process.env.USER_ID),
    GROUP_ID = Number(process.env.GROUP_ID),
    REDIS_ID = Number(process.env.REDIS_ID),
    LANG_NATIVE = 'en',
    LANG_FOREIGN = 'ru'
;

client.select(REDIS_ID, function () { /* ... */
});

function associate(msg, msg2) {
    client.hset([msg.chat.id, msg.message_id, msg2.message_id]);
}

function associateBidirectional(msg, msg2) {
    associate(msg, msg2);
    associate(msg2, msg);
}

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
            let reply = "I'm a translation bot for @menasheh. Currently, the bot only supports one user. You can host"
                + "your own copy if you'd like to use it. See " + "https://github.com/menasheh/myrussianface";
            translate(reply, {to: msg.from.language_code.slice(0, 2)}).then((response) => {
                bot.sendMessage(msg.chat.id, response.text);
            }).catch((e) => {
                logError(e, "translation");
                bot.sendMessage(msg.chat.id, reply)
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
    let text = msg.text;
    if (!text.match(/^\//)) {
        let dest = await getResponseConfig(msg);

        return translate(text, {to: dest.lang}).then((response) => {
            let replyText = text;
            if (response.from.language.iso !== dest.lang) {
                replyText = response.text + "\n---\n" + text;
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
                associateBidirectional(msg, msg2);
            })
        })
    }
});

bot.on('forward', async (msg) => { //todo different if forwarded text or other type of message
    let dest = await getResponseConfig(msg);
    bot.sendMessage(dest.chat, `${getSenderLink(msg)}:`, {parse: "markdown"}).then(() => {
        bot.forwardMessage(dest.chat, msg.chat.id, msg.message_id).then((msg2) => {
            associate(msg2, msg);
            translate(msg.text, {to: dest.lang}).then((response) => {
                if (response.from.language.iso !== dest.lang) {
                    bot.sendMessage(dest.chat, response.text).then((msg3 => {
                        associateBidirectional(msg, msg3);
                    })).catch((e) => logError(e, "sending fowarded message translation"));
                } else {
                    associate(msg, msg2);
                }
            });
        });
    }).catch((e) => logError(e, "name forward"));
});

bot.on(['audio', 'voice', 'document', 'photo', 'sticker', 'video', 'videoNote', 'contact', 'location', 'venue', 'game', 'invoice'], async (msg) => {
    let dest = await getResponseConfig(msg);
    bot.forwardMessage(dest.chat, msg.chat.id, msg.message_id).then((msg2) => {
        associateBidirectional(msg, msg2);
    }).catch((e) => logError(e, "forward"));
});

function logError(e, note) {
    console.log(`${note} failed:`);
    console.log(e)
}

bot.start();
