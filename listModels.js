require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function list() {
  try {
    const models = await genAI.listModels();
    console.log("=== モデル一覧 ===");
    console.log(models);
  } catch (err) {
    console.error("エラー:", err);
  }
}

list();