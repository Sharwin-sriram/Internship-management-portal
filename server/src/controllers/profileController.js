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
      return res.status(404).json({ success: false, message: "User not found" });
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
          logo: company.logo_url || ""
        };
      }
    }

    res.status(200).json({
      success: true,
      data: profileData
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

    // Build update object for base user
    const updateObj = {};
    if (name !== undefined) updateObj.name = name;
    if (avatar !== undefined) updateObj.avatar = avatar;

    // Update base user
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateObj },
      { new: true, runValidators: true }
    ).select("-password -cart");

    let updatedDetails = null;

    if (req.user.role === "student" && studentDetails) {
      // Find or create student profile
      updatedDetails = await Student.findOneAndUpdate(
        { user: req.user._id },
        { 
          $set: { 
            college: studentDetails.college,
            branch: studentDetails.branch,
            cgpa: studentDetails.cgpa,
            graduation_year: studentDetails.graduation_year,
            skills: studentDetails.skills,
            placement_eligible: studentDetails.placement_eligible
          } 
        },
        { new: true, runValidators: true, upsert: true }
      );
    } else if (req.user.role === "company" && companyDetails) {
       updatedDetails = await Company.findOneAndUpdate(
        { user: req.user._id },
        { 
          $set: { 
            company_name: companyDetails.name,
            description: companyDetails.description,
            website: companyDetails.website,
            industry: companyDetails.industry,
            logo_url: companyDetails.logo,
            office_locations: companyDetails.location ? [{
              label: "Primary",
              address_line1: "Main Office",
              city: companyDetails.location,
              country: "India"
            }] : []
          } 
        },
        { new: true, runValidators: true, upsert: true }
      );
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        user: updatedUser,
        ...(req.user.role === "student" && { student: updatedDetails }),
        ...(req.user.role === "company" && { company: updatedDetails }),
      }
    });
  } catch (error) {
    console.error("Error in updateProfile:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
