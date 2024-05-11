const Discord = require("discord.js");
const openAI = require("openai");
const chalk = require("chalk");
const func = require("../../utils/functions");
const config = require("../../configs/config.json");

module.exports = {
  name: "Imaginar",
  aliases: ["I", "D", "Draw"],
  description: "Desenhem a tua imaginação!",

  async execute(client, message, args, cmd) {
    await message.channel.sendTyping();

    if (!args[0]) {
      const embed = new Discord.EmbedBuilder()
        .setColor(config.ErrorColor)
        .setTitle("Error")
        .setDescription(
          `Não podes usar o comando \`${cmd}\` como este, é necessário fornecer algo como o exemplo\n\`\`\`\n${config.Prefix}${cmd} Um dragão debaixo de agua.\n\`\`\``
        );

      await message.reply({ embeds: [embed] });
    }

    const openai = new openAI.OpenAI({ apiKey: config.OpenAIapiKey });

    const question = args.join(" ");

    openai.images
      .generate({
        prompt: question,
        n: 4,
        size: "1024x1024",
      })
      .then(async (response) => {
        const data = response.data;

        const embeds = [
          new Discord.EmbedBuilder()
            .setColor(config.MainColor)
            .setURL("https://github.com/Alegree")
            .setAuthor({
              name:
                question.length > 256
                  ? question.substring(0, 253) + "..."
                  : question,
              iconURL: message.author.displayAvatarURL(),
            })
            .setImage(data[0].url)
            .setFooter({
              text: `Bot desenvolvido por Lourenço e Rodrigo`,
              iconURL: client.user.displayAvatarURL(),
            }),
        ];

        const buttons = [
          new Discord.ButtonBuilder()
            .setStyle(Discord.ButtonStyle.Link)
            .setLabel("Image 1")
            .setURL(data[0].url),
        ];

        for (let i = 0; i < 3; i++) {
          const embed = new Discord.EmbedBuilder()
            .setURL("https://github.com/Alegree")
            .setImage(data[i + 1].url);

          const button = new Discord.ButtonBuilder()
            .setStyle(Discord.ButtonStyle.Link)
            .setLabel(`Image ${i + 2}`)
            .setURL(data[i + 1].url);

          embeds.push(embed);
          buttons.push(button);
        }

        const row = new Discord.ActionRowBuilder().addComponents(buttons);

        await message.reply({
          embeds: embeds,
          components: [row],
        });
      })
      .catch(async (error) => {
        console.error(chalk.bold.redBright(error));

        if (error.response) {
          const embed = new Discord.EmbedBuilder()
            .setColor(config.ErrorColor)
            .setAuthor({
              name:
                question.length > 256
                  ? question.substring(0, 253) + "..."
                  : question,
              iconURL: message.author.displayAvatarURL(),
            })
            .setDescription(
              error.response.error.message.length > 4096
                ? error.response.error.message.substring(0, 4093) + "..."
                : error.response.error.message
            );

          await message.reply({ embeds: [embed] }).catch(() => null);
        } else if (error.message) {
          const embed = new Discord.EmbedBuilder()
            .setColor(config.ErrorColor)
            .setAuthor({
              name:
                question.length > 256
                  ? question.substring(0, 253) + "..."
                  : question,
              iconURL: message.author.displayAvatarURL(),
            })
            .setDescription(
              error.message.length > 4096
                ? error.message.substring(0, 4093) + "..."
                : error.message
            );

          await message.reply({ embeds: [embed] }).catch(() => null);
        }
      });
  },
};
