import sqlite3 from 'sqlite3';
import util from 'util';

const db = new sqlite3.Database('comments.db');
const dbGet = util.promisify(db.get).bind(db);
const dbRun = util.promisify(db.run).bind(db);

export async function insertNewUser(name, passwordHashed, salt) {
  const sql = `INSERT INTO users (name, passwordHashed, salt) VALUES (?, ?, ?)`;
  db.run(sql, [name, passwordHashed, salt], (err) => {
    if (err) {
      console.error('Error inserting new user:', err);
    } else {
      console.log('New user inserted successfully');
    }
  });
}

export async function checkIfUserExists(name) {
  try {
    const sql = `SELECT * FROM users WHERE name = ?`;
    const user = await dbGet(sql, [name]);

    return user; 
  } catch (error) {
    console.error('Error finding user by name:', error);
    throw error; 
  }
}
export async function insertSessionId(userId, sessionId) {
  const sql = `INSERT INTO sessions (user_id, session_id) VALUES (?, ?)`;
  await dbRun(sql, [userId, sessionId]);
}


export async function deleteSessionId(sessionId) {
  try {
    const sql = `DELETE FROM sessions WHERE session_id = ?`;
    await dbRun(sql, sessionId);
    console.log(`Session with session_id ${sessionId} deleted successfully`);
  } catch (error) {
    console.error('Error deleting session:', error);
    throw error;
  }
}

export async function getSessionBySessionId(sessionId) {
  try {
    const sql = `SELECT * FROM sessions WHERE session_id = ?`;
    const session = await dbGet(sql, [sessionId]);
    return session;
  } catch (error) {
    console.error('Error finding session by sessionId:', error);
    throw error;
  }
}