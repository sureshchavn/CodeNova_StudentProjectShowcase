const express = require("express");
const router = express.Router();

const adminAuth = require("../middleware/adminAuth");

const {
  getDashboardStats,
  getProjectsByStatus,
  getAllProjects,
  getPendingProjects,
  moderateProject
} = require("../controllers/adminController");

// All admin routes require authentication
router.use(adminAuth);

// Dashboard statistics
router.get("/stats", getDashboardStats);

// Project lists
router.get("/all", getAllProjects);
router.get("/pending", getPendingProjects);
router.get("/approved", (req, res, next) => {
  req.params.status = "approved";
  next();
}, getProjectsByStatus);

router.get("/rejected", (req, res, next) => {
  req.params.status = "rejected";
  next();
}, getProjectsByStatus);

// Generic status route
router.get("/status/:status", getProjectsByStatus);

// Approve or reject project
router.patch("/:id/status", moderateProject);

module.exports = router;