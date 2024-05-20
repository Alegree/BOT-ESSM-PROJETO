/*
    Author: Lourenço Sequeira e Rodrigo Alegre
    Github: https://github.com/Alegree/BOT-ESSM-PROJETO
    Current Version: 1.2.3
    DiscordJs Version: 14.8.0
*/

const Discord = require("discord.js");
const chalk = require("chalk");
const fs = require("node:fs");
const config = require("./configs/config.json");

const welcome = require("./events/welcome.js");

const client = new Discord.Client({
  intents: [
    Discord.GatewayIntentBits.Guilds,
    Discord.GatewayIntentBits.GuildMembers,
    Discord.GatewayIntentBits.GuildMessages,
    Discord.GatewayIntentBits.MessageContent,
  ],
});

console.log(chalk.bold.yellowBright("A carregar eventos"));
const events = fs
  .readdirSync(`./events/`)
  .filter((file) => file.endsWith(".js"));
for (const file of events) {
  const event = require(`./events/${file}`);
  client.on(file.split(".")[0], event.bind(null, client));
  delete require.cache[require.resolve(`./events/${file}`)];
}

client.on("ready", () => {
  welcome(client);
});

console.log(chalk.bold.yellowBright("A carregar mensagens de comandos"));
client.MessageCommands = new Discord.Collection();
const messageCommands = fs
  .readdirSync(`./commands/messages/`)
  .filter((files) => files.endsWith(".js"));
for (const file of messageCommands) {
  const command = require(`./commands/messages/${file}`);
  client.MessageCommands.set(command.name.toLowerCase(), command);
  delete require.cache[require.resolve(`./commands/messages/${file}`)];
}

console.log(chalk.bold.yellowBright("A carregar mensagens (/)"));
client.SlashCommands = new Discord.Collection();
const slashCommands = fs
  .readdirSync(`./commands/interactions/`)
  .filter((files) => files.endsWith(".js"));
for (const file of slashCommands) {
  const command = require(`./commands/interactions/${file}`);
  client.SlashCommands.set(command.data.name, command);
  delete require.cache[require.resolve(`./commands/interactions/${file}`)];
}

process.on("unhandledRejection", (reason, p) => {
  console.log(chalk.bold.redBright("[antiCrash] :: Unhandled Rejection/Catch"));
  console.log(reason?.stack, p);
});

process.on("uncaughtException", (err, origin) => {
  console.log(chalk.bold.redBright("[antiCrash] :: ncaught Exception/Catch"));
  console.log(err?.stack, origin);
});

process.on("uncaughtExceptionMonitor", (err, origin) => {
  console.log(
    chalk.bold.redBright("[antiCrash] :: Uncaught Exception/Catch (MONITOR)")
  );
  console.log(err?.stack, origin);
});

client.login(config.Token);
