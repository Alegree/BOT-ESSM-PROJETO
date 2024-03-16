const Discord = require("discord.js");
const chalk = require("chalk");

module.exports = async (client) => {
  await client.user.setPresence({
    activities: [
      {
        name: `Escola Secundária de Santa Maria`,
        type: Discord.ActivityType.Watching,
      },
    ],
    status: "online",
  });

  console.log(
    chalk.bold.greenBright(
      `${client.user.tag} está online e pronto para responder as tuas perguntas!`
    )
  );
};
