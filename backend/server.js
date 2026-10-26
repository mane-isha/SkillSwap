
// const express = require("express");
// const cors = require("cors");
// const mongoose = require("mongoose");
// require("dotenv").config();

// const app = express();

// app.use(cors());
// app.use(express.json({ limit: "10kb" }));

// app.get("/", (req, res) => {
//   res.json({
//     message: "SkillSwap backend is running!",
//   });
// });

// app.get("/api/db-status", (req, res) => {
//   res.json({
//     connected: mongoose.connection.readyState === 1,
//     database: mongoose.connection.name || "Not connected",
//   });
// });

// // Authentication endpoints
// app.use("/api/auth", require("./routes/auth"));
// app.use("/api/skills", require("./routes/skills"));

// const PORT = process.env.PORT || 5000;

// async function startServer() {
//   try {
//     if (!process.env.MONGODB_URI) {
//       throw new Error("MONGODB_URI is missing from .env");
//     }

//     if (!process.env.JWT_SECRET) {
//       throw new Error("JWT_SECRET is missing from .env");
//     }

//     await mongoose.connect(process.env.MONGODB_URI);
//     console.log("✅ MongoDB connected successfully!");

//     app.listen(PORT, () => {
//       console.log(
//         `🚀 SkillSwap backend running on port ${PORT}`
//       );
//     });
//   } catch (error) {
//     console.error(
//       "❌ Server startup failed:",
//       error.message
//     );
//     process.exitCode = 1;
//   }
// }

// startServer();

//-----------------------------
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();
app.disable("x-powered-by");
app.use(cors({ origin: process.env.FRONTEND_ORIGIN ? process.env.FRONTEND_ORIGIN.split(",") : true }));
app.use(express.json({ limit: "20kb" }));
app.get("/", (_req, res) => res.json({ message: "SkillSwap API is running", status: "ok" }));
app.get("/api/db-status", (_req, res) => res.json({ connected: mongoose.connection.readyState === 1, database: mongoose.connection.name || "Not connected" }));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/skills", require("./routes/skills"));
app.use("/api/requests", require("./routes/requests"));
app.use((req, res) => res.status(404).json({ message: "API route not found." }));
app.use((err, _req, res, _next) => { console.error("Unhandled API error:", err.message); res.status(500).json({ message: "Unexpected server error." }); });
const PORT = process.env.PORT || 5000;
async function start() {
  if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) { console.error("MONGODB_URI and JWT_SECRET must be configured in backend/.env"); process.exit(1); }
  try { await mongoose.connect(process.env.MONGODB_URI); console.log(`MongoDB connected: ${mongoose.connection.name}`); app.listen(PORT, () => console.log(`SkillSwap API listening at http://localhost:${PORT}`)); }
  catch (e) { console.error("Could not start SkillSwap:", e.message); process.exit(1); }
}
start();

