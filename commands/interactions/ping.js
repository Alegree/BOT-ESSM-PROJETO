const Discord = require("discord.js");
const os = require("node:os");
const func = require("../../utils/functions");
const config = require("../../configs/config.json");

module.exports = {
  data: new Discord.SlashCommandBuilder()
    .setName("ping")
    .setDescription("Mostra o ping do bot.")
    .addStringOption((option) =>
      option
        .setName("ephemeral")
        .setDescription(
          "Esconde a resposta do bot dos outros. (Predefinição: Desativado)"
        )
        .addChoices(
          {
            name: "Ativar",
            value: "Enable",
          },
          {
            name: "Desativar",
            value: "Disable",
          }
        )
    ),

  async execute(client, interaction) {
    const ephemeralChoice = interaction.options.getString("ephemeral");
    const ephemeral = ephemeralChoice === "Enable" ? true : false;
    await interaction.deferReply({ ephemeral: ephemeral });

    const embed = new Discord.EmbedBuilder()
      .setColor(config.MainColor)
      .setAuthor({
        name: `Pong!`,
        iconURL: client.user.displayAvatarURL({ size: 1024 }),
      })
      .addFields(
        {
          name: `📡 Ping:`,
          value: `${client.ws.ping}ms`,
          inline: true,
        },
        {
          name: `💾 Memoria:`,
          value: `${func.numberWithCommas(
            Math.round(process.memoryUsage().rss / 1024 / 1024)
          )}/${func.numberWithCommas(
            Math.round(os.totalmem() / 1024 / 1024)
          )}MB`,
          inline: true,
        },
        {
          name: `⏳ Tempo ativo:`,
          value: func.timestamp(client.readyTimestamp),
          inline: false,
        }
      )
      .setFooter({
        text: `Comando feito por ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL({ size: 1024 }),
      });

    await interaction.editReply({ embeds: [embed] });
  },
};
