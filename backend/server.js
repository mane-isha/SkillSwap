
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");

const app = express();

app.disable("x-powered-by");

app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN
      ? process.env.FRONTEND_ORIGIN.split(",")
      : true,
  })
);

app.use(express.json({ limit: "20kb" }));

// Create the local video-upload folder if it doesn't exist.
const uploadDirectory = path.join(__dirname, "uploads", "lessons");
fs.mkdirSync(uploadDirectory, { recursive: true });

app.get("/", (_req, res) => {
  res.json({
    message: "SkillSwap API is running",
    status: "ok",
  });
});

app.get("/api/db-status", (_req, res) => {
  res.json({
    connected: mongoose.connection.readyState === 1,
    database: mongoose.connection.name || "Not connected",
  });
});

// Existing routes — preserved.
app.use("/api/auth", require("./routes/auth"));
app.use("/api/skills", require("./routes/skills"));
app.use("/api/requests", require("./routes/requests"));

app.use((_req, res) => {
  res.status(404).json({ message: "API route not found." });
});

app.use((err, _req, res, _next) => {
  console.error("Unhandled API error:", err.message);
  res.status(500).json({ message: "Unexpected server error." });
});

const PORT = process.env.PORT || 5000;

async function start() {
  if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) {
    console.error(
      "MONGODB_URI and JWT_SECRET must be configured in backend/.env"
    );
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log(`MongoDB connected: ${mongoose.connection.name}`);

    app.listen(PORT, () => {
      console.log(`SkillSwap API listening at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Could not start SkillSwap:", error.message);
    process.exit(1);
  }
}

start();
