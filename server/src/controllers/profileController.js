import User from "../models/user.js";
import Student from "../models/Student.js";
import Company from "../models/Company.js";
import Document from "../models/Document.js";

// @desc    Get user profile
// @route   GET /api/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password -cart");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    let profileData = { user };

    if (user.role === "student") {
      const student = await Student.findOne({ user: user._id });
      if (student) {
        // Normalize skillProficiencies to a plain object for API consumers.
        const studentObj = student.toObject();
        let profObj = {};

        // Case 1: stored as array of { skill, proficiency }
        if (Array.isArray(studentObj.skillProficiencies)) {
          studentObj.skillProficiencies.forEach((p) => {
            if (p && p.skill)
              profObj[p.skill] =
                typeof p.proficiency === "number"
                  ? p.proficiency
                  : Number(p.proficiency) || 0;
          });
        }

        // Case 2: stored as a Mongoose Map on the document (not toObject)
        else if (
          student.skillProficiencies &&
          student.skillProficiencies instanceof Map
        ) {
          profObj = Object.fromEntries(student.skillProficiencies);
        }

        // Case 3: stored as a plain object mapping skill->number
        else if (
          studentObj.skillProficiencies &&
          typeof studentObj.skillProficiencies === "object"
        ) {
          Object.keys(studentObj.skillProficiencies).forEach((k) => {
            profObj[k] = Number(studentObj.skillProficiencies[k]) || 0;
          });
        }

        studentObj.skillProficiencies = profObj;
        profileData.student = studentObj;
      }

      const resume = await Document.findOne({
        user: user._id,
        doc_type: "resume",
      }).select("-file_data");

      if (resume) {
        profileData.resume = {
          id: resume._id,
          original_name: resume.original_name,
          version: resume.version,
          mime_type: resume.mime_type,
          is_verified: resume.is_verified,
          uploaded_at: resume.uploaded_at,
          updatedAt: resume.updatedAt,
        };
      }
    } else if (user.role === "company") {
      const company = await Company.findOne({ user: user._id });
      if (company) {
        profileData.company = {
          name: company.company_name || "",
          description: company.description || "",
          website: company.website || "",
          location: company.office_locations?.[0]?.city || "",
          industry: company.industry || "",
          logo: company.logo_url || "",
          address: company.address || "",
        };
      }
    }

    res.status(200).json({
      success: true,
      data: profileData,
    });
  } catch (error) {
    console.error("Error in getProfile:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Get profile by ID
// @route   GET /api/profile/:id
// @access  Private
export const getProfileById = async (req, res) => {
  try {
    let user = await User.findById(req.params.id).select("-password -cart");

    if (!user) {
      // Maybe the ID provided is a Student document ID instead of a User document ID
      const student = await Student.findById(req.params.id);
      if (student && student.user) {
        user = await User.findById(student.user).select("-password -cart");
      }
    }

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let profileData = { user };

    if (user.role === "student") {
      const student = await Student.findOne({ user: user._id });
      if (student) {
        profileData.student = student.toObject();
      }

      const resume = await Document.findOne({
        user: user._id,
        doc_type: "resume",
      }).select("-file_data");

      if (resume) {
        profileData.resume = {
          id: resume._id,
          original_name: resume.original_name,
        };
      }
    } else if (user.role === "company") {
      const company = await Company.findOne({ user: user._id });
      if (company) {
        profileData.company = company.toObject();
      }
    }

    res.status(200).json({
      success: true,
      data: profileData,
    });
  } catch (error) {
    console.error("Error in getProfileById:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { name, avatar, phone, studentDetails, companyDetails } = req.body;

    // Debug: log incoming profile update fields (avoid logging large avatar data)
    try {
      console.log(
        `[updateProfile] user=${req.user._id} role=${req.user.role} studentDetailsPresent=${!!studentDetails} companyDetailsPresent=${!!companyDetails}`,
      );
      if (studentDetails) {
        console.log("[updateProfile] studentDetails:", {
          college: studentDetails.college,
          branch: studentDetails.branch,
          cgpa: studentDetails.cgpa,
          graduation_year: studentDetails.graduation_year,
          skillsLength: Array.isArray(studentDetails.skills)
            ? studentDetails.skills.length
            : undefined,
        });
      }
    } catch (e) {
      /* ignore logging errors */
    }

    // Build update object for base user
    const updateObj = {};
    if (name !== undefined) updateObj.name = name;
    if (avatar !== undefined) updateObj.avatar = avatar;
    if (phone !== undefined) updateObj.phone = phone.trim();

    // Update base user
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateObj },
      { new: true, runValidators: true },
    ).select("-password -cart");

    let updatedDetails = null;

    const { studentSkillProficiencies } = req.body;

    if (req.user.role === "student" && studentDetails) {
      const studentUpdate = {};

      if (
        typeof studentDetails.college === "string" &&
        studentDetails.college.trim() !== ""
      ) {
        studentUpdate.college = studentDetails.college.trim();
      }
      if (
        typeof studentDetails.branch === "string" &&
        studentDetails.branch.trim() !== ""
      ) {
        studentUpdate.branch = studentDetails.branch.trim();
      }
      if (studentDetails.cgpa !== undefined && studentDetails.cgpa !== null) {
        studentUpdate.cgpa = studentDetails.cgpa;
      }
      if (
        studentDetails.graduation_year !== undefined &&
        studentDetails.graduation_year !== null
      ) {
        studentUpdate.graduation_year = studentDetails.graduation_year;
      }
      if (Array.isArray(studentDetails.skills)) {
        studentUpdate.skills = studentDetails.skills;
      }
      if (
        studentSkillProficiencies &&
        typeof studentSkillProficiencies === "object"
      ) {
        // Convert incoming object (name -> value) into array of subdocs [{skill, proficiency}]
        const arr = Object.entries(studentSkillProficiencies).map(([k, v]) => {
          let num = Number(v);
          if (isNaN(num)) num = 0;
          num = Math.max(0, Math.min(100, Math.round(num)));
          return { skill: k, proficiency: num };
        });
        studentUpdate.skillProficiencies = arr;
      }
      if (typeof studentDetails.placement_eligible === "boolean") {
        studentUpdate.placement_eligible = studentDetails.placement_eligible;
      }
      if (typeof studentDetails.bio === "string") {
        studentUpdate.bio = studentDetails.bio.trim();
      }
      if (typeof studentDetails.linkedin_url === "string") {
        studentUpdate.linkedin_url = studentDetails.linkedin_url.trim();
      }
      if (typeof studentDetails.github_url === "string") {
        studentUpdate.github_url = studentDetails.github_url.trim();
      }
      if (typeof studentDetails.address === "string") {
        studentUpdate.address = studentDetails.address.trim();
      }
      if (Array.isArray(studentDetails.projects)) {
        studentUpdate.projects = studentDetails.projects;
      }

      const existingStudent = await Student.findOne({ user: req.user._id });

      if (!existingStudent) {
        // If no student document exists, allow creating a partial document
        // so users can update a single field. Use upsert without validators
        // to avoid required-field validation on insert.
        if (Object.keys(studentUpdate).length === 0) {
          updatedDetails = null;
        } else {
          updatedDetails = await Student.findOneAndUpdate(
            { user: req.user._id },
            { $set: { ...studentUpdate, user: req.user._id } },
            { new: true, upsert: true, runValidators: false },
          );
        }
      } else if (Object.keys(studentUpdate).length > 0) {
        updatedDetails = await Student.findOneAndUpdate(
          { user: req.user._id },
          { $set: studentUpdate },
          { new: true, runValidators: true },
        );
      } else {
        updatedDetails = existingStudent;
      }
    } else if (req.user.role === "company" && companyDetails) {
      const companyUpdate = {
        company_name: companyDetails.name,
        description: companyDetails.description,
        website: companyDetails.website,
        industry: companyDetails.industry,
        logo_url: companyDetails.logo,
        address: companyDetails.address || "",
        office_locations: companyDetails.location
          ? [
              {
                label: "Primary",
                address_line1: "Main Office",
                city: companyDetails.location,
                country: "India",
              },
            ]
          : [],
      };

      const existingCompany = await Company.findOne({ user: req.user._id });

      if (!existingCompany) {
        if (Object.keys(companyUpdate).length === 0) {
          updatedDetails = null;
        } else {
          // Allow partial upsert without validators on insert
          updatedDetails = await Company.findOneAndUpdate(
            { user: req.user._id },
            { $set: { ...companyUpdate, user: req.user._id } },
            { new: true, upsert: true, runValidators: false },
          );
        }
      } else {
        updatedDetails = await Company.findOneAndUpdate(
          { user: req.user._id },
          { $set: companyUpdate },
          { new: true, runValidators: true },
        );
      }
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        user: updatedUser,
        ...(req.user.role === "student" && { student: updatedDetails }),
        ...(req.user.role === "company" && { company: updatedDetails }),
      },
    });
  } catch (error) {
    console.error("Error in updateProfile:", error);
    // Include error details in development to aid debugging
    const devInfo =
      process.env.NODE_ENV === "development"
        ? {
            error: error.message,
            details: error.errors || null,
          }
        : {};

    res
      .status(500)
      .json({ success: false, message: "Server Error", ...devInfo });
  }
};
