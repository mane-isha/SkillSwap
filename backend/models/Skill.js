
// const mongoose = require("mongoose");

// const skillSchema = new mongoose.Schema(
//   {
//     title: {
//       type: String,
//       required: true,
//       trim: true,
//       maxlength: 100,
//     },

//     category: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     description: {
//       type: String,
//       required: true,
//       trim: true,
//       maxlength: 1000,
//     },

//     level: {
//       type: String,
//       enum: ["Beginner", "Intermediate", "Advanced"],
//       default: "Beginner",
//     },

//     learningType: {
//       type: String,
//       enum: ["Exchange", "Paid"],
//       required: true,
//     },

//     price: {
//       type: Number,
//       default: 0,
//       min: 0,
//     },

//     offeredBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Skill", skillSchema);
//----------------------------------------
const mongoose = require("mongoose");
const skillSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
  category: { type: String, required: true, enum: ["Technology", "Design", "Business", "Languages", "Arts & Music", "Academics", "Other"] },
  description: { type: String, required: true, trim: true, minlength: 10, maxlength: 1000 },
  level: { type: String, enum: ["Beginner", "Intermediate", "Advanced"], default: "Beginner" },
  learningType: { type: String, enum: ["Exchange", "Paid"], required: true },
  price: { type: Number, default: 0, min: 0, validate: { validator: function(v) { return this.learningType !== "Paid" || v > 0; }, message: "Paid skills need a price greater than zero." } },
  offeredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
}, { timestamps: true });
module.exports = mongoose.model("Skill", skillSchema);
