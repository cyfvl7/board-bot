console.log("reveal.js 読み込み成功");

const { ApplicationCommandOptionType } = require('discord.js');
const { postAuthors } = require('../data/utils/boarddata'); 

module.exports = (client) => {
  client.once('ready', async () => {
  console.log("reveal ready実行");
    
    if (!client.guilds.cache.size) return;
    const guild = client.guilds.cache.first();

    await guild.commands.create({
      name: 'reveal',
      description: '匿名投稿の投稿者を開示',
      options: [
        {
          name: 'postid',
          description: '投稿番号',
          type: ApplicationCommandOptionType.Integer,
          required: true,
        },
      ],
    });

    console.log('✅ /reveal 登録');
  });

  client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName !== 'reveal') return;

    const ALLOWED_USER_ID = "1501514335766446090";//ここ権限

    if (interaction.user.id !== ALLOWED_USER_ID) {
      return interaction.reply({
        content: 'このコマンドは使用できません。',
        flags: 64
      });
    }

    const postId = interaction.options.getInteger('postid');
    const userId = postAuthors.get(postId);

    console.log('取得userId:', userId);

    if (!userId) {
      return interaction.reply({
        content: `投稿 ${postId} は見つかりません`,
        flags: 64
      });
    }

    try {
      const user = await interaction.client.users.fetch(userId);

      return interaction.reply({
        content: `🕵️ ${user.username} (${user.id})`,
        flags: 64
      });

    } catch (err) {
      console.error(err);
      return interaction.reply({
        content: '取得失敗',
        flags: 64
      });
    }
  });
};