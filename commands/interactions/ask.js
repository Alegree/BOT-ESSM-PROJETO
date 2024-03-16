const Discord = require("discord.js");
const openAI = require("openai");
const chalk = require("chalk");
const fs = require("node:fs");
const func = require("../../utils/functions");
const settings = require("../../utils/settings");
const config = require("../../configs/config.json");

module.exports = {
  data: new Discord.SlashCommandBuilder()
    .setName("perguntar")
    .setDescription("Responde às tuas perguntas!")
    .addStringOption((option) =>
      option
        .setName("prompt")
        .setDescription("Qual é a sua pergunta?")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("model")
        .setDescription(
          "A partir de que modelo pretende perguntar (Predefinição: GPT 3.5)"
        )
        .setChoices(
          {
            name: "GPT-3.5",
            value: "gpt-3.5",
          },
          {
            name: "GPT-4",
            value: "gpt-4",
          }
        )
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("stream")
        .setDescription(
          "Transmite a resposta do bot. (Predefinição: Desativado)"
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
        .setRequired(false)
    ),

  async execute(client, interaction) {
    const ephemeralChoice = interaction.options.getString("ephemeral");
    const ephemeral = ephemeralChoice === "Enable" ? true : false;

    await interaction.deferReply({ ephemeral: ephemeral });

    const streamChoice = interaction.options.getString("stream");
    const stream = streamChoice === "Enable" ? true : false;

    const openai = new openAI.OpenAI({ apiKey: config.OpenAIapiKey });

    const question = interaction.options.getString("prompt");

    const model = interaction.options.getString("model") || "gpt-3.5";
    const modelNames = {
      "gpt-3.5": "gpt-3.5-turbo",
      "gpt-4": "gpt-4",
    };

    const completionPrompt = fs.readFileSync(
      `./utils/prompts/${
        model === "chatgpt" || model === "davinci"
          ? "chatCompletion"
          : "completion"
      }.txt`,
      "utf-8"
    );
    const prompt = completionPrompt
      .replaceAll("{botUsername}", client.user.username)
      .replaceAll("{userUsername}", interaction.user.username)
      .replaceAll("{question}", question);

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

    const completion = await openai.chat.completions
      .create({
        model: modelNames[model],
        messages: messages,
        max_tokens: func.tokenizer(model, messages).maxTokens,
        temperature: settings.completion.temprature,
        top_p: settings.completion.top_p,
        frequency_penalty: settings.completion.frequency_penalty,
        presence_penalty: settings.completion.presence_penalty,
        stream: stream,
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

    if (!stream) {
      const answer = completion.choices[0].message.content;
      const usage = completion.usage;

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
            text: `Esta mensagem custou ${func.pricing(
              model,
              usage.total_tokens
            )}`,
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
    } else {
      let fullAnswer = "";
      let answer = "";

      for await (const part of completion) {
        if (part.choices[0]?.finish_reason === "stop") {
          const fullmessages = [
            {
              role: "system",
              content: prompt,
            },
            {
              role: "user",
              content: question,
            },
            {
              role: "assistant",
              content: fullAnswer,
            },
          ];

          const totalTokens = func.tokenizer(model, fullmessages).tokens;

          if (fullAnswer.length <= 4096) {
            const embed = new Discord.EmbedBuilder()
              .setColor(config.MainColor)
              .setAuthor({
                name:
                  question.length > 256
                    ? question.substring(0, 253) + "..."
                    : question,
                iconURL: interaction.user.displayAvatarURL(),
              })
              .setDescription(fullAnswer)
              .setFooter({
                text: `Costs ${func.pricing(model, totalTokens)}`,
                iconURL: client.user.displayAvatarURL(),
              });

            await interaction.editReply({ embeds: [embed] });
          } else {
            const attachment = new Discord.AttachmentBuilder(
              Buffer.from(
                `${question}\n\n${fullAnswer}\n\nCosts ${func.pricing(
                  model,
                  totalTokens
                )}`,
                "utf-8"
              ),
              { name: "response.txt" }
            );

            await interaction.editReply({ embeds: [], files: [attachment] });
          }
        } else {
          if (answer.includes("\n\n") && fullAnswer.length <= 4096) {
            const embed = new Discord.EmbedBuilder()
              .setColor(config.MainColor)
              .setAuthor({
                name:
                  question.length > 256
                    ? question.substring(0, 253) + "..."
                    : question,
                iconURL: interaction.user.displayAvatarURL(),
              })
              .setDescription(fullAnswer)
              .setFooter({
                text: `Writing...`,
                iconURL: client.user.displayAvatarURL(),
              });

            await interaction.editReply({ embeds: [embed] });

            answer = "";

            await func.delay(5000);
          }

          answer += part.choices[0]?.delta?.content || "";
          fullAnswer += part.choices[0]?.delta?.content || "";
        }
      }
    }
  },
};
