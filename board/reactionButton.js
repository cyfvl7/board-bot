const {

  ActionRowBuilder,

  ButtonBuilder,

  ButtonStyle,

} = require("discord.js");

// ===== 設定 =====

const CHANNEL_ID = "1543691293060898837";

// ボタンとロールの設定

const ROLES = [

  {

    id: "1543690407249190972",

    name: "掲示板",

  },
  {

    id: "1543700872499040396",  

    name: "ゲーム",
}];

const BUTTON_PREFIX = "role_";

module.exports = (client) => {

  // ===== Bot起動時にボタンを設置 =====

  client.once("ready", async () => {

    try {

      const channel = await client.channels.fetch(CHANNEL_ID);

      if (!channel) {

        console.log("❌ チャンネルが見つかりません");

        return;

      }

      // ボタン作成

      const buttons = ROLES.map((role) =>

        new ButtonBuilder()

          .setCustomId(`${BUTTON_PREFIX}${role.id}`)

          .setLabel(role.name)

          .setStyle(ButtonStyle.Primary)

      );

      // 5個ずつ行に分ける

      const rows = [];

      for (let i = 0; i < buttons.length; i += 5) {

        rows.push(

          new ActionRowBuilder().addComponents(

            buttons.slice(i, i + 5)

          )

        );

      }

      await channel.send({

        content: "取得したいロールを選択してください。",

        components: rows,

      });

      console.log("✅ ロールボタンを設置しました");

    } catch (error) {

      console.error("❌ ボタン設置エラー:", error);

    }

  });
  // ===== ボタンを押したとき =====

  client.on("interactionCreate", async (interaction) => {

    if (!interaction.isButton()) return;

    if (!interaction.customId.startsWith(BUTTON_PREFIX)) {

      return;

    }

    try {

      const roleId = interaction.customId.replace(BUTTON_PREFIX, "");

      const role = interaction.guild.roles.cache.get(roleId);

      if (!role) {

        return interaction.reply({

          content: " ロールが見つかりません。",

          flags: 64,

        });

      }

      const member = await interaction.guild.members.fetch(

        interaction.user.id

      );

      // すでに持っている場合

      if (member.roles.cache.has(roleId)) {

        await member.roles.remove(role);

        return interaction.reply({

          content: `「${role.name}」を外しました。`,

          flags: 64,

        });

      }

      // ロール付与

      await member.roles.add(role);

      await interaction.reply({

        content: ` 「${role.name}」を付与しました！`,

        flags: 64,

      });

    } catch (error) {

      console.error("❌ ロール付与エラー:", error);

      if (!interaction.replied) {

        await interaction.reply({

          content: "❌ ロールの付与に失敗しました。",

          flags: 64,

        });

      }

    }

  });

};