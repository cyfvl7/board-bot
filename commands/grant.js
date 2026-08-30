const { SlashCommandBuilder } = require('discord.js');
const { addCurrency } = require('../data/utils/users');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('付与')
    .setDescription('ユーザーにコインを付与します（管理者用）')
    .addUserOption(option =>
      option.setName('ユーザー')
            .setDescription('付与するユーザー')
            .setRequired(true))
    .addIntegerOption(option =>
      option.setName('金額')
            .setDescription('付与する金額')
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
    // 管理者チェック（任意）
    if (!interaction.member.permissions.has('Administrator')) {
      return interaction.reply({ content: '管理者権限が必要です', ephemeral: true });
    }

    const user = interaction.options.getUser('ユーザー');
    const amount = interaction.options.getInteger('金額');
    const type = interaction.options.getString('種類');

    if (amount <= 0) return interaction.reply({ content: '付与額は1以上にしてください', ephemeral: true });

    addCurrency(user.id, amount, type);

    await interaction.reply({ content: `✅ ${user.username} に ${amount} ${type === 'guild' ? 'ギルドコイン' : 'カジノコイン'} を付与しました`, ephemeral: true });
  },
};
