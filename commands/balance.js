const { SlashCommandBuilder } = require('discord.js');
const { getCurrency } = require('../data/utils/users');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('残高確認')
    .setDescription('自分または指定ユーザーのコイン残高を確認します')
    .addUserOption(option =>
      option
        .setName('ユーザー')
        .setDescription('残高を確認するユーザー')
        .setRequired(false)
    ),

  async execute(interaction) {
    const target = interaction.options.getUser('ユーザー') || interaction.user;

    // ここで 0 をデフォルトとして返す
    const guildCoin = getCurrency(target.id, 'guild') ?? 0;
    const casinoCoin = getCurrency(target.id, 'casino') ?? 0;

    const content = `💰 **${target.username}** さんの残高:
- ギルドコイン: **${guildCoin}**
- カジノコイン: **${casinoCoin}**`;

    await interaction.reply({
      content,
      ephemeral: true, // 自分だけに見えるように
    });
  },
};
