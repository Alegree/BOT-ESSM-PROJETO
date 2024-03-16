const Discord = require("discord.js");
const chalk = require("chalk");
const fs = require("node:fs");
const config = require("./configs/config.json");
const commands = [];

const commandFiles = fs
  .readdirSync(`./commands/interactions/`)
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/interactions/${file}`);
  commands.push(command.data.toJSON());
}

const rest = new Discord.REST({ version: "10" }).setToken(config.Token);

(async () => {
  try {
    console.log(
      chalk.bold.yellowBright(
        `Começou a atualiazar ${commands.length} comandos de aplicação (/).`
      )
    );

    const data = await rest.put(
      Discord.Routes.applicationCommands(config.ClientID),
      { body: commands }
    );

    console.log(
      chalk.bold.greenBright(
        `Recarregado com sucesso ${data.length} comandos de aplicação (/).`
      )
    );
    console.log(
      chalk.bold.redBright(
        `Nota: se não vires os comandos de barra no teu servidor talvez o teu bot não tenha o âmbito "applicatiton.commands" tenta convidá-lo usando este link\nhttps://discord.com/api/oauth2/authorize?client_id=${config.ClientID}&permissions=0&scope=bot%20applications.commands`
      )
    );
  } catch (error) {
    console.error(chalk.bold.redBright(error));
  }
})();
