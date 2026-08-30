const fs = require('fs');
const path = require('path');

const usersFile = path.join(__dirname, '../users.json');

function loadUsers() {
  if (!fs.existsSync(usersFile)) {
    fs.writeFileSync(usersFile, '{}', 'utf8');
  }
  const data = fs.readFileSync(usersFile, 'utf8');
  return JSON.parse(data || '{}');
}

function saveUsers(users) {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2), 'utf8');
}

function getUser(users, userId) {
  if (!users[userId]) {
    users[userId] = { guild: 0, casino: 0 };
  }
  return users[userId];
}

function getCurrency(userId, type = 'guild') {
  const users = loadUsers();
  return getUser(users, userId)[type];
}

function addCurrency(userId, amount, type = 'guild') {
  const users = loadUsers();
  getUser(users, userId)[type] += amount;
  saveUsers(users);
}

function setCurrency(userId, amount, type = 'guild') {
  const users = loadUsers();
  getUser(users, userId)[type] = amount;
  saveUsers(users);
}

module.exports = {
  getCurrency,
  addCurrency,
  setCurrency,
};
