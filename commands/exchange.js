const { SlashCommandBuilder } = require('discord.js');
const { getBalance, addBalance } = require('../data/utils/users');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('コイン交換')
    .setDescription('ギルドコインとカジノコインを交換します')
    .addStringOption(option =>
      option
        .setName('方向')
        .setDescription('交換の方向を選んでください')
        .setRequired(true)
        .addChoices(
          { name: 'ギルド → カジノ', value: 'g2c' },
          { name: 'カジノ → ギルド', value: 'c2g' }
        )
    )
    .addIntegerOption(option =>
      option
        .setName('金額')
        .setDescription('交換する金額')
        .setRequired(true)
    ),

  async execute(interaction) {
    const userId = interaction.user.id;
    const direction = interaction.options.getString('方向');
    const amount = interaction.options.getInteger('金額');

    if (amount <= 0) {
      return interaction.reply({
        content: '金額は1以上を指定してください',
        ephemeral: true,
      });
    }

    if (direction === 'g2c') {
      if (getBalance(userId, 'guild') < amount) {
        return interaction.reply({
          content: 'ギルドコインが足りません',
          ephemeral: true,
        });
      }
      addBalance(userId, -amount, 'guild');
      addBalance(userId, amount, 'casino');
    }

    if (direction === 'c2g') {
      if (getBalance(userId, 'casino') < amount) {
        return interaction.reply({
          content: 'カジノコインが足りません',
          ephemeral: true,
        });
      }
      addBalance(userId, -amount, 'casino');
      addBalance(userId, amount, 'guild');
    }

    await interaction.reply('💱 コイン交換が完了しました');
  },
};
