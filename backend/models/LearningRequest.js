
const mongoose = require("mongoose");

const learningRequestSchema = new mongoose.Schema(
  {
    skill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Skill",
      required: true,
    },
    learner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected", "Cancelled"],
      default: "Pending",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

learningRequestSchema.index({
  learner: 1,
  skill: 1,
  status: 1,
});

module.exports = mongoose.model(
  "LearningRequest",
  learningRequestSchema
);
