const Project = require("../models/Project");
const validator = require("validator");

// Validate optional URLs
const isValidOptionalUrl = (value) => {
  if (!value || !String(value).trim()) {
    return true;
  }

  return validator.isURL(String(value).trim(), {
    require_protocol: true,
    protocols: ["http", "https"],
    require_valid_protocol: true
  });
};

// Submit a new project
const submitProject = async (req, res) => {
  try {
    const {
      title,
      studentName,
      description,
      tags,
      githubLink,
      livePreviewUrl
    } = req.body;

    if (
      !title?.trim() ||
      !studentName?.trim() ||
      !description?.trim() ||
      !Array.isArray(tags) ||
      tags.filter((tag) => String(tag).trim()).length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Title, student name, description and at least one tag are required."
      });
    }

    const cleanGithubLink = String(githubLink || "").trim();
    const cleanLivePreviewUrl = String(livePreviewUrl || "").trim();

    if (!isValidOptionalUrl(cleanGithubLink)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid GitHub URL."
      });
    }

    if (
      cleanGithubLink &&
      !/^https?:\/\/(www\.)?github\.com\/.+/i.test(cleanGithubLink)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid GitHub repository URL."
      });
    }

    if (!isValidOptionalUrl(cleanLivePreviewUrl)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid Live Preview URL."
      });
    }

    const cleanTags = tags
      .map((tag) => String(tag).trim())
      .filter(Boolean);

    const project = await Project.create({
      title: title.trim(),
      studentName: studentName.trim(),
      description: description.trim(),
      tags: cleanTags,
      githubLink: cleanGithubLink,
      livePreviewUrl: cleanLivePreviewUrl,
      status: "pending"
    });

    return res.status(201).json({
      success: true,
      message: "Project submitted successfully. Waiting for admin approval.",
      data: project
    });
  } catch (error) {
    console.error("Project submission error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to submit project."
    });
  }
};

// Get approved projects for public gallery
const getApprovedProjects = async (req, res) => {
  try {
    const { search, tag } = req.query;

    const filter = { status: "approved" };

    if (search?.trim()) {
      const safeSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      filter.$or = [
        { title: { $regex: safeSearch, $options: "i" } },
        { studentName: { $regex: safeSearch, $options: "i" } },
        { description: { $regex: safeSearch, $options: "i" } }
      ];
    }

    if (tag?.trim()) {
      const safeTag = tag.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      filter.tags = {
        $regex: `^${safeTag}$`,
        $options: "i"
      };
    }

    const projects = await Project.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    console.error("Fetch approved projects error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch approved projects."
    });
  }
};

module.exports = {
  submitProject,
  getApprovedProjects
};