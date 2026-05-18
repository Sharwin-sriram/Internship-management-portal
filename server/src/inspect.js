const db = require('./models');

async function inspect() {
  try {
    await db.sequelize.authenticate();

    console.log('Connected to DB. Dialect:', db.sequelize.getDialect());
    if (db.sequelize.options && db.sequelize.options.storage) {
      console.log('SQLite file:', db.sequelize.options.storage);
    }

    const counts = {};
    counts.users = await db.User.count();
    counts.students = await db.Student.count();
    counts.companies = await db.Company.count();
    counts.internships = await db.Internship.count();
    counts.applications = await db.Application.count();
    counts.interviews = await db.Interview.count();
    counts.documents = await db.Document.count();
    counts.notifications = await db.Notification.count();

    console.log('Counts:', counts);

    const users = await db.User.findAll({ limit: 5, attributes: ['id', 'email', 'role', 'name'] });
    console.log('Sample users:', users.map(u => u.toJSON()));

    const internships = await db.Internship.findAll({ limit: 5 });
    console.log('Sample internships:', internships.map(i => i.toJSON()));

    const applications = await db.Application.findAll({ limit: 5 });
    console.log('Sample applications:', applications.map(a => a.toJSON()));

    process.exit(0);
  } catch (err) {
    console.error('Inspect failed:', err);
    process.exit(1);
  }
}

inspect();
