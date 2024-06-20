import db from '#root/bot/db.js';

export interface MyUser {
  userId: number;
  firstName: string;
  lastName?: string;
  username?: string;
}

export interface MyMessage {
  userId: number;
  fileId: string;
  caption?: string;
}

export interface ShareMessage {
    id: number;
    file_id: string;
    user_id: number;
    caption: string;
    first_name: string;
    last_name: string;
    username: string;
}

export function addUser(user: MyUser) {
  const stmt = db.prepare('INSERT OR IGNORE INTO users (user_id, first_name, last_name, username) VALUES (?, ?, ?, ?)');
  stmt.run(user.userId, user.firstName, user.lastName, user.username);
}

export function addMessage(message: MyMessage) {
  const stmt = db.prepare('INSERT INTO messages (user_id, file_id, caption) VALUES (?, ?, ?)');
  stmt.run(message.userId, message.fileId, message.caption);
}

export function getUserMessages(userId: number) {
  const stmt = db.prepare('SELECT * FROM messages WHERE user_id = ?');
  return stmt.all(userId);
}

export function getUserMessagesWithPhotos(userId: number) {
  const stmt = db.prepare('SELECT * FROM messages WHERE user_id = ? AND file_id IS NOT NULL');
  return stmt.all(userId);
}

export function getOldestMessages(limit = 10, offset = 0): ShareMessage[] {
    const stmt = db.prepare(`
      SELECT m.id, m.file_id, m.user_id, m.caption, u.first_name, u.last_name, u.username 
      FROM messages m 
      JOIN users u ON m.user_id = u.user_id 
      ORDER BY m.timestamp ASC 
      LIMIT ? OFFSET ?
    `);
    return stmt.all(limit, offset) as ShareMessage[];
  }
  


export function deleteMessageById(messageId: string) {
  const stmt = db.prepare('DELETE FROM messages WHERE id = ?');
  stmt.run(messageId);
}