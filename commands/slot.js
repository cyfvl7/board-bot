const { SlashCommandBuilder } = require('discord.js');
const { getCurrency, addCurrency, setCurrency } = require('../data/utils/users');

const USERS = {}; // 確変状態管理

// =====================
// 確率テーブル
// =====================

// 通常モード：先に「役」を決める
const NORMAL_ROLES = {
  '7':   [1, 319], // ボーナス
  '🔔': [1, 20],
  '🍉': [1, 15],
  '🍒': [1, 50],   // 左チェリー
  'ばー': [1, 250],
  '⏮️': [1, 20],    // リプレイ
  'はずれ': [192883, 239250]
};

// 確変中（3つ揃い確定）
const HYPER_MODE_ROLES = {
  '7': [29, 500],
  '🔔': [471, 500]
};

// はずれ用表示リール
const MISS_SYMBOLS = ['🔔','🍉','7','🤡','ばー','🍉','🍒','⏮️'];

// 抽選系ユーティリティ

function pickRole(probabilities) {
  const rnd = Math.random();
  let sum = 0;
  let total = 0;

  for (const [_, [num, den]] of Object.entries(probabilities)) {
    total += num / den;
  }

  for (const [symbol, [num, den]] of Object.entries(probabilities)) {
    sum += (num / den) / total;
    if (rnd < sum) return symbol;
  }

  return Object.keys(probabilities)[0];
}

function pickNormalRole() {
  return pickRole(NORMAL_ROLES);
}

function pickMissSymbols(count = 3) {
  return Array.from({ length: count }, () =>
    MISS_SYMBOLS[Math.floor(Math.random() * MISS_SYMBOLS.length)]
  );
}

function makeWinningReels(role) {
  // 左チェリー
  if (role === '🍒') {
    return [
      '🍒',
      MISS_SYMBOLS[Math.floor(Math.random() * MISS_SYMBOLS.length)],
      MISS_SYMBOLS[Math.floor(Math.random() * MISS_SYMBOLS.length)]
    ];
  }

  // 3つ揃い
  return [role, role, role];
}

function makeLosingReels() {
  while (true) {
    const reels = pickMissSymbols(3);

    const allSame = reels.every(s => s === reels[0]);
    const cherry = reels[0] === '🍒';

    // 役成立を完全回避
    if (!allSame && !cherry) return reels;
  }
}

// =====================
// コマンド本体
// =====================

module.exports = {
  data: new SlashCommandBuilder()
    .setName('スロット')
    .setDescription('カジノコインでスロットを回します')
    .addIntegerOption(option =>
      option.setName('ベット')
        .setDescription('ベットするカジノコインの枚数')
        .setRequired(true)
    ),

  async execute(interaction) {
    const userId = interaction.user.id;
    let bet = interaction.options.getInteger('ベット');

    if (!USERS[userId]) {
      USERS[userId] = { 確変: false, 残転: 0, 確変ベット: 0, 連荘: 0 };
    }
    const userData = USERS[userId];

    // 確変中はベット固定
    if (userData.確変 && userData.残転 > 0) {
      bet = userData.確変ベット;
    } else {
      userData.確変ベット = bet;
    }

    let casinoCoin = getCurrency(userId, 'casino') ?? 0;
    if (casinoCoin < bet) {
      return interaction.reply({ content: `カジノコインが足りません。所持: ${casinoCoin}`, ephemeral: true });
    }

    setCurrency(userId, casinoCoin - bet, 'casino');

    let reels = [];
    let win = 0;
    let msg = '';
    let modeText = '';

    // =====================
    // 確変モード
    // =====================
    if (userData.確変 && userData.残転 > 0) {
      const role = pickRole(HYPER_MODE_ROLES);
      reels = [role, role, role];

      userData.残転--;

      if (role === '7') {
        win = bet * 1;
        msg = '🎉 ボーナス継続！';
        userData.残転 = 20;
        userData.連荘++;
      } else {
        win = bet * 5;
        msg = '🔔 ベル！';
      }

      modeText = `🔥 確変中｜残り ${userData.残転} 回｜連荘: ${userData.連荘}`;
    }

    // =====================
    // 通常モード
    // =====================
    else {
      const role = pickNormalRole();

      if (role === 'はずれ') {
        reels = makeLosingReels();
        msg = 'はずれ';
        win = 0;
      } else {
        reels = makeWinningReels(role);

        switch (role) {
          case '7':
            win = bet * 1;
            msg = '🎉 ボーナス！';
            userData.確変 = true;
            userData.残転 = 20;
            userData.確変ベット = bet;
            userData.連荘 = 1;
            break;
          case '🔔':
            win = bet * 5;
            msg = '🔔 ベル！';
            break;
          case '🍉':
            win = bet * 3;
            msg = '🍉 スイカ！';
            break;
          case '🍒':
            win = bet * 0.6;
            msg = '🍒 チェリー！';
            break;
          case 'ばー':
            win = bet * 20;
            msg = '🏆 バー！';
            break;
          case '⏮️':
            win = bet * 1;
            msg = '⏮️ リプレイ！';
            break;
        }
      }

      modeText = '通常モード';
    }

    if (win > 0) addCurrency(userId, win, 'casino');

    const remaining = getCurrency(userId, 'casino');

    await interaction.reply({
      content:
        `🎰 **${interaction.user.username}** のスロット結果\n` +
        `${reels.join(' | ')}\n` +
        `${msg}${win > 0 ? `\n💰 ${win} コイン獲得！` : ''}\n` +
        `💎 残り: ${remaining}\n` +
        `🌀 状態: ${modeText}`,
      ephemeral: false
    });
  }
};
