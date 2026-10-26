
const express = require("express");
const mongoose = require("mongoose");
const Skill = require("../models/Skill");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

const CATEGORIES = [
  "Technology",
  "Design",
  "Business",
  "Languages",
  "Arts & Music",
  "Academics",
  "Other",
];

const LEVELS = ["Beginner", "Intermediate", "Advanced"];
const LEARNING_TYPES = ["Exchange", "Paid"];

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function validateSkillInput(body) {
  const { title, category, description, level, learningType, price } = body;

  if (
    typeof title !== "string" ||
    title.trim().length < 2 ||
    title.trim().length > 100
  ) {
    return "Skill title must be between 2 and 100 characters.";
  }

  if (
    typeof category !== "string" ||
    !CATEGORIES.includes(category.trim())
  ) {
    return "Please select a valid skill category.";
  }

  if (
    typeof description !== "string" ||
    description.trim().length < 10 ||
    description.trim().length > 1000
  ) {
    return "Description must be between 10 and 1000 characters.";
  }

  if (!LEVELS.includes(level)) {
    return "Please select a valid skill level.";
  }

  if (!LEARNING_TYPES.includes(learningType)) {
    return "Please select Exchange or Paid.";
  }

  const numericPrice = Number(price ?? 0);

  if (!Number.isFinite(numericPrice) || numericPrice < 0) {
    return "Please enter a valid non-negative price.";
  }

  if (learningType === "Paid" && numericPrice <= 0) {
    return "Paid skills must have a price greater than zero.";
  }

  return null;
}

function buildSkillData(body, userId) {
  return {
    title: body.title.trim(),
    category: body.category.trim(),
    description: body.description.trim(),
    level: body.level,
    learningType: body.learningType,
    price: body.learningType === "Exchange" ? 0 : Number(body.price),
    ...(userId ? { offeredBy: userId } : {}),
  };
}

// GET /api/skills/stats/summary
// Keep this BEFORE /:id so "stats" is not treated as a skill ID.
router.get("/stats/summary", async (_req, res) => {
  try {
    const [totalSkills, totalUsers, exchangeSkills] = await Promise.all([
      Skill.countDocuments(),
      User.countDocuments(),
      Skill.countDocuments({ learningType: "Exchange" }),
    ]);

    return res.json({
      totalSkills,
      totalUsers,
      exchangeSkills,
    });
  } catch (error) {
    console.error("Fetch skill statistics:", error.message);
    return res.status(500).json({
      message: "Could not load statistics.",
    });
  }
});

// GET /api/skills
router.get("/", async (req, res) => {
  try {
    const { search, category, level, learningType, sort } = req.query;
    const filter = {};

    if (typeof search === "string" && search.trim()) {
      const safeSearch = escapeRegex(search.trim().slice(0, 100));

      filter.$or = [
        { title: { $regex: safeSearch, $options: "i" } },
        { description: { $regex: safeSearch, $options: "i" } },
        { category: { $regex: safeSearch, $options: "i" } },
      ];
    }

    if (typeof category === "string" && category.trim()) {
      if (!CATEGORIES.includes(category.trim())) {
        return res.status(400).json({
          message: "Invalid skill category.",
        });
      }
      filter.category = category.trim();
    }

    if (typeof level === "string" && level.trim()) {
      if (!LEVELS.includes(level.trim())) {
        return res.status(400).json({
          message: "Invalid skill level.",
        });
      }
      filter.level = level.trim();
    }

    if (typeof learningType === "string" && learningType.trim()) {
      if (!LEARNING_TYPES.includes(learningType.trim())) {
        return res.status(400).json({
          message: "Invalid teaching type.",
        });
      }
      filter.learningType = learningType.trim();
    }

    let sortOption = { createdAt: -1 };

    if (sort === "priceAsc") {
      sortOption = { price: 1, createdAt: -1 };
    } else if (sort === "priceDesc") {
      sortOption = { price: -1, createdAt: -1 };
    } else if (sort && sort !== "newest") {
      return res.status(400).json({
        message: "Invalid sort option.",
      });
    }

    const skills = await Skill.find(filter)
      .populate("offeredBy", "name role")
      .sort(sortOption)
      .limit(200)
      .lean();

    return res.json(skills);
  } catch (error) {
    console.error("Fetch skills error:", error.message);
    return res.status(500).json({
      message: "Could not fetch skills.",
    });
  }
});

// GET /api/skills/mine
router.get("/mine", authMiddleware, async (req, res) => {
  try {
    const skills = await Skill.find({ offeredBy: req.userId })
      .populate("offeredBy", "name role")
      .sort({ createdAt: -1 })
      .lean();

    return res.json(skills);
  } catch (error) {
    console.error("Fetch own skills error:", error.message);
    return res.status(500).json({
      message: "Could not fetch your listings.",
    });
  }
});

// GET /api/skills/:id
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid skill ID." });
    }

    const skill = await Skill.findById(req.params.id)
      .populate("offeredBy", "name role")
      .lean();

    if (!skill) {
      return res.status(404).json({
        message: "Skill listing not found.",
      });
    }

    return res.json(skill);
  } catch (error) {
    console.error("Fetch skill details error:", error.message);
    return res.status(500).json({
      message: "Could not fetch skill details.",
    });
  }
});

// POST /api/skills
router.post("/", authMiddleware, async (req, res) => {
  try {
    const validationError = validateSkillInput(req.body);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const skill = await Skill.create(
      buildSkillData(req.body, req.userId)
    );

    const savedSkill = await skill.populate("offeredBy", "name role");

    return res.status(201).json({
      message: "Skill added successfully!",
      skill: savedSkill,
    });
  } catch (error) {
    console.error("Add skill error:", error.message);
    return res.status(500).json({
      message: "Could not add skill.",
    });
  }
});

// PUT /api/skills/:id
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid skill ID." });
    }

    const validationError = validateSkillInput(req.body);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const skill = await Skill.findOneAndUpdate(
      {
        _id: req.params.id,
        offeredBy: req.userId,
      },
      buildSkillData(req.body),
      { new: true, runValidators: true }
    ).populate("offeredBy", "name role");

    if (!skill) {
      return res.status(404).json({
        message: "Skill not found or you cannot edit this listing.",
      });
    }

    return res.json({
      message: "Skill updated successfully!",
      skill,
    });
  } catch (error) {
    console.error("Update skill error:", error.message);
    return res.status(500).json({
      message: "Could not update skill.",
    });
  }
});

// DELETE /api/skills/:id
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid skill ID." });
    }

    const skill = await Skill.findOneAndDelete({
      _id: req.params.id,
      offeredBy: req.userId,
    });

    if (!skill) {
      return res.status(404).json({
        message: "Skill not found or you cannot delete this listing.",
      });
    }

    return res.json({
      message: "Skill deleted successfully.",
    });
  } catch (error) {
    console.error("Delete skill error:", error.message);
    return res.status(500).json({
      message: "Could not delete skill.",
    });
  }
});

module.exports = router;
