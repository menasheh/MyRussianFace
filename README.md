# My Russian Face - a Telegram Bot

This is a Telegram bot which allows you to participate in conversations in languages foreign to you without copying and 
pasting and without spamming the group with extra notifications.

### Prerequisites

To run this bot, you need nodejs and npm. If you're on linux:

```
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.2/install.sh | bash
source ~/.bashrc
nvm install v8.9.4
```

If you're on Windows, God help you. You can use the [Windows Subsystem for Linux (WSL)](https://msdn.microsoft.com/en-us/commandline/wsl/install_guide) or get nodeJS and npm [here](https://nodejs.org/en/).

In any case, you also need a Telegram group which doesn't always speak your language, and a bot token from [@botfather](https://t.me/botfather).
In addition to the bot token, you'll need to disable inline privacy for your bot _before_ you add it to the group so that
it can read all messages in order to translate them.

### Installing

Clone this repository, or better, your fork:

```bash
git clone git@github.com:menasheh/myrussianface.git
```

##### Install dependencies

```bash
cd myrussianface
npm install
```

##### Set environment variables
 
- `TELEBOT_TOKEN` - from [@botfather](https://t.me/botfather),
- `USER_ID` your telegram id,
- `GROUP_ID` the id of a foreign-language user or group you'd like to communicate with.
 
You can get these the first time by running the bot, sending it messages from each side, and checking the logs for the ids.

##### Language Settings
 
If you're not going from English to Russian, change the LANG constants in `bot.js`:

```javascript
const LANG_NATIVE = 'en';
const LANG_FOREIGN = 'ru';
```

Finally, run the bot:

```
node bot.js
```

## Deployment

You can run it as needed from your computer, but a better solution is to set it up on a Raspberry Pi or 
[digitalocean](https://peromsik.com/go/digitalocean) droplet. If you're trying to configure it to run at startup,
[this AskUbuntu answer](https://askubuntu.com/a/816/515251) may prove useful.

## Contributing

Contributions are welcome, just submit a pull request! Just be careful not to commit bot tokens or other changes to the settings

Here's a few ideas to get you started:
 - move language settings to environment
 - improve initial setup process (detect id's automatically if not set, for example)
 - add slash command to translate without sending the message
 - deal with multiple groups or switching between groups
 - allow more than one user to use the same bot instance without giving eachother message access to the wrong messages (this is infinitely more useful if one bot can handle multiple groups for one user without getting too cluttered)
 - skip sending username when the most recent message in that chat had the username anyway

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
