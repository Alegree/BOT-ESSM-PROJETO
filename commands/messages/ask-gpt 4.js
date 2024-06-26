const Discord = require("discord.js");
const openAI = require("openai");
const chalk = require("chalk");
const fs = require("node:fs");
const func = require("../../utils/functions");
const settings = require("../../utils/settings");
const config = require("../../configs/config.json");

module.exports = {
  name: "Perguntar2",
  aliases: ["A2", "GPT4", "GPT-4"],
  description:
    "Responde às tuas perguntas utilizando o modelo __GPT-4__! **(Mais inteligente)**",

  async execute(client, message, args, cmd) {
    await message.channel.sendTyping();

    if (!args[0]) {
      const embed = new Discord.EmbedBuilder()
        .setColor(config.ErrorColor)
        .setTitle("Error")
        .setDescription(
          `Não podes usar o comando \`${cmd}\` como este, é necessário fornecer algo como o exemplo\n\`\`\`\n${config.Prefix}${cmd} Explicar os loops em JavaScript.\n\`\`\``
        );

      await message.reply({ embeds: [embed] });
    } else {
      const openai = new openAI.OpenAI({ apiKey: config.OpenAIapiKey });

      const question = args.join(" ");

      const completionPrompt = fs.readFileSync(
        "./utils/prompts/completion.txt",
        "utf-8"
      );
      const prompt = completionPrompt.replaceAll(
        "{botUsername}",
        client.user.username
      );
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
          model: "gpt-4",
          messages: messages,
          max_tokens: func.tokenizer("gpt-4", messages).maxTokens,
          temperature: settings.completion.temprature,
          top_p: settings.completion.top_p,
          frequency_penalty: settings.completion.frequency_penalty,
          presence_penalty: settings.completion.presence_penalty,
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
                iconURL: message.author.displayAvatarURL(),
              })
              .setDescription(answer)
              .setFooter({
                text: `Bot desenvolvido por Lourenço e Rodrigo`,
                iconURL: client.user.displayAvatarURL(),
              });

            await message.reply({ embeds: [embed] });
          } else {
            const attachment = new Discord.AttachmentBuilder(
              Buffer.from(`${question}\n\n${answer}`, "utf-8"),
              { name: "response.txt" }
            );

            await message.reply({ files: [attachment] });
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
    }
  },
};
