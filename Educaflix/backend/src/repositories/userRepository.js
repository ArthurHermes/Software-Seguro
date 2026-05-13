const { readDatabase, writeDatabase } = require("../database/jsonDatabase");

function publicUser(user) {
  if (!user) return null;
  const { senhaHash, senhaSalt, ...safeUser } = user;
  return safeUser;
}

function findAllUsers() {
  return readDatabase().users.map(publicUser);
}

function findUserByEmail(email) {
  return readDatabase().users.find((user) => user.email === String(email || "").toLowerCase()) || null;
}

function findUserById(id) {
  return readDatabase().users.find((user) => user.id === id) || null;
}

function createUser(user) {
  const db = readDatabase();
  db.users.push(user);
  writeDatabase(db);
  return publicUser(user);
}

function updateUserStatus(id, status) {
  const db = readDatabase();
  const user = db.users.find((item) => item.id === id);
  if (!user) return null;

  user.status = status;
  user.atualizadoEm = new Date().toISOString();
  writeDatabase(db);
  return publicUser(user);
}

module.exports = {
  createUser,
  findAllUsers,
  findUserByEmail,
  findUserById,
  publicUser,
  updateUserStatus
};
