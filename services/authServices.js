const sqlite3 = require('sqlite3').verbose();
const util = require('util');

const db = new sqlite3.Database('comments.db');
const dbGet = util.promisify(db.get).bind(db);
const dbRun = util.promisify(db.run).bind(db);

async function insertNewUser(name, passwordHashed, salt) {
  const sql = `INSERT INTO users (name, passwordHashed, salt) VALUES (?, ?, ?)`;
  db.run(sql, [name, passwordHashed, salt], (err) => {
    if (err) {
      console.error('Error inserting new user:', err);
    } else {
      console.log('New user inserted successfully');
    }
  });
}

async function checkIfUserExists(name) {
  try {
    const sql = `SELECT * FROM users WHERE name = ?`;
    const user = await dbGet(sql, [name]);

    return user; 
  } catch (error) {
    console.error('Error finding user by name:', error);
    throw error; 
  }
}

async function insertSessionId(userId, sessionId) {
  const sql = `INSERT INTO sessions (user_id, session_id) VALUES (?, ?)`;
  await dbRun(sql, [userId, sessionId]);
}

async function deleteSessionId(sessionId) {
  try {
    const sql = `DELETE FROM sessions WHERE session_id = ?`;
    await dbRun(sql, sessionId);
    console.log(`Session with session_id ${sessionId} deleted successfully`);
  } catch (error) {
    console.error('Error deleting session:', error);
    throw error;
  }
}

async function getSessionBySessionId(sessionId) {
  try {
    const sql = 'SELECT sessions.session_id, users.name as username FROM sessions JOIN users ON sessions.user_id = users.id WHERE sessions.session_id = ?';
    const result = await dbGet(sql, [sessionId]);
    return result; 
  } catch (error) {
    console.error('Error finding session by sessionId:', error);
    throw error;
  }
}

module.exports = { insertNewUser, checkIfUserExists, insertSessionId, deleteSessionId, getSessionBySessionId };