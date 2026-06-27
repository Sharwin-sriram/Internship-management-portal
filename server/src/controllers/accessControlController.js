import User from "../models/user.js";
import Company from "../models/Company.js";
import Student from "../models/Student.js";
import Application from "../models/Application.js";
import Internship from "../models/Internship.js";

// @desc    Get all users (filtered by role optionally)
// @route   GET /api/rbac/users
// @access  Admin, Coordinator
export const getUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const query = role ? { role } : {};
    const users = await User.find(query).select("-password -cart -resetPasswordToken -resetPasswordExpire");
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};

// @desc    Update user role
// @route   POST /api/rbac/users/:id/role
// @access  Admin
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!["admin", "coordinator", "student", "company", "interviewer"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role provided."
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select("-password -cart");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    res.status(200).json({
      success: true,
      message: `User role updated to ${role}`,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};

// @desc    Get roles list
// @route   GET /api/rbac/roles
// @access  Private
export const getRoles = (req, res) => {
  const roles = [
    { role: "admin", description: "System administrator. Configure system, manage users, maintain audit logs, oversee backups" },
    { role: "coordinator", description: "Placement cell staff. Manage batches, approve postings, generate reports, liaise with companies" },
    { role: "student", description: "Registered student. Create profile, apply to internships, track applications, upload documents" },
    { role: "company", description: "Employer / recruiter. Post internships, review applications, schedule interviews, issue offers" }
  ];
  res.status(200).json({ success: true, count: roles.length, data: roles });
};

// @desc    Delete user
// @route   DELETE /api/rbac/users/:id
// @access  Admin, Coordinator
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    if (user.role === "student") {
      const student = await Student.findOne({ user: user._id });
      if (student) {
        await Application.deleteMany({ student: student._id });
        await Student.findByIdAndDelete(student._id);
      }
    } else if (user.role === "company") {
      const company = await Company.findOne({ user: user._id });
      if (company) {
        await Internship.deleteMany({ company: company._id });
        await Company.findByIdAndDelete(company._id);
      }
    }

    await User.findByIdAndDelete(user._id);

    res.status(200).json({ success: true, message: "User deleted successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// @desc    Update user approval status
// @route   PUT /api/rbac/users/:id/approval
// @access  Admin, Coordinator
export const updateUserApproval = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["approved", "rejected", "pending"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status." });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { approval_status: status },
      { new: true, runValidators: true }
    ).select("-password -cart");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};
