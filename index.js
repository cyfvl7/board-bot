require("dotenv").config();

const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

// ===== 機能読み込み =====
require("./events/voiceState")(client);

// ===== Bot起動 =====
client.once("clientReady", () => {
  console.log(`ログイン: ${client.user.tag}`);
  console.log("通話Bot起動完了");
});

client.login(process.env.DISCORD_TOKEN);