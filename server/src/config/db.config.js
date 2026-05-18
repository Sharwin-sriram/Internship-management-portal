const path = require('path');

module.exports = {
  development: {
    dialect: process.env.DB_DIALECT || 'sqlite',
    storage:
      process.env.DB_STORAGE || path.join(__dirname, '..', 'data', 'development.sqlite'),
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'internship_portal',
    username: process.env.DB_USER || null,
    password: process.env.DB_PASS || null,
  },
  production: {
    dialect: process.env.DB_DIALECT || 'postgres',
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
  },
};
