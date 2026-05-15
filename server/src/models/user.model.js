const fs = require('fs').promises;
const path = require('path');

const DATA_FILE = path.join(__dirname, '../../data/users.json');

class User {
  static async findAll() {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  }

  static async findById(id) {
    const users = await this.findAll();
    return users.find(user => user.id === id);
  }

  static async findByEmail(email) {
    const users = await this.findAll();
    return users.find(user => user.email === email);
  }

  static async create(userData) {
    const users = await this.findAll();
    const newUser = {
      id: Date.now().toString(),
      ...userData,
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    await fs.writeFile(DATA_FILE, JSON.stringify(users, null, 2));
    return newUser;
  }

  static async update(id, userData) {
    const users = await this.findAll();
    const index = users.findIndex(user => user.id === id);
    if (index === -1) return null;
    
    users[index] = { ...users[index], ...userData, updatedAt: new Date().toISOString() };
    await fs.writeFile(DATA_FILE, JSON.stringify(users, null, 2));
    return users[index];
  }

  static async delete(id) {
    const users = await this.findAll();
    const filtered = users.filter(user => user.id !== id);
    if (users.length === filtered.length) return null;
    
    await fs.writeFile(DATA_FILE, JSON.stringify(filtered, null, 2));
    return true;
  }
}

module.exports = User;
