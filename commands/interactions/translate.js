const Discord = require("discord.js");
const openAI = require("openai");
const chalk = require("chalk");
const fs = require("node:fs");
const func = require("../../utils/functions");
const settings = require("../../utils/settings");
const config = require("../../configs/config.json");

module.exports = {
  data: new Discord.SlashCommandBuilder()
    .setName("traduzir")
    .setDescription(
      "Traduz os teus textos de qualquer língua para qualquer língua!"
    )
    .addStringOption((option) =>
      option
        .setName("prompt")
        .setDescription("Qual é o seu texto?")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("language")
        .setDescription(
          "Para que língua gostaria que eu traduzisse a sua mensagem? (Predefinição: inglês)"
        )
        .setRequired(false)
    )
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

    const openai = new openAI.OpenAI({ apiKey: config.OpenAIapiKey });

    const question = interaction.options.getString("prompt");

    const language = interaction.options.getString("language") || "English";
    const translatorPrompt = fs.readFileSync(
      "./utils/prompts/translator.txt",
      "utf-8"
    );
    const prompt = translatorPrompt.replaceAll("{language}", language);

    const messages = [
      {
        role: "system",
        content: prompt,
      },
      {
        role: "user",
        content: question,
      },
    ];

    openai.chat.completions
      .create({
        model: "gpt-3.5-turbo",
        messages: messages,
        max_tokens: func.tokenizer("gpt-3.5", messages).maxTokens,
        temperature: settings.translator.temprature,
        top_p: settings.translator.top_p,
        frequency_penalty: settings.translator.frequency_penalty,
        presence_penalty: settings.translator.presence_penalty,
      })
      .then(async (response) => {
        const answer = response.choices[0].message.content;
        const usage = response.usage;

        if (answer.length <= 4096) {
          const embed = new Discord.EmbedBuilder()
            .setColor(config.MainColor)
            .setAuthor({
              name:
                question.length > 256
                  ? question.substring(0, 253) + "..."
                  : question,
              iconURL: interaction.user.displayAvatarURL(),
            })
            .setDescription(answer)
            .setFooter({
              text: `Bot desenvolvido por Lourenço e Rodrigo`,
              iconURL: client.user.displayAvatarURL(),
            });

          await interaction.editReply({ embeds: [embed] });
        } else {
          const attachment = new Discord.AttachmentBuilder(
            Buffer.from(`${question}\n\n${answer}`, "utf-8"),
            { name: "response.txt" }
          );
          await interaction.editReply({ files: [attachment] });
        }
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
              iconURL: interaction.user.displayAvatarURL(),
            })
            .setDescription(
              error.response.error.message.length > 4096
                ? error.response.error.message.substring(0, 4093) + "..."
                : error.response.error.message
            );

          await interaction.editReply({ embeds: [embed] }).catch(() => null);
        } else if (error.message) {
          const embed = new Discord.EmbedBuilder()
            .setColor(config.ErrorColor)
            .setAuthor({
              name:
                question.length > 256
                  ? question.substring(0, 253) + "..."
                  : question,
              iconURL: interaction.user.displayAvatarURL(),
            })
            .setDescription(
              error.message.length > 4096
                ? error.message.substring(0, 4093) + "..."
                : error.message
            );

          await interaction.editReply({ embeds: [embed] }).catch(() => null);
        }
      });
  },
};
