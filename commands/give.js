const { SlashCommandBuilder } = require('discord.js');
const { getCurrency, addCurrency } = require('../data/utils/users');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('送金')
    .setDescription('ギルドコインまたはカジノコインを送金します')
    .addUserOption(option =>
      option.setName('ユーザー')
            .setDescription('送金先のユーザー')
            .setRequired(true))
    .addIntegerOption(option =>
      option.setName('金額')
            .setDescription('送金する金額')
            .setRequired(true))
    .addStringOption(option =>
      option.setName('種類')
            .setDescription('guild = ギルドコイン, casino = カジノコイン')
            .setRequired(true)
            .addChoices(
              { name: 'ギルドコイン', value: 'guild' },
              { name: 'カジノコイン', value: 'casino' }
            )),

  async execute(interaction) {
    const fromUser = interaction.user;
    const toUser = interaction.options.getUser('ユーザー');
    const amount = interaction.options.getInteger('金額');
    const type = interaction.options.getString('種類');

    if (amount <= 0) return interaction.reply({ content: '送金額は1以上にしてください', ephemeral: true });

    const senderBalance = getCurrency(fromUser.id, type);

    if (senderBalance < amount) {
      return interaction.reply({ content: '残高が不足しています', ephemeral: true });
    }

    addCurrency(fromUser.id, -amount, type);
    addCurrency(toUser.id, amount, type);

    await interaction.reply({ content: `✅ ${toUser.username} に ${amount} ${type === 'guild' ? 'ギルドコイン' : 'カジノコイン'} を送金しました`, ephemeral: true });
  },
};
