/**
 * @desc    Get student profile with details (for admin)
 * @route   GET /api/rbac/students/:id
 * @access  Admin, Coordinator
 */
export const getStudentProfile = async (req, res) => {
  try {
    const User = (await import("../models/user.js")).default;
    const Student = (await import("../models/Student.js")).default;

    const user = await User.findById(req.params.id).select("-password");
    if (!user || user.role !== "student") {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    const student = await Student.findOne({ user: user._id })
      .populate("user", "name email emailVerified authProvider googleId githubId")
      .lean();

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found.",
      });
    }

    // Check if GitHub and LinkedIn are connected
    const hasGitHub = !!(
      student.github_url?.trim() ||
      user.githubId
    );
    const hasLinkedIn = !!student.linkedin_url?.trim();

    // Auto-approve if both GitHub and LinkedIn are present
    let shouldAutoApprove = false;
    if (hasGitHub && hasLinkedIn && user.approval_status === "pending") {
      shouldAutoApprove = true;
      user.approval_status = "approved";
      await User.findByIdAndUpdate(user._id, { approval_status: "approved" });
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          emailVerified: user.emailVerified,
          approval_status: user.approval_status,
          authProvider: user.authProvider,
          githubId: user.githubId || null,
          googleId: user.googleId || null,
        },
        student: {
          _id: student._id,
          college: student.college,
          branch: student.branch,
          cgpa: student.cgpa,
          graduation_year: student.graduation_year,
          skills: student.skills || [],
          skillProficiencies: student.skillProficiencies || [],
          placement_eligible: student.placement_eligible,
          bio: student.bio,
          linkedin_url: student.linkedin_url,
          github_url: student.github_url,
          projects: student.projects || [],
        },
        verification: {
          hasGitHub,
          hasLinkedIn,
          autoApproved: shouldAutoApprove,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

/**
 * @desc    Get all students for admin (with auto-approval logic)
 * @route   GET /api/rbac/students
 * @access  Admin, Coordinator
 */
export const getStudentsForAdmin = async (req, res) => {
  try {
    const User = (await import("../models/user.js")).default;
    const Student = (await import("../models/Student.js")).default;

    // Get all students
    const students = await Student.find()
      .populate({
        path: "user",
        select: "name email approval_status emailVerified githubId",
        match: { role: "student" },
      })
      .lean();

    // Filter out students without user ref and check for auto-approve
    const validStudents = [];

    for (const student of students) {
      if (!student.user) continue;

      const user = student.user;
      const hasGitHub = !!(
        student.github_url?.trim() ||
        user.githubId
      );
      const hasLinkedIn = !!student.linkedin_url?.trim();

      // Auto-approve if both GitHub and LinkedIn are present
      if (
        hasGitHub &&
        hasLinkedIn &&
        user.approval_status === "pending"
      ) {
        await User.findByIdAndUpdate(user._id, { approval_status: "approved" });
        user.approval_status = "approved";
      }

      validStudents.push({
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        role: "student",
        approval_status: user.approval_status,
        emailVerified: user.emailVerified,
        college: student.college,
        branch: student.branch,
        cgpa: student.cgpa,
        linkedin_url: student.linkedin_url,
        github_url: student.github_url,
        hasGitHub,
        hasLinkedIn,
        createdAt: student.createdAt,
      });
    }

    res.status(200).json({
      success: true,
      count: validStudents.length,
      data: validStudents,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
