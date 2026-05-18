const bcrypt = require('bcryptjs');
const { connect } = require('./config/mongo.config');
const User = require('./models/user.model');
const Student = require('./models/student.model');
const Company = require('./models/company.model');
const Internship = require('./models/internship.model');
const Application = require('./models/application.model');
const Interview = require('./models/interview.model');
const Document = require('./models/document.model');
const Notification = require('./models/notification.model');

async function seed() {
  try {
    const mongoose = await connect();

    // clear collections (optional)
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

    const alice = await User.create({
      email: 'alice@student.com',
      passwordHash,
      role: 'student',
      name: 'Alice Student',
    });

    const beta = await User.create({
      email: 'hr@betacorp.com',
      passwordHash,
      role: 'company',
      name: 'Beta HR',
      companyName: 'Beta Corp',
    });

    const admin = await User.create({
      email: 'admin@internship.com',
      passwordHash,
      role: 'admin',
      name: 'Portal Admin',
    });

    const student = await Student.create({ userId: alice._id });
    const company = await Company.create({ userId: beta._id, name: 'Beta Corp' });

    const internship = await Internship.create({
      companyId: company._id,
      title: 'Frontend Intern',
      description: 'Work on React components',
    });

    const application = await Application.create({
      studentId: student._id,
      internshipId: internship._id,
      status: 'pending',
    });

    await Interview.create({ applicationId: application._id, scheduledAt: new Date() });
    await Document.create({ ownerId: alice._id, name: 'Resume', url: 'http://example.com/resume.pdf' });
    await Notification.create({ userId: alice._id, message: 'Application received' });
    await Notification.create({ userId: beta._id, message: 'New applicant' });
    await Notification.create({ userId: admin._id, message: 'New registration' });

    console.log('Mongo sample data seeded successfully.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Failed to seed Mongo sample data:', err);
    process.exit(1);
  }
}

seed();
