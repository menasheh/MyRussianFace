# My Russian Face - a Telegram Bot

This is a Telegram bot which allows you to participate in conversations in languages foreign to you without spamming the
group with extra messages every time. Sound exciting? Let's get started!

## Getting Started

These instructions will get you up and running on your local machine. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

To run this bot, you need nodejs and npm. If you're on linux:

```
sudo apt-get install -y nodejs npm
```

If you're on Windows, God help you. You can use the [Windows Subsystem for Linux (WSL)](https://msdn.microsoft.com/en-us/commandline/wsl/install_guide) or get nodeJS and npm [here](https://nodejs.org/en/).

You also need a bot token from [@botfather](https://t.me/botfather), and a Telegram group which doesn't always speak your language.

### Installing

Clone this repository, or better, your fork:

```
git clone git@github.com:menasheh/MyRussianFace.git
```

Install node dependencies

```
cd MyRussianFace
npm install
```

Set environment variables `USER_ID` and `GROUP_ID`. `USER_ID` should be your telegram id, and `GROUP_ID` should be the 
id of the foreign telegram group you'll be participating in.

If you're not going from English to Russian, you may want to change these two lines in `bot.js` as appropriate:

```
const LANG_NATIVE = 'en';
const LANG_FOREIGN = 'ru';
```

Finally, run the bot:

```
node bot.js
```

## Deployment

If your computer is not always on, you may want to set this up on a Raspberry Pi or a [digital ocean](https://peromsik.com/go/digitalocean) droplet.
Then, configure your computer to run `node bot.js` at startup. This AskUbuntu [answer](https://askubuntu.com/a/816/515251)may prove useful.

## Contributing

Contributions are welcome, just submit a pull request! Just be careful not to commit bot tokens or other changes to the settings

Here's a few ideas to get you started:
 - move language settings to environment
 - improve initial setup process (detect id's automatically if not set, for example)
 - add slash command to translate without sending the message
 - deal with multiple groups or switching between groups
 - allow more than one user to use the same bot instance without giving eachother message access to the wrong messages (this is infinitely more useful if one bot can handle multiple groups for one user without getting too cluttered)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

Powered by @mullwar's [Telebot](https://github.com/mullwar/telebot).

Inspired by the translation bot made for Telebot's support chat.
