require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

const history = new Map();

module.exports = async (message) => {
  if (message.author.bot) return;

  // ❗ここが重要：メンションされた時だけ動く
  if (!message.mentions.has(message.client.user)) return;

  const userId = message.author.id;
  const text = message.content;

  console.log("① メンション検知:", text);

  if (!history.has(userId)) {
    history.set(userId, []);
  }

  const userHistory = history.get(userId);
  userHistory.push(`User: ${text}`);

  const input = userHistory.slice(-5).join("\n");

  try {
    console.log("② Gemini送信");

    const result = await model.generateContent(input);
    const response = await result.response;
    let reply = response.text();

    console.log("③ 返信:", reply);

    userHistory.push(`Bot: ${reply}`);

    await message.reply(reply);

    console.log("④ 完了");

  } catch (err) {
    console.error("❌ Geminiエラー:", err.message || err);
    await message.reply("AIエラーが発生しました");
  }
};