const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { getCurrency, setCurrency } = require('../data/utils/users');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('減額')
    .setDescription('ユーザーのコインを減らします（管理者専用）')
    .addUserOption(option =>
      option
        .setName('ユーザー')
        .setDescription('対象ユーザー')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('種類')
        .setDescription('減らすコインの種類')
        .setRequired(true)
        .addChoices(
          { name: 'ギルドコイン', value: 'guild' },
          { name: 'カジノコイン', value: 'casino' }
        )
    )
    .addIntegerOption(option =>
      option
        .setName('枚数')
        .setDescription('減らす枚数')
        .setRequired(true)
        .setMinValue(1)
    ),

  async execute(interaction) {
    // 管理者チェック
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({
        content: '❌ このコマンドは管理者専用です',
        ephemeral: true
      });
    }

    const target = interaction.options.getUser('ユーザー');
    const type = interaction.options.getString('種類');
    const amount = interaction.options.getInteger('枚数');

    const current = getCurrency(target.id, type) ?? 0;
    const newAmount = Math.max(0, current - amount);

    setCurrency(target.id, newAmount, type);

    await interaction.reply({
      content:
        `➖ **コイン減額完了**\n` +
        `👤 対象: ${target.username}\n` +
        `💰 種類: ${type === 'casino' ? 'カジノコイン' : 'ギルドコイン'}\n` +
        `📉 減額: ${amount}\n` +
        `💎 現在残高: ${newAmount}`,
      ephemeral: false
    });
  }
};
