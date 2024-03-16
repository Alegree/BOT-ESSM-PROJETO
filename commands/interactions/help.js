const Discord = require("discord.js");
const config = require("../../configs/config.json");
const { chatbot } = require("../../configs/chatbot");

module.exports = {
  data: new Discord.SlashCommandBuilder()
    .setName("ajuda")
    .setDescription("Mostra a lista de comandos e informações do Bot.")
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
        name: `${client.user.username} Commands`,
        iconURL: client.user.displayAvatarURL({ size: 1024 }),
      })
      .setDescription(
        client.MessageCommands.map(
          (c) =>
            `> \`${config.Prefix}${c.name}\` \`(${
              c.aliases?.map((a) => `${config.Prefix}${a}`)?.join(" / ") ||
              "Sem pseudónimos"
            })\`\n> *${c.description}*`
        ).join("\n\n")
      )
      .setFooter({
        text: "Desenvolvido por Lourenço Sequeira e Rodrigo Alegre",
      });

    if (chatbot.State)
      embed.addFields({
        name: "ChatBot:",
        value: `Channel: <#${chatbot.ChatBotChannel}>`,
        inline: true,
      });

    await interaction.editReply({ embeds: [embed] });
  },
};
