import sqlite3 from 'sqlite3';
import util from 'util';

const db = new sqlite3.Database('comments.db');
const dbRun = util.promisify(db.run).bind(db);
const dbGet = util.promisify(db.get).bind(db);
const dbAll = util.promisify(db.all).bind(db);

export async function insertNewComment(comments) {
  const insertedCommentIds = [];
  for (const { comment, name } of comments) {
    try {
      const existingName = await dbGet('SELECT id FROM users WHERE name = ?', [name]);
      let userId;
      if (existingName) {
        userId = existingName.id;
      } else {
        const result = await dbRun('INSERT INTO users (name) VALUES (?)', [name]);
        userId = result.lastID;
      }
      const sql = `INSERT INTO comments (comment, time_added, user_id) VALUES (?, datetime('now'), ?)`;
      await dbRun(sql, [comment, userId]);
      const result = await dbGet(`SELECT last_insert_rowid() as lastID`);
      if (result) {
        insertedCommentIds.push(result.lastID);
      }
    } catch (error) {
      console.error("Error inserting comment:", error);
    }
  }
  return insertedCommentIds;
}



export async function readLastComment () {
  const lastCommentSql = `SELECT c.comment, c.time_added, n.name 
                          FROM comments c 
                          INNER JOIN users n ON c.user_id = n.id
                          ORDER BY c.id DESC LIMIT 1`;
  const row = await dbGet(lastCommentSql);
  return row;
}

export async function readComments (limit, offset) {
  const sql = `SELECT c.id, c.comment, c.time_added, n.name 
                FROM comments c 
                INNER JOIN users n ON c.user_id = n.id
                LIMIT ? OFFSET ?`;
  const rows = await dbAll(sql, [limit, offset]);
  
  return rows;
}

export async function getLimitComments (limit) {
  const totalRows = await dbGet('SELECT COUNT(*) as count FROM comments');
  const totalPages = Math.ceil(totalRows.count / limit);
  return totalPages;
}

export async function getCommentWithId(id) {
  const sql = `SELECT c.id, c.comment, c.time_added, n.name 
                FROM comments c 
                INNER JOIN users n ON c.user_id = n.id
                WHERE c.id = ?`;
  const data = await dbGet(sql, [id]);
  return data;
}

export async function deleteCommentById(id) {
  const sql = `DELETE FROM comments WHERE id = ?`;
  await dbRun(sql, [id]);
}

export async function updateCommentTextById(id, newCommentText) {
  const sql = `UPDATE comments SET comment = ? WHERE id = ?`;
  await dbRun(sql, [newCommentText, id]);
}
