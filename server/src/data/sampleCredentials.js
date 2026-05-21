/**
 * Demo accounts for local development / testing.
 * Run: npm run seed
 */

export const SAMPLE_ADMIN = {
  name: "Portal Admin",
  email: "admin@internhub.com",
  password: "Admin@123",
};

export const SAMPLE_STUDENTS = [
  {
    name: "Arjun Mehta",
    email: "arjun@internhub.com",
    password: "Student@123",
    college: "Tech Institute of India",
    branch: "Computer Science",
    cgpa: 8.5,
    graduation_year: 2026,
    skills: ["React", "Node.js", "MongoDB"],
  },
  {
    name: "Priya Sharma",
    email: "priya@internhub.com",
    password: "Student@123",
    college: "National Engineering College",
    branch: "Information Technology",
    cgpa: 9.1,
    graduation_year: 2026,
    skills: ["Python", "Machine Learning", "SQL"],
  },
  {
    name: "Rahul Verma",
    email: "rahul@internhub.com",
    password: "Student@123",
    college: "City University",
    branch: "Electronics",
    cgpa: 7.8,
    graduation_year: 2027,
    skills: ["Java", "Spring Boot", "AWS"],
  },
];

export const SAMPLE_COMPANIES = [
  {
    name: "TechCorp HR",
    email: "hr@techcorp.com",
    password: "Company@123",
    company_name: "TechCorp Solutions",
    industry: "Technology",
    approval_status: "approved",
    is_verified: true,
  },
  {
    name: "InnoSoft Recruiter",
    email: "recruit@innosoft.com",
    password: "Company@123",
    company_name: "InnoSoft Labs",
    industry: "Software",
    approval_status: "pending",
    is_verified: false,
  },
];

export const SAMPLE_COORDINATOR = {
  name: "Dr. Anita Nair",
  email: "coordinator@internhub.com",
  password: "Coord@123",
};
