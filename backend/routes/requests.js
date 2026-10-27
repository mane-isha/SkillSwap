const multer = require("multer");
const path = require("path");
const fs = require("fs");
const express = require("express");
const mongoose = require("mongoose");
const authMiddleware = require("../middleware/auth");
const LearningRequest = require("../models/LearningRequest");
const Skill = require("../models/Skill");

const router = express.Router();
router.use(authMiddleware);

const validId = mongoose.isValidObjectId;

const getRequest = (id) =>
  LearningRequest.findById(id)
    .populate("skill")
    .populate("learner", "name email")
    .populate("provider", "name email")
    .populate("messages.sender", "name")
    .populate("reports.reportedBy", "name");

const participantRequest = (id, userId) =>
  LearningRequest.findOne({
    _id: id,
    $or: [{ learner: userId }, { provider: userId }],
  });

const isProvider = (r, uid) =>
  String(r.provider) === String(uid);

const isLearner = (r, uid) =>
  String(r.learner) === String(uid);

const isParticipant = (r, uid) =>
  isProvider(r, uid) || isLearner(r, uid);

const isOnHold = (r) => r.status === "On hold";
const lessonDirectory = path.join(
  __dirname,
  "..",
  "uploads",
  "lessons"
);

fs.mkdirSync(lessonDirectory, { recursive: true });

const lessonStorage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, lessonDirectory);
  },

  filename: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    callback(null, `${req.params.id}-${Date.now()}${extension}`);
  },
});

const lessonUpload = multer({
  storage: lessonStorage,
  limits: {
    fileSize: 200 * 1024 * 1024, // 200 MB
  },
  fileFilter: (_req, file, callback) => {
    const allowedTypes = [
      "video/mp4",
      "video/webm",
      "video/quicktime",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      return callback(null, true);
    }

    callback(new Error("Upload an MP4, WebM, or MOV video."));
  },
});
// Learner requests
router.get("/", async (req, res) => {
  try {
    const data = await LearningRequest.find({ learner: req.userId })
      .populate("skill")
      .populate("learner", "name email")
      .populate("provider", "name email")
      .sort({ createdAt: -1 });
    res.json(data);
  } catch (e) {
    res.status(500).json({ message: "Could not load requests." });
  }
});

// Incoming provider requests
router.get("/incoming", async (req, res) => {
  try {
    const data = await LearningRequest.find({ provider: req.userId })
      .populate("skill")
      .populate("learner", "name email")
      .populate("provider", "name email")
      .sort({ createdAt: -1 });
    res.json(data);
  } catch (e) {
    res.status(500).json({ message: "Could not load incoming requests." });
  }
});

// Outgoing learner requests
router.get("/outgoing", async (req, res) => {
  try {
    const data = await LearningRequest.find({ learner: req.userId })
      .populate("skill")
      .populate("learner", "name email")
      .populate("provider", "name email")
      .sort({ createdAt: -1 });
    res.json(data);
  } catch (e) {
    res.status(500).json({ message: "Could not load outgoing requests." });
  }
});

// Create request
router.post("/", async (req, res) => {
  try {
    const { skillId, message = "" } = req.body;

    if (!validId(skillId))
      return res.status(400).json({ message: "Invalid skill ID." });

    if (typeof message !== "string" || message.length > 500)
      return res.status(400).json({ message: "Message must be 500 characters or fewer." });

    const skill = await Skill.findById(skillId);
    if (!skill)
      return res.status(404).json({ message: "Skill listing not found." });

    if (String(skill.offeredBy) === String(req.userId))
      return res.status(400).json({ message: "You cannot request your own skill." });

    const existing = await LearningRequest.findOne({
      skill: skill._id,
      learner: req.userId,
      status: { $in: ["Pending", "Accepted", "On hold"] },
    });

    if (existing)
      return res.status(409).json({ message: "You already have an active request for this skill." });

    const paid = skill.learningType === "Paid";
    const created = await LearningRequest.create({
      skill: skill._id,
      learner: req.userId,
      provider: skill.offeredBy,
      message: message.trim(),
      status: "Pending",
      agreedAmount: paid ? Number(skill.price || 0) : 0,
      paymentStatus: paid ? "Pending" : "Not required",
    });

    res.status(201).json({
      message: "Learning request sent.",
      request: await getRequest(created._id),
    });
  } catch (e) {
    console.error("Create request:", e.message);
    res.status(500).json({ message: "Could not send request." });
  }
});

// Accept or reject
router.patch("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!validId(id))
      return res.status(400).json({ message: "Invalid request ID." });

    if (!["Accepted", "Rejected"].includes(status))
      return res.status(400).json({ message: "Status must be Accepted or Rejected." });

    const r = await LearningRequest.findOne({
      _id: id,
      provider: req.userId,
      status: "Pending",
    });

    if (!r)
      return res.status(404).json({ message: "Pending request not found." });

    r.status = status;
    await r.save();

    res.json({ message: `Request ${status.toLowerCase()}.`, request: await getRequest(id) });
  } catch (e) {
    res.status(500).json({ message: "Could not update request." });
  }
});

// Cancel pending request or accepted session
router.patch("/:id/cancel", async (req, res) => {
  try {
    const { id } = req.params;
    const { reason = "" } = req.body;

    if (!validId(id))
      return res.status(400).json({ message: "Invalid request ID." });

    if (typeof reason !== "string" || reason.length > 500)
      return res.status(400).json({ message: "Reason must be 500 characters or fewer." });

    const r = await participantRequest(id, req.userId);
    if (!r)
      return res.status(404).json({ message: "Request not found." });

    if (!["Pending", "Accepted"].includes(r.status))
      return res.status(409).json({ message: "This request cannot be cancelled in its current state." });

    if (r.status === "Accepted" && r.bookingStatus === "Booked" && r.selectedSlot < new Date())
      return res.status(409).json({ message: "Past booked sessions cannot be cancelled here. Contact support." });

    r.status = "Cancelled";
    r.bookingStatus = "Cancelled";
    r.cancelledAt = new Date();
    r.cancellationReason = reason.trim();

    if (r.agreedAmount > 0 && r.paymentStatus === "Paid")
      r.paymentStatus = "Refund pending";

    await r.save();
    res.json({ message: "Request cancelled.", request: await getRequest(id) });
  } catch (e) {
    console.error("Cancel request:", e.message);
    res.status(500).json({ message: "Could not cancel request." });
  }
});

// Read messages
router.get("/:id/messages", async (req, res) => {
  try {
    if (!validId(req.params.id))
      return res.status(400).json({ message: "Invalid request ID." });

    const r = await participantRequest(req.params.id, req.userId);
    if (!r)
      return res.status(404).json({ message: "Conversation not found." });

    if (r.status !== "Accepted")
      return res.status(403).json({ message: "Messaging requires an accepted request." });

    const populated = await getRequest(r._id);
    res.json(populated.messages);
  } catch (e) {
    res.status(500).json({ message: "Could not load messages." });
  }
});

// Send message
router.post("/:id/messages", async (req, res) => {
  try {
    if (!validId(req.params.id))
      return res.status(400).json({ message: "Invalid request ID." });

    const { text } = req.body;
    if (typeof text !== "string" || !text.trim() || text.trim().length > 2000)
      return res.status(400).json({ message: "Message must contain 1–2000 characters." });

    const r = await participantRequest(req.params.id, req.userId);
    if (!r)
      return res.status(404).json({ message: "Conversation not found." });

    if (r.status !== "Accepted")
      return res.status(403).json({ message: "Messaging is unavailable for this request." });

    r.messages.push({ sender: req.userId, text: text.trim() });
    await r.save();

    const populated = await getRequest(r._id);
    res.status(201).json({ message: "Message sent.", messages: populated.messages });
  } catch (e) {
    res.status(500).json({ message: "Could not send message." });
  }
});

// Session scheduling and payment-status record
router.patch("/:id/session", async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;

    if (!validId(id))
      return res.status(400).json({ message: "Invalid request ID." });

    const r = await participantRequest(id, req.userId);
    if (!r)
      return res.status(404).json({ message: "Session request not found." });

    if (r.status !== "Accepted")
      return res.status(409).json({ message: "Only accepted requests can be scheduled." });

    const provider = isProvider(r, req.userId);
    const learner = isLearner(r, req.userId);

    if (action === "propose_slots") {
      if (!provider)
        return res.status(403).json({ message: "Only the provider can propose slots." });

      const slots = req.body.slots;
      if (!Array.isArray(slots) || slots.length < 1 || slots.length > 10)
        return res.status(400).json({ message: "Provide 1–10 time slots." });

      const parsed = slots.map((s) => new Date(s));
      if (parsed.some((d) => Number.isNaN(d.getTime()) || d <= new Date()))
        return res.status(400).json({ message: "All slots must be valid future dates." });

      r.proposedSlots = parsed;
      r.selectedSlot = null;
      r.learnerConfirmed = false;
      r.providerConfirmed = false;
      r.bookingStatus = "Awaiting selection";
    } else if (action === "book_slot") {
      if (!learner)
        return res.status(403).json({ message: "Only the learner can select a slot." });

      const chosen = new Date(req.body.slot);
      if (Number.isNaN(chosen.getTime()) ||
          !r.proposedSlots.some((s) => new Date(s).getTime() === chosen.getTime()))
        return res.status(400).json({ message: "Choose a proposed slot." });

      r.selectedSlot = chosen;
      r.learnerConfirmed = true;
      r.providerConfirmed = false;
      r.bookingStatus = "Awaiting confirmation";
    } else if (action === "confirm_booking") {
      if (!r.selectedSlot)
        return res.status(409).json({ message: "Select a slot first." });

      if (provider) r.providerConfirmed = true;
      if (learner) r.learnerConfirmed = true;

      r.bookingStatus = r.providerConfirmed && r.learnerConfirmed
        ? "Booked"
        : "Awaiting confirmation";
    } else if (action === "set_format") {
      if (!["Live", "Recorded"].includes(req.body.format))
        return res.status(400).json({ message: "Format must be Live or Recorded." });
      r.sessionFormat = req.body.format;
    } else if (action === "set_payment_status") {
      return res.status(410).json({
        message: "Payment status cannot be marked Paid manually through this endpoint. Integrate a verified payment gateway first.",
      });
    } else {
      return res.status(400).json({ message: "Unknown session action." });
    }

    await r.save();
    res.json({ message: "Session updated.", request: await getRequest(id) });
  } catch (e) {
    console.error("Update session:", e.message);
    res.status(500).json({ message: "Could not update session." });
  }
});

// Complete session: both participants must confirm
router.patch("/:id/complete", async (req, res) => {
  try {
    if (!validId(req.params.id))
      return res.status(400).json({ message: "Invalid request ID." });

    const r = await participantRequest(req.params.id, req.userId);
    if (!r)
      return res.status(404).json({ message: "Session not found." });

    if (r.status !== "Accepted")
      return res.status(409).json({ message: "Only accepted sessions can be completed." });

    if (r.bookingStatus !== "Booked")
      return res.status(409).json({ message: "Both participants must book and confirm the session first." });

    if (!r.completedBy.some((uid) => String(uid) === String(req.userId))) {
      r.completedBy.push(req.userId);
    }

    if (r.completedBy.some((uid) => String(uid) === String(r.learner)) &&
        r.completedBy.some((uid) => String(uid) === String(r.provider))) {
      r.status = "Completed";
      r.bookingStatus = "Completed";
      r.completedAt = new Date();
    }

    await r.save();
    res.json({
      message: r.status === "Completed"
        ? "Session completed by both participants."
        : "Your completion confirmation was saved. Waiting for the other participant.",
      request: await getRequest(r._id),
    });
  } catch (e) {
    res.status(500).json({ message: "Could not complete session." });
  }
});

// Submit a report; puts the request on hold for review
router.post("/:id/report", async (req, res) => {
  try {
    if (!validId(req.params.id))
      return res.status(400).json({ message: "Invalid request ID." });

    const { reason, description } = req.body;
    const allowed = [
      "Misconduct", "Harassment", "No-show",
      "Payment issue", "Misleading listing", "Other",
    ];

    if (!allowed.includes(reason))
      return res.status(400).json({ message: "Choose a valid report reason." });

    if (typeof description !== "string" ||
        !description.trim() || description.trim().length > 2000)
      return res.status(400).json({ message: "Description must contain 1–2000 characters." });

    const r = await participantRequest(req.params.id, req.userId);
    if (!r)
      return res.status(404).json({ message: "Request not found." });

    if (["Rejected", "Cancelled"].includes(r.status))
      return res.status(409).json({ message: "Cannot report this request in its current state." });

    const alreadyReported = r.reports.some(
      (report) => String(report.reportedBy) === String(req.userId) &&
        report.status === "Under review"
    );

    if (alreadyReported)
      return res.status(409).json({ message: "You already have a report under review." });

    r.reports.push({
      reportedBy: req.userId,
      reason,
      description: description.trim(),
      status: "Under review",
    });
    r.status = "On hold";
    await r.save();

    res.status(201).json({
      message: "Report submitted. This session is on hold pending review.",
      request: await getRequest(r._id),
    });
  } catch (e) {
    console.error("Submit report:", e.message);
    res.status(500).json({ message: "Could not submit report." });
  }
});

// Read reports for this request; participants only
router.get("/:id/reports", async (req, res) => {
  try {
    if (!validId(req.params.id))
      return res.status(400).json({ message: "Invalid request ID." });

    const r = await participantRequest(req.params.id, req.userId);
    if (!r)
      return res.status(404).json({ message: "Request not found." });

    res.json(r.reports);
  } catch (e) {
    res.status(500).json({ message: "Could not load reports." });
  }
});
// Upload a recorded lesson — provider only.
router.post(
  "/:id/lesson",
  (req, res, next) => {
    lessonUpload.single("lesson")(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          message:
            err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE"
              ? "Video must be 200 MB or smaller."
              : err.message || "Video upload failed.",
        });
      }

      next();
    });
  },
  async (req, res) => {
    let uploadedFilePath;

    try {
      if (!validId(req.params.id)) {
        return res.status(400).json({ message: "Invalid request ID." });
      }

      const request = await LearningRequest.findById(req.params.id);

      if (!request) {
        return res.status(404).json({ message: "Request not found." });
      }

      if (!isParticipant(request, req.userId)) {
        return res.status(403).json({ message: "Access denied." });
      }

      if (!isProvider(request, req.userId)) {
        return res.status(403).json({
          message: "Only the skill provider can upload a lesson.",
        });
      }

      if (request.status !== "Accepted") {
        return res.status(400).json({
          message: "Only accepted sessions can have lessons uploaded.",
        });
      }

      if (request.sessionFormat !== "Recorded") {
        return res.status(400).json({
          message: "Select Recorded format before uploading a lesson.",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          message: "Please choose a video file first.",
        });
      }

      uploadedFilePath = req.file.path;

      const previousFileName = request.recordedLesson?.fileName;

      request.recordedLesson = {
        fileName: req.file.filename,
        originalName: path.basename(req.file.originalname),
        mimeType: req.file.mimetype,
        fileSize: req.file.size,
        uploadedAt: new Date(),
      };

      await request.save();

      // Remove the previous recording only after the new one saves.
      if (previousFileName && previousFileName !== req.file.filename) {
        const oldPath = path.join(lessonDirectory, previousFileName);

        if (fs.existsSync(oldPath)) {
          fs.unlink(oldPath, () => {});
        }
      }

      return res.json({
        message: "Recorded lesson uploaded successfully.",
        lesson: {
          originalName: request.recordedLesson.originalName,
          fileSize: request.recordedLesson.fileSize,
          uploadedAt: request.recordedLesson.uploadedAt,
        },
      });
    } catch (error) {
      if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
        fs.unlink(uploadedFilePath, () => {});
      }

      console.error("Lesson upload error:", error.message);

      return res.status(500).json({
        message: "Could not save the recorded lesson.",
      });
    }
  }
);

// Get lesson information — participants only.
router.get("/:id/lesson", async (req, res) => {
  try {
    if (!validId(req.params.id)) {
      return res.status(400).json({ message: "Invalid request ID." });
    }

    const request = await LearningRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found." });
    }

    if (!isParticipant(request, req.userId)) {
      return res.status(403).json({ message: "Access denied." });
    }

    if (!request.recordedLesson?.fileName) {
      return res.status(404).json({ message: "No lesson has been uploaded yet." });
    }

    return res.json({
      lesson: {
        originalName: request.recordedLesson.originalName,
        fileSize: request.recordedLesson.fileSize,
        uploadedAt: request.recordedLesson.uploadedAt,
        playbackUrl: `/requests/${request._id}/lesson/video`,
      },
    });
  } catch (error) {
    console.error("Lesson lookup error:", error.message);
    return res.status(500).json({ message: "Could not load lesson details." });
  }
});

// Stream the video securely — participants only.
router.get("/:id/lesson/video", async (req, res) => {
  try {
    if (!validId(req.params.id)) {
      return res.status(400).json({ message: "Invalid request ID." });
    }

    const request = await LearningRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found." });
    }

    if (!isParticipant(request, req.userId)) {
      return res.status(403).json({ message: "Access denied." });
    }

    const lesson = request.recordedLesson;

    if (!lesson?.fileName) {
      return res.status(404).json({ message: "No recorded lesson found." });
    }

    // Prevent path traversal: only accept a plain filename.
    if (path.basename(lesson.fileName) !== lesson.fileName) {
      return res.status(400).json({ message: "Invalid lesson filename." });
    }

    const filePath = path.join(lessonDirectory, lesson.fileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Lesson video file is missing." });
    }

    res.setHeader("Content-Type", lesson.mimeType || "video/mp4");
    res.setHeader("Accept-Ranges", "bytes");
    res.setHeader("Cache-Control", "private, no-store");

    return res.sendFile(filePath);
  } catch (error) {
    console.error("Lesson playback error:", error.message);
    return res.status(500).json({ message: "Could not play the lesson." });
  }
});
module.exports = router;
