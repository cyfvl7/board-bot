const {
  ActionRowBuilder,
  ButtonBuilder,
ButtonStyle,
ModalBuilder,
  TextInputBuilder,
TextInputStyle,
} = require('discord.js');

const {
  postAuthors,
  saveData,
  getNextPostId
} = require('../data/utils/boarddata');
const BOARD_CHANNEL_ID = '1543654097012658287';
let boardMessageId = null;
module.exports = (client) => {
  const boardRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('board_anon')
      .setLabel('匿名')
.setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('board_name')
      .setLabel('非匿名')
.setStyle(ButtonStyle.Secondary)
  );
  const isImageUrl = (url) => /^https?:\/\/.+$/i.test(url);
client.once('ready', async () => {
try {
      const channel = await client.channels.fetch(BOARD_CHANNEL_ID);
      const msg = await channel.send({ components: [boardRow] });
      boardMessageId = msg.id;
    } catch (err) {
      console.error('掲示板チャンネルエラー:', err);
    }
  });
  client.on('interactionCreate', async (interaction) => {
    // ボタン
    if (interaction.isButton() && interaction.customId.startsWith('board_')) {
      const modal = new ModalBuilder()
        .setCustomId(`boardModal_${interaction.customId}`)
        .setTitle('掲示板投稿');
      const contentInput = new TextInputBuilder()
        .setCustomId('content')
        .setLabel('投稿内容')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(false);
      const imageInput = new TextInputBuilder()
        .setCustomId('image')
        .setLabel('画像URL')
        .setStyle(TextInputStyle.Short)
        .setRequired(false);
      modal.addComponents(
        new ActionRowBuilder().addComponents(contentInput),
        new ActionRowBuilder().addComponents(imageInput)
      );
      return interaction.showModal(modal);
    }
    // 投稿処理
    if (interaction.isModalSubmit() && interaction.customId.startsWith('boardModal_')) {
      const postId = getNextPostId(); //  永続ID
      const content = interaction.fields.getTextInputValue('content');
      const imageUrl = interaction.fields.getTextInputValue('image');
      const isAnon = interaction.customId.includes('anon');
      const name = isAnon ? '匿名' : interaction.user.username;
      if (!content && !imageUrl) {
        return interaction.reply({
          content: '投稿内容または画像URLを入力してください',
          flags: 64
        });
      }
      if (imageUrl && !isImageUrl(imageUrl)) {
        return interaction.reply({
          content: '画像URLが不正です',
          flags: 64
        });
      }
      let channel;
      try {
        channel = await client.channels.fetch(BOARD_CHANNEL_ID);
      } catch {
        return interaction.reply({
          content: 'チャンネル取得失敗',
          flags: 64
        });
      }
      const embed = { color: 0x2b2d31 };
      embed.description = content
        ? `${postId}：${name}\n${content}`
        : `${postId}：${name}`;
      if (imageUrl) embed.image = { url: imageUrl };
      await channel.send({ embeds: [embed] });
      //  匿名保存yJSONy
      if (isAnon) {
        postAuthors.set(postId, interaction.user.id);
        saveData();
      }
      // ボタン更新
      if (boardMessageId) {
        try {
          const oldMsg = await channel.messages.fetch(boardMessageId);
          await oldMsg.delete();
        } catch {}
      }
      const newMsg = await channel.send({ components: [boardRow] });
      boardMessageId = newMsg.id;
      return interaction.reply({
        content: '投稿しました',
        flags: 64
      });
    }
  });
};