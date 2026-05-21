import Admin from "../models/Admin.js";
import User from "../models/user.js";
import Student from "../models/Student.js";
import Company from "../models/Company.js";
import Internship from "../models/Internship.js";
import {
  SAMPLE_ADMIN,
  SAMPLE_STUDENTS,
  SAMPLE_COMPANIES,
  SAMPLE_COORDINATOR,
} from "../data/sampleCredentials.js";

async function upsertAdmin({ name, email, password }) {
  const normalizedEmail = email.toLowerCase();

  let admin = await Admin.findOne({ email: normalizedEmail }).select("+password");
  if (admin) {
    admin.name = name;
    admin.password = password;
    admin.isActive = true;
    await admin.save();
  } else {
    admin = await Admin.create({
      name,
      email: normalizedEmail,
      password,
      isActive: true,
    });
  }

  let user = await User.findOne({ email: normalizedEmail }).select("+password");
  if (user) {
    user.name = name;
    user.role = "admin";
    user.password = password;
    user.isActive = true;
    user.emailVerified = true;
    await user.save();
  } else {
    user = await User.create({
      name,
      email: normalizedEmail,
      password,
      role: "admin",
      isActive: true,
      emailVerified: true,
    });
  }

  admin.user = user._id;
  await admin.save();

  return { admin, user };
}

async function upsertUser({ name, email, password, role }) {
  const normalizedEmail = email.toLowerCase();
  let user = await User.findOne({ email: normalizedEmail }).select("+password");

  if (user) {
    user.name = name;
    user.role = role;
    user.password = password;
    user.isActive = true;
    user.emailVerified = true;
    await user.save();
  } else {
    user = await User.create({
      name,
      email: normalizedEmail,
      password,
      role,
      isActive: true,
      emailVerified: true,
    });
  }

  return user;
}

async function upsertStudent(sample) {
  const user = await upsertUser({
    name: sample.name,
    email: sample.email,
    password: sample.password,
    role: "student",
  });

  let student = await Student.findOne({ user: user._id });
  if (student) {
    student.college = sample.college;
    student.branch = sample.branch;
    student.cgpa = sample.cgpa;
    student.graduation_year = sample.graduation_year;
    student.skills = sample.skills;
    await student.save();
  } else {
    student = await Student.create({
      user: user._id,
      college: sample.college,
      branch: sample.branch,
      cgpa: sample.cgpa,
      graduation_year: sample.graduation_year,
      skills: sample.skills,
      projects: [{ title: "Sample Project", desc: "Built during internship prep" }],
    });
  }

  return { user, student };
}

async function upsertCompany(sample) {
  const user = await upsertUser({
    name: sample.name,
    email: sample.email,
    password: sample.password,
    role: "company",
  });

  let company = await Company.findOne({ user: user._id });
  const payload = {
    user: user._id,
    company_name: sample.company_name,
    legal_name: sample.company_name,
    industry: sample.industry,
    approval_status: sample.approval_status,
    is_verified: sample.is_verified,
    primary_contact: {
      name: sample.name,
      email: sample.email.toLowerCase(),
      phone: "",
      title: "HR Manager",
    },
  };

  if (company) {
    Object.assign(company, payload);
    await company.save();
  } else {
    company = await Company.create(payload);
  }

  return { user, company };
}

const SAMPLE_INTERNSHIPS = [
  {
    companyEmail: "hr@techcorp.com",
    title: "Full Stack Developer Intern",
    description:
      "Work on React and Node.js features for our internship portal. You will collaborate with senior engineers and ship production-ready code.",
    skills_required: ["React", "Node.js", "MongoDB"],
    stipend_min: 15000,
    stipend_max: 25000,
    duration: "3 months",
    location: "hybrid",
    batch_id: "2026",
    status: "open",
  },
  {
    companyEmail: "hr@techcorp.com",
    title: "Data Science Intern",
    description:
      "Analyze student placement data and build ML pipelines. Strong Python and statistics background required.",
    skills_required: ["Python", "Machine Learning", "SQL"],
    stipend_min: 18000,
    stipend_max: 28000,
    duration: "6 months",
    location: "remote",
    batch_id: "2026",
    status: "open",
  },
];

async function upsertSampleInternships() {
  const created = [];
  const deadline = new Date();
  deadline.setMonth(deadline.getMonth() + 3);

  for (const sample of SAMPLE_INTERNSHIPS) {
    const companyUser = await User.findOne({
      email: sample.companyEmail.toLowerCase(),
    });
    if (!companyUser) continue;

    const company = await Company.findOne({ user: companyUser._id });
    if (!company) continue;

    let internship = await Internship.findOne({
      company: company._id,
      title: sample.title,
    });

    const payload = {
      company: company._id,
      title: sample.title,
      description: sample.description,
      skills_required: sample.skills_required,
      stipend_min: sample.stipend_min,
      stipend_max: sample.stipend_max,
      duration: sample.duration,
      location: sample.location,
      batch_id: sample.batch_id,
      status: sample.status,
      deadline,
    };

    if (internship) {
      Object.assign(internship, payload);
      await internship.save();
    } else {
      internship = await Internship.create(payload);
    }
    created.push(internship);
  }

  return created;
}

/**
 * Idempotent sample data seed for demo / local testing.
 */
export async function seedSampleData() {
  const results = {
    admin: null,
    students: [],
    companies: [],
    coordinator: null,
  };

  results.admin = await upsertAdmin(SAMPLE_ADMIN);

  for (const s of SAMPLE_STUDENTS) {
    results.students.push(await upsertStudent(s));
  }

  for (const c of SAMPLE_COMPANIES) {
    results.companies.push(await upsertCompany(c));
  }

  results.coordinator = await upsertUser({
    ...SAMPLE_COORDINATOR,
    role: "coordinator",
  });

  results.internships = await upsertSampleInternships();

  return results;
}

/** Always ensure the demo admin account exists with a known password */
export async function ensureSampleAdmin() {
  const result = await upsertAdmin(SAMPLE_ADMIN);
  console.log("\n[seed] Demo admin ready for /admin/login:");
  console.log(`       Email:    ${SAMPLE_ADMIN.email}`);
  console.log(`       Password: ${SAMPLE_ADMIN.password}\n`);
  return result;
}

/**
 * Seed sample data when database has no admin yet, or SEED_SAMPLE_DATA=true.
 */
export async function seedSampleDataIfNeeded() {
  if (process.env.SEED_SAMPLE_DATA === "false") {
    await ensureSampleAdmin();
    return { skipped: true, reason: "SEED_SAMPLE_DATA=false (admin only)" };
  }

  const force = process.env.SEED_SAMPLE_DATA === "true";
  const adminCount = await Admin.countDocuments();

  if (!force && adminCount > 0) {
    return { skipped: true, reason: "admin already exists" };
  }

  await seedSampleData();
  return { skipped: false, seeded: true };
}
