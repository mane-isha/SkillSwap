
const express = require("express");
const mongoose = require("mongoose");
const authMiddleware = require("../middleware/auth");
const LearningRequest = require("../models/LearningRequest");
const Skill = require("../models/Skill");

const router = express.Router();

router.use(authMiddleware);

// GET /api/requests — learner's requests
router.get("/", async (req, res) => {
  try {
    const requests = await LearningRequest.find({
      learner: req.userId,
    })
      .populate("skill")
      .populate("learner", "name email")
      .populate("provider", "name email")
      .sort({ createdAt: -1 });

    return res.json(requests);
  } catch (error) {
    console.error("Fetch learning requests:", error.message);
    return res.status(500).json({
      message: "Could not load learning requests.",
    });
  }
});

// GET /api/requests/incoming
router.get("/incoming", async (req, res) => {
  try {
    const requests = await LearningRequest.find({
      provider: req.userId,
    })
      .populate("skill")
      .populate("learner", "name email")
      .populate("provider", "name email")
      .sort({ createdAt: -1 });

    return res.json(requests);
  } catch (error) {
    console.error("Fetch incoming requests:", error.message);
    return res.status(500).json({
      message: "Could not load incoming requests.",
    });
  }
});

// GET /api/requests/outgoing
router.get("/outgoing", async (req, res) => {
  try {
    const requests = await LearningRequest.find({
      learner: req.userId,
    })
      .populate("skill")
      .populate("learner", "name email")
      .populate("provider", "name email")
      .sort({ createdAt: -1 });

    return res.json(requests);
  } catch (error) {
    console.error("Fetch outgoing requests:", error.message);
    return res.status(500).json({
      message: "Could not load outgoing requests.",
    });
  }
});

// POST /api/requests — send a learning request
router.post("/", async (req, res) => {
  try {
    const { skillId, message = "" } = req.body;

    if (!mongoose.isValidObjectId(skillId)) {
      return res.status(400).json({
        message: "Please provide a valid skill ID.",
      });
    }

    if (typeof message !== "string" || message.length > 500) {
      return res.status(400).json({
        message: "The message must be 500 characters or fewer.",
      });
    }

    const skill = await Skill.findById(skillId);

    if (!skill) {
      return res.status(404).json({
        message: "This skill listing no longer exists.",
      });
    }

    if (String(skill.offeredBy) === String(req.userId)) {
      return res.status(400).json({
        message: "You cannot request to learn your own skill.",
      });
    }

    const existing = await LearningRequest.findOne({
      skill: skill._id,
      learner: req.userId,
      status: { $in: ["Pending", "Accepted"] },
    });

    if (existing) {
      return res.status(409).json({
        message: "You already have an active request for this skill.",
      });
    }

    const learningRequest = await LearningRequest.create({
      skill: skill._id,
      learner: req.userId,
      provider: skill.offeredBy,
      message: message.trim(),
      status: "Pending",
    });

    const populatedRequest = await LearningRequest.findById(
      learningRequest._id
    )
      .populate("skill")
      .populate("learner", "name email")
      .populate("provider", "name email");

    return res.status(201).json({
      message: "Learning request sent successfully.",
      request: populatedRequest,
    });
  } catch (error) {
    console.error("Create learning request:", error.message);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "An active request already exists for this skill.",
      });
    }

    return res.status(500).json({
      message: "Could not send learning request.",
    });
  }
});

// PATCH /api/requests/:id/status — accept or reject
router.patch("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid request ID.",
      });
    }

    if (!["Accepted", "Rejected"].includes(status)) {
      return res.status(400).json({
        message: "Status must be Accepted or Rejected.",
      });
    }

    const learningRequest = await LearningRequest.findOne({
      _id: id,
      provider: req.userId,
    });

    if (!learningRequest) {
      return res.status(404).json({
        message: "Request not found or you are not its provider.",
      });
    }

    if (learningRequest.status !== "Pending") {
      return res.status(409).json({
        message: "Only pending requests can be updated.",
      });
    }

    learningRequest.status = status;
    await learningRequest.save();

    const updatedRequest = await LearningRequest.findById(id)
      .populate("skill")
      .populate("learner", "name email")
      .populate("provider", "name email");

    return res.json({
      message: `Request ${status.toLowerCase()} successfully.`,
      request: updatedRequest,
    });
  } catch (error) {
    console.error("Update learning request:", error.message);
    return res.status(500).json({
      message: "Could not update learning request.",
    });
  }
});

// PATCH /api/requests/:id/cancel — learner cancels pending request
router.patch("/:id/cancel", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid request ID.",
      });
    }

    const learningRequest = await LearningRequest.findOne({
      _id: id,
      learner: req.userId,
    });

    if (!learningRequest) {
      return res.status(404).json({
        message: "Request not found or you cannot cancel it.",
      });
    }

    if (learningRequest.status !== "Pending") {
      return res.status(409).json({
        message: "Only pending requests can be cancelled.",
      });
    }

    learningRequest.status = "Cancelled";
    await learningRequest.save();

    const updatedRequest = await LearningRequest.findById(id)
      .populate("skill")
      .populate("learner", "name email")
      .populate("provider", "name email");

    return res.json({
      message: "Request cancelled successfully.",
      request: updatedRequest,
    });
  } catch (error) {
    console.error("Cancel learning request:", error.message);
    return res.status(500).json({
      message: "Could not cancel learning request.",
    });
  }
});

module.exports = router;
