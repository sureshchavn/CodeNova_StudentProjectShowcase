const mongoose = require("mongoose");

const moderationHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["approved", "rejected"],
      required: true
    },
    reason: {
      type: String,
      default: ""
    },
    reviewedAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    studentName: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    tags: {
      type: [String],
      required: true,
      validate: {
        validator: (tags) => tags.length > 0,
        message: "At least one tag is required."
      }
    },
    githubLink: {
      type: String,
      trim: true,
      default: ""
    },
    livePreviewUrl: {
      type: String,
      trim: true,
      default: ""
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: ""
    },
    moderationHistory: {
      type: [moderationHistorySchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Project", projectSchema);