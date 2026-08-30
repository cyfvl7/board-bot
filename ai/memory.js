const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "memory.json");

function loadMemory() {
  if (!fs.existsSync(FILE)) return {};
  return JSON.parse(fs.readFileSync(FILE, "utf-8"));
}

function saveMemory(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

function resetUserMemory(userId) {
  const memory = loadMemory();

  if (memory[userId]) {
    delete memory[userId];
    saveMemory(memory);
    return true;
  }

  return false;
}

module.exports = { loadMemory, saveMemory, resetUserMemory };