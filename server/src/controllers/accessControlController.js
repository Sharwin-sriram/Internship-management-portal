import User from "../models/user.js";

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
