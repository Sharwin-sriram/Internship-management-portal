import Application from "../models/Application.js";
import Student from "../models/Student.js";
import Internship from "../models/Internship.js";
import JobApplication from "../models/JobApplication.js";

// @desc    Get student dashboard data
// @route   GET /api/student-dashboard
// @access  Private (Student)
export const getStudentDashboardData = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id });

    if (!student) {
      // Allow dashboard to render even if student profile isn't fully created yet
      return res.status(200).json({
        success: true,
        data: {
          stats: {
            totalApplications: 0,
            activeInterviews: 0,
            offersReceived: 0,
            savedInternships: 0,
          },
          recentApplications: [],
          recommendedInternships: [],
        },
      });
    }

    // Fetch applications
    const applications = await Application.find({ student: student._id })
      .populate({
        path: "internship",
        populate: {
          path: "company",
          select: "name logo location",
        },
      })
      .sort("-applied_at")
      .limit(5);

    // Calculate stats
    const totalApplications = await Application.countDocuments({
      student: student._id,
    });
    const activeInterviews = await Application.countDocuments({
      student: student._id,
      status: "interviewing",
    });
    const offersReceived = await Application.countDocuments({
      student: student._id,
      status: { $in: ["selected", "offer_issued"] },
    });

    // Recommendations (just open ones for now, can be improved later)
    const recommendedInternships = await Internship.find({ status: "open" })
      .populate("company", "name location")
      .sort("-createdAt")
      .limit(3);

    // Map applications for frontend
    const studentEmail = req.user.email.toLowerCase();
    const internshipIds = applications
      .map((app) => app.internship?._id)
      .filter(Boolean);
    const jobApps = await JobApplication.find({
      email: studentEmail,
      internship: { $in: internshipIds },
    }).lean();

    const jobAppMap = new Map(
      jobApps.map((ja) => [String(ja.internship), ja._id.toString()]),
    );

    const mappedApplications = applications.map((app) => {
      const internshipId = app.internship?._id
        ? String(app.internship._id)
        : "";
      const jobAppId = jobAppMap.get(internshipId) || app._id.toString();

      return {
        id: jobAppId,
        role: app.internship?.title || "Unknown Role",
        company: app.internship?.company?.name || "Unknown Company",
        status:
          app.status === "applied"
            ? "Pending"
            : app.status === "shortlisted"
              ? "In Review"
              : app.status === "interviewing"
                ? "Interview"
                : app.status === "selected" || app.status === "offer_issued"
                  ? "Offer"
                  : app.status === "rejected"
                    ? "Rejected"
                    : "Pending",
        date: new Date(app.applied_at).toLocaleDateString(),
        logo: app.internship?.company?.name?.charAt(0).toUpperCase() || "C",
      };
    });

    const mappedRecommendations = recommendedInternships.map((internship) => ({
      id: internship._id.toString(),
      role: internship.title,
      company: internship.company?.name || "Unknown Company",
      location: internship.company?.location || "Remote",
      stipend: `$${internship.stipend_min} - $${internship.stipend_max}/mo`,
    }));

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalApplications,
          activeInterviews,
          offersReceived,
          savedInternships: 0, // Not implemented yet
        },
        recentApplications: mappedApplications,
        recommendedInternships: mappedRecommendations,
      },
    });
  } catch (error) {
    console.error("Error in getStudentDashboardData:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
