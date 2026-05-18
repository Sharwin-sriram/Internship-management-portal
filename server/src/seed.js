const bcrypt = require('bcryptjs');
const { connect } = require('./config/mongo.config');

async function seed() {
  try {
    await connect();

    const User = require('./models/user.model');
    const Student = require('./models/student.model');
    const Company = require('./models/company.model');
    const Internship = require('./models/internship.model');
    const Application = require('./models/application.model');
    const Interview = require('./models/interview.model');
    const Document = require('./models/document.model');
    const Notification = require('./models/notification.model');

    // Clear collections
    await Promise.all([
      User.deleteMany({}),
      Student.deleteMany({}),
      Company.deleteMany({}),
      Internship.deleteMany({}),
      Application.deleteMany({}),
      Interview.deleteMany({}),
      Document.deleteMany({}),
      Notification.deleteMany({}),
    ]);

    const passwordHash = await bcrypt.hash('Password123!', 10);

    const studentUser = await User.create({
      email: 'alice@student.com',
      passwordHash,
      role: 'student',
      name: 'Alice Student',
    });

    const companyUser = await User.create({
      email: 'hr@betacorp.com',
      passwordHash,
      role: 'company',
      name: 'Beta Corp',
      companyName: 'Beta Corp',
    });

    const adminUser = await User.create({
      email: 'admin@internship.com',
      passwordHash,
      role: 'admin',
      name: 'Portal Admin',
    });

    const student = await Student.create({ userId: studentUser._id });
    const company = await Company.create({ userId: companyUser._id, name: 'Beta Corp' });

    const internship = await Internship.create({ companyId: company._id, title: 'Sample Internship' });
    const application = await Application.create({ studentId: student._id, internshipId: internship._id });

    await Interview.create({ applicationId: application._id });
    await Document.create({ ownerId: studentUser._id, name: 'Resume' });
    await Notification.create({ userId: studentUser._id, message: 'Welcome, Alice' });
    await Notification.create({ userId: companyUser._id, message: 'Company created' });
    await Notification.create({ userId: adminUser._id, message: 'Admin account' });

    console.log('Sample data seeded successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Failed to seed sample data:', error);
    process.exit(1);
  }
}

seed();
