const Discord = require("discord.js");
const openAI = require("openai");
const chalk = require("chalk");
const fs = require("node:fs");
const func = require("../../utils/functions");
const settings = require("../../utils/settings");
const config = require("../../configs/config.json");

module.exports = {
  data: new Discord.SlashCommandBuilder()
    .setName("otimizar")
    .setDescription(
      "Otimiza a tua imaginação para obter uma melhor resposta ao desenhar!"
    )
    .addStringOption((option) =>
      option
        .setName("prompt")
        .setDescription("O que é estas a imaginar?")
        .setRequired(true)
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

    const optimizerPrompt = fs.readFileSync(
      "./utils/prompts/optimizer.txt",
      "utf-8"
    );
    const prompt = optimizerPrompt + question + ".";

    const messages = [
      {
        role: "user",
        content: prompt,
      },
    ];

    openai.chat.completions
      .create({
        model: "gpt-3.5-turbo",
        messages: messages,
        max_tokens: func.tokenizer("gpt-3.5", messages).maxTokens,
        temperature: settings.optimzer.temprature,
        top_p: settings.optimzer.top_p,
        frequency_penalty: settings.optimzer.frequency_penalty,
        presence_penalty: settings.optimzer.presence_penalty,
      })
      .then(async (response) => {
        const answer = response.choices[0].message.content
          .replace("Prompt otimuizado:", "")
          .replace("prompt otimizado:", "")
          .replace("Output otimizado:", "")
          .replace("output otimizado:", "")
          .replace("Output:", "")
          .replace("output:", "");

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
