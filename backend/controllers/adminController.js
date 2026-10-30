const mongoose = require("mongoose");
const Project = require("../models/Project");

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const [total, pending, approved, rejected] = await Promise.all([
      Project.countDocuments(),
      Project.countDocuments({ status: "pending" }),
      Project.countDocuments({ status: "approved" }),
      Project.countDocuments({ status: "rejected" })
    ]);

    return res.status(200).json({
      success: true,
      data: {
        total,
        pending,
        approved,
        rejected
      }
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics."
    });
  }
};

// Get projects by status
const getProjectsByStatus = async (req, res) => {
  try {
    const allowedStatuses = ["pending", "approved", "rejected"];
    const { status } = req.params;

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project status."
      });
    }

    const projects = await Project.find({ status }).sort({
      updatedAt: -1
    });

    return res.status(200).json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    console.error("Fetch projects by status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch projects."
    });
  }
};

// Get all projects for admin moderation history
const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find().sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    console.error("Fetch all projects error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch all projects."
    });
  }
};

// Get pending projects
const getPendingProjects = async (req, res) => {
  try {
    const projects = await Project.find({ status: "pending" }).sort({
      createdAt: -1
    });

    return res.status(200).json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    console.error("Fetch pending projects error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch pending projects."
    });
  }
};

// Approve or reject a project
const moderateProject = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID."
      });
    }

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be approved or rejected."
      });
    }

    const cleanReason = String(rejectionReason || "").trim();

    if (status === "rejected" && !cleanReason) {
      return res.status(400).json({
        success: false,
        message: "Please provide a rejection reason."
      });
    }

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found."
      });
    }

    project.status = status;
    project.rejectionReason = status === "rejected" ? cleanReason : "";

    project.moderationHistory.push({
      status,
      reason: status === "rejected" ? cleanReason : "",
      reviewedAt: new Date()
    });

    await project.save();

    return res.status(200).json({
      success: true,
      message: `Project ${status} successfully.`,
      data: project
    });
  } catch (error) {
    console.error("Project moderation error:", error);

    return res.status(500).json({
      success: false,
      message: "Moderation failed."
    });
  }
};

module.exports = {
  getDashboardStats,
  getProjectsByStatus,
  getAllProjects,
  getPendingProjects,
  moderateProject
};