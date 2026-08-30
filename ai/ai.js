const axios = require("axios");
const { loadMemory, saveMemory } = require("./memory");

const API_URL = "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium";

const headers = {
  Authorization: `Bearer ${process.env.HF_API_KEY}`,
};

const MAX_HISTORY = 6;

async function askAI(userId, userText) {
  console.log("=== AI開始 ===");
  console.log("ユーザー:", userId);
  console.log("入力:", userText);

  let memory = loadMemory();

  if (!memory[userId]) memory[userId] = [];

  const systemPrompt = "あなたは日本語で答えるフレンドリーなAIです。短く自然に返答してください。";

  // ユーザー発言
  memory[userId].push(`User: ${userText}`);

  if (memory[userId].length > MAX_HISTORY) {
    memory[userId].shift();
  }

  const prompt = systemPrompt + "\n" + memory[userId].join("\n") + "\nAI:";

  console.log("プロンプト:");
  console.log(prompt);

  try {
    const response = await axios.post(
      API_URL,
      { inputs: prompt },
      { headers }
    );

    console.log("APIレスポンス:", response.data);

    let raw = response.data;

    let reply =
      raw.generated_text ||
      (Array.isArray(raw) ? raw[0]?.generated_text : null);

    if (!reply) reply = "うまく答えられなかった";

    reply = reply.split("AI:").pop().trim();
    reply = reply.slice(0, 100);

    if (memory[userId].includes(`AI: ${reply}`)) {
      reply = "もう一回";
    }

    memory[userId].push(`AI: ${reply}`);
    saveMemory(memory);

    console.log("最終返答:", reply);
    console.log("=== AI終了 ===");

    return reply;
  } catch (err) {
    console.error("AIエラー詳細:", err.response?.data || err.message);
    return "AIエラー";
  }
}

module.exports = { askAI };