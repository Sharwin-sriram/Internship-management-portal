require('dotenv').config();
const mongoose = require('mongoose');
const OfferLetter = require('./src/models/OfferLetter.js').default;
const Company = require('./src/models/Company.js').default;
const Student = require('./src/models/Student.js').default;
const User = require('./src/models/user.js').default;
const Application = require('./src/models/Application.js').default;
const Internship = require('./src/models/Internship.js').default;

const MONGODB_URI = process.env.MONGODB_URI;

const resolveOfferLetterContext = async (offerLetter) => {
  let studentUserId = offerLetter.student?._id || offerLetter.student || null;
  let studentName = offerLetter.student?.name || null;
  let studentEmail = offerLetter.student?.email || null;
  let companyId = offerLetter.company?._id || offerLetter.company || null;
  let companyName =
    offerLetter.company?.company_name ||
    offerLetter.company?.legal_name ||
    offerLetter.company?.name ||
    null;
  let position = offerLetter.internship?.title || null;

  if (!studentName || !studentEmail || !companyName || !position) {
    const application = await Application.findById(offerLetter.application)
      .populate({
        path: "student",
        populate: { path: "user", select: "name email phone" },
      })
      .populate({
        path: "internship",
        populate: { path: "company" },
      });

    if (application) {
      studentUserId = studentUserId || application.student?.user?._id || null;
      studentName = studentName || application.student?.user?.name || null;
      studentEmail = studentEmail || application.student?.user?.email || null;
      companyId = companyId || application.internship?.company?._id || null;
      companyName =
        companyName ||
        application.internship?.company?.company_name ||
        application.internship?.company?.legal_name ||
        application.internship?.company?.name ||
        null;
      position = position || application.internship?.title || null;
    }
  }

  // Load candidate address and phone
  let studentAddress = "123 Anywhere St., Any City ST 1234";
  let studentPhone = "";
  if (studentUserId) {
    const studentDoc = await Student.findOne({ user: studentUserId });
    if (studentDoc) {
      if (studentDoc.address) {
        studentAddress = studentDoc.address;
      }
    }
    const userDoc = await User.findById(studentUserId).select("phone");
    if (userDoc && userDoc.phone) {
      studentPhone = userDoc.phone;
    }
  }

  // Load company contact details
  let companyAddress = "123 Anywhere St., Any City";
  let companyPhone = "+123-456-7890";
  let companyEmail = "hello@reallygreatsite.com";
  if (companyId) {
    const companyDoc = await Company.findById(companyId);
    if (companyDoc) {
      if (companyDoc.address) {
        companyAddress = companyDoc.address;
      }
      if (companyDoc.primary_contact?.phone) {
        companyPhone = companyDoc.primary_contact.phone;
      }
      if (companyDoc.primary_contact?.email) {
        companyEmail = companyDoc.primary_contact.email;
      }
    }
  }

  return {
    studentUserId: studentUserId ? String(studentUserId) : null,
    studentName: studentName || "Student",
    studentEmail: studentEmail || null,
    studentAddress,
    studentPhone,
    companyId: companyId ? String(companyId) : null,
    companyName: companyName || "Company",
    companyAddress,
    companyPhone,
    companyEmail,
    position: position || "Intern",
  };
};

async function run() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to DB');
    
    const offerLetter = await OfferLetter.findOne({ company: new mongoose.Types.ObjectId('6a0c0e1513a97393bea768fe') })
      .populate("student")
      .populate("company")
      .populate("internship");
      
    if (!offerLetter) {
      console.log('No offer letter found for AWS1');
    } else {
      console.log('Offer Letter loaded:', offerLetter._id);
      const ctx = await resolveOfferLetterContext(offerLetter);
      console.log('Resolved context:', ctx);
    }
    
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

run();
