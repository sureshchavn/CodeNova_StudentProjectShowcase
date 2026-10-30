const express = require("express");
const router = express.Router();

const {
  submitProject,
  getApprovedProjects
} = require("../controllers/projectController");

// Public gallery - approved projects only
router.get("/", getApprovedProjects);

// Submit new project
router.post("/", submitProject);

module.exports = router;