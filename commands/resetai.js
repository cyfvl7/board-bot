const { SlashCommandBuilder } = require("discord.js");
const { resetUserMemory } = require("../ai/memory");

module.exports = {
    data:new SlashCommandBuilder()
      .setName("resetai")
      .setDescription("AI記憶をリセットします"),

    async execute(interaction) {
        const userId = interaction.user.id;

        const result = resetUserMemory(userId);

        if (result) {
          await interaction.reply("AIno記憶をリセットしました");
        } else {
          await interaction.reply("リセットする記憶がありません");
        }
    },
};