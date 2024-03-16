const Discord = require("discord.js");
const config = require("../../configs/config.json");
const { chatbot } = require("../../configs/chatbot");

module.exports = {
  name: "Ajuda",
  aliases: ["H", "CMD", "CMDs", "Command", "Commands"],
  description: "Mostra isto!",

  async execute(client, message, args, cmd) {
    await message.channel.sendTyping();

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
        text: "Desenvolvido por Lourenço Sequeira e Rodrigo Alegre ",
      });

    if (chatbot.State)
      embed.addFields({
        name: "ChatBot:",
        value: `Channel: <#${chatbot.ChatBotChannel}>`,
        inline: true,
      });

    await message.reply({ embeds: [embed] });
  },
};
