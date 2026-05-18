const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');
const dbConfig = require('../config/db.config')[process.env.NODE_ENV || 'development'];

let sequelize;
const dialect = dbConfig.dialect || 'postgres';

if (dialect === 'sqlite') {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbConfig.storage || path.join(__dirname, '..', 'data', 'development.sqlite'),
    logging: false,
  });
} else {
  sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    {
      host: dbConfig.host,
      port: dbConfig.port,
      dialect,
      logging: false,
    }
  );
}

const db = {
  Sequelize,
  sequelize,
};

db.User = require('./user')(sequelize, DataTypes);
db.Student = require('./student')(sequelize, DataTypes);
db.Company = require('./company')(sequelize, DataTypes);
db.Internship = require('./internship')(sequelize, DataTypes);
db.Application = require('./application')(sequelize, DataTypes);
db.Interview = require('./interview')(sequelize, DataTypes);
db.Document = require('./document')(sequelize, DataTypes);
db.Notification = require('./notification')(sequelize, DataTypes);

// User subtype associations
db.User.hasOne(db.Student, { foreignKey: 'userId', as: 'student' });
db.Student.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });

db.User.hasOne(db.Company, { foreignKey: 'userId', as: 'company' });
db.Company.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });

// Company / Internship
db.Company.hasMany(db.Internship, { foreignKey: 'companyId', as: 'internships' });
db.Internship.belongsTo(db.Company, { foreignKey: 'companyId', as: 'company' });

// Application flow
db.Student.hasMany(db.Application, { foreignKey: 'studentId', as: 'applications' });
db.Application.belongsTo(db.Student, { foreignKey: 'studentId', as: 'student' });

db.Internship.hasMany(db.Application, { foreignKey: 'internshipId', as: 'applications' });
db.Application.belongsTo(db.Internship, { foreignKey: 'internshipId', as: 'internship' });

db.Application.hasOne(db.Interview, { foreignKey: 'applicationId', as: 'interview' });
db.Interview.belongsTo(db.Application, { foreignKey: 'applicationId', as: 'application' });

// Documents and notifications
db.User.hasMany(db.Document, { foreignKey: 'ownerId', as: 'documents' });
db.Document.belongsTo(db.User, { foreignKey: 'ownerId', as: 'owner' });

db.User.hasMany(db.Notification, { foreignKey: 'userId', as: 'notifications' });
db.Notification.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });

module.exports = db;
