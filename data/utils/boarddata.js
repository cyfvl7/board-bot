const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'authors.json');

const postAuthors = new Map();
let lastPostId = 0;

// 🔹 データ読み込み
function loadData() {
  if (!fs.existsSync(filePath)) return;

  const raw = fs.readFileSync(filePath);
  const data = JSON.parse(raw);

  // 投稿者
  if (data.authors) {
    for (const [postId, userId] of Object.entries(data.authors)) {
      postAuthors.set(Number(postId), userId);
    }
  }

  // 投稿ID
  if (data.lastPostId) {
    lastPostId = data.lastPostId;
  }
}

// 🔹 保存
function saveData() {
  const obj = {
    authors: Object.fromEntries(postAuthors),
    lastPostId: lastPostId
  };

  fs.writeFileSync(filePath, JSON.stringify(obj, null, 2));
}

// 🔹 次の投稿ID
function getNextPostId() {
  lastPostId++;
  saveData(); // ←ここで保存される
  return lastPostId;
}

// 🔹 リセット
function resetData() {
  postAuthors.clear();
  lastPostId = 0;
  saveData();
}

module.exports = {
  postAuthors,
  loadData,
  saveData,
  getNextPostId,
  resetData
};