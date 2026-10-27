
const mongoose = require("mongoose");

const learningRequestSchema = new mongoose.Schema(
  {
    // Basic learning request details
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
      default: "",
      trim: true,
    },

    // Request status
    status: {
      type: String,
      enum: [
        "Pending",
        "Accepted",
        "Rejected",
        "Cancelled",
        "Completed",
        "On hold",
      ],
      default: "Pending",
    },

    // Session format: Live or Recorded
    sessionFormat: {
      type: String,
      enum: ["Undecided", "Live", "Recorded"],
      default: "Undecided",
    },

    // Recorded lesson metadata
    recordedLesson: {
      fileName: { type: String, default: "" },
      originalName: { type: String, default: "" },
      mimeType: { type: String, default: "" },
      fileSize: { type: Number, default: 0 },
      uploadedAt: { type: Date, default: null },
    },

    // Live meeting room
    meetingRoomId: {
      type: String,
      default: "",
    },

    // Proposed dates and selected appointment
    proposedSlots: {
      type: [Date],
      default: [],
    },

    selectedSlot: {
      type: Date,
      default: null,
    },

    // Booking confirmations
    learnerConfirmed: {
      type: Boolean,
      default: false,
    },

    providerConfirmed: {
      type: Boolean,
      default: false,
    },

    bookingStatus: {
      type: String,
      enum: [
        "Not scheduled",
        "Awaiting selection",
        "Awaiting confirmation",
        "Booked",
        "Completed",
        "Cancelled",
      ],
      default: "Not scheduled",
    },

    // Session completion
    completedAt: {
      type: Date,
      default: null,
    },

    // Both participants can confirm completion
    completedBy: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      default: [],
    },

    // Cancellation details
    cancellationReason: {
      type: String,
      default: "",
    },

    cancelledAt: {
      type: Date,
      default: null,
    },

    // Payment details
    paymentStatus: {
      type: String,
      enum: [
        "Not required",
        "Pending",
        "Paid",
        "Refund pending",
        "Refunded",
      ],
      default: "Not required",
    },

    agreedAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Reports
    reports: [
      {
        reportedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        reason: {
          type: String,
          default: "",
        },
        details: {
          type: String,
          default: "",
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Conversation messages
    messages: [
      {
        sender: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        text: {
          type: String,
          default: "",
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for faster request queries
learningRequestSchema.index({
  learner: 1,
  skill: 1,
  status: 1,
});

learningRequestSchema.index({
  provider: 1,
  status: 1,
});

module.exports = mongoose.model(
  "LearningRequest",
  learningRequestSchema
);
