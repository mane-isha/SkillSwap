
// const mongoose = require("mongoose");

// const userSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//       trim: true,
//       minlength: 2,
//       maxlength: 60,
//     },
//     email: {
//       type: String,
//       required: true,
//       unique: true,
//       lowercase: true,
//       trim: true,
//     },
//     password: {
//       type: String,
//       required: true,
//       select: false,
//     },
//     role: {
//       type: String,
//       enum: ["student", "teacher"],
//       default: "student",
//     },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("User", userSchema);

//-------------------------
const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 60 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ["student", "teacher"], default: "student" },
  bio: { type: String, trim: true, maxlength: 300, default: "" },
  college: { type: String, trim: true, maxlength: 120, default: "" },
}, { timestamps: true });
module.exports = mongoose.model("User", userSchema);
