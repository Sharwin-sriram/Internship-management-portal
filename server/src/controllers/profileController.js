import User from "../models/User.js";
import Student from "../models/Student.js";
import Company from "../models/Company.js";

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
        profileData.student = student;
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

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { name, avatar, studentDetails, companyDetails } = req.body;

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

    // Update base user
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateObj },
      { new: true, runValidators: true },
    ).select("-password -cart");

    let updatedDetails = null;

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
      if (typeof studentDetails.placement_eligible === "boolean") {
        studentUpdate.placement_eligible = studentDetails.placement_eligible;
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
