const { ApplicationCommandOptionType } = require('discord.js');
const { resetData } = require('../data/utils/boarddata');

const ALLOWED_USER_ID = "1501514335766446090";//ここ権限

module.exports = (client) => {

  client.once('ready', async () => {
    const guild = client.guilds.cache.first();

    await guild.commands.create({
      name: 'reset',
      description: '掲示板データを全削除（管理者専用）'
    });

    console.log('✅ /reset 登録');
  });

  client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName !== 'reset') return;

    // 🔐 使用制限
    if (interaction.user.id !== ALLOWED_USER_ID) {
      return interaction.reply({
        content: 'このコマンドは使用できません',
        flags: 64
      });
    }

    // 実行
    resetData();

    return interaction.reply({
      content: '掲示板データをリセットしました',
      flags: 64
    });
  });
};