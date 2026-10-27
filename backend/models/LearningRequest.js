sessionFormat: {
  type: String,
  enum: ["Undecided", "Live", "Recorded"],
  default: "Undecided",
},

recordedLesson: {
  fileName: { type: String, default: "" },
  originalName: { type: String, default: "" },
  mimeType: { type: String, default: "" },
  fileSize: { type: Number, default: 0 },
  uploadedAt: { type: Date, default: null },
},

meetingRoomId: {
  type: String,
  default: "",
},