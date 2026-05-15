const fs = require('fs').promises;
const path = require('path');

const DATA_FILE = path.join(__dirname, '../../data/sessions.json');

class Token {
  static async findByToken(token) {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    const sessions = JSON.parse(data);
    return sessions.find(session => session.token === token);
  }

  static async create(tokenData) {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    const sessions = JSON.parse(data);
    const newToken = {
      id: Date.now().toString(),
      ...tokenData,
      createdAt: new Date().toISOString()
    };
    sessions.push(newToken);
    await fs.writeFile(DATA_FILE, JSON.stringify(sessions, null, 2));
    return newToken;
  }

  static async delete(token) {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    const sessions = JSON.parse(data);
    const filtered = sessions.filter(session => session.token !== token);
    await fs.writeFile(DATA_FILE, JSON.stringify(filtered, null, 2));
    return true;
  }
}

module.exports = Token;
