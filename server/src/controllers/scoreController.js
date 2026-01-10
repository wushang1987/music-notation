const Score = require("../models/Score");
const mongoose = require("mongoose");

const parseInstrumentProgram = (value) => {
  if (value === undefined) return undefined;
  if (value === null || value === "") return 0;
  const n = Number.parseInt(value, 10);
  if (Number.isNaN(n) || n < 0 || n > 127) return null;
  return n;
};

const normalizeParts = (parts) => {
  if (!Array.isArray(parts)) return undefined;
  return parts.map((p, i) => ({
    name: p.name || `Part ${i + 1}`,
    program: parseInstrumentProgram(p.program) || 0,
    content: p.content || "",
    voiceId: p.voiceId || `${i + 1}`,
  }));
};

// Normalize tags from array or comma-separated string
const normalizeTags = (tags) => {
  try {
    let arr = [];
    if (Array.isArray(tags)) arr = tags;
    else if (typeof tags === "string") arr = tags.split(",");
    const cleaned = arr
      .map((t) => (typeof t === "string" ? t.trim() : ""))
      .filter(Boolean)
      .map((t) => t.toLowerCase());
    // dedupe and cap to 10 tags
    return Array.from(new Set(cleaned)).slice(0, 10);
  } catch {
    return [];
  }
};

const createScore = async (req, res) => {
  try {
    const {
      title,
      content,
      isPublic,
      tags,
      instrumentProgram,
      parts,
      notationType,
    } = req.body;
    const parsedProgram = parseInstrumentProgram(instrumentProgram);
    if (parsedProgram === null) {
      return res.status(400).json({
        message:
          "Invalid instrumentProgram (must be an integer between 0 and 127)",
      });
    }

    let finalParts = normalizeParts(parts);
    let finalContent = content;
    let finalProgram = parsedProgram;

    // If parts provided, sync back to legacy fields for compatibility
    if (finalParts && finalParts.length > 0) {
      finalContent = finalParts[0].content;
      finalProgram = finalParts[0].program;
    } else {
      // If no parts, build from legacy
      finalParts = [
        {
          name: "Main",
          program: parsedProgram !== undefined ? parsedProgram : 0,
          content: content || "",
          voiceId: "1",
        },
      ];
    }

    const score = new Score({
      title,
      content: finalContent,
      isPublic,
      owner: req.user.id,
      tags: normalizeTags(tags),
      instrumentProgram: finalProgram !== undefined ? finalProgram : 0,
      parts: finalParts,
      notationType: notationType || "abcjs",
    });
    const savedScore = await score.save();
    res.status(201).json(savedScore);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating score", error: error.message });
  }
};


const getScores = async (req, res) => {
  try {
    const { search, page = 1, limit = 12 } = req.query;
    const sortBy = (req.query.sortBy || "date").toString();
    const order = (req.query.order || "desc").toString();
    const sortDir = order === "asc" ? 1 : -1;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const tagsQuery = normalizeTags(req.query.tags);

    // Base filter for public scores or owned scores
    let filter =
      req.user && req.user.role === "admin"
        ? {}
        : {
            $or: [{ isPublic: true }, { owner: req.user ? req.user.id : null }],
          };

    // Add search filtering if provided
    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }
    if (tagsQuery && tagsQuery.length) {
      filter.tags = { $in: tagsQuery };
    }

    const total = await Score.countDocuments(filter);
    let scores;
    let effectiveTotal = total;

    if (sortBy === "likes") {
      const matchFilter =
        req.user && req.user.role === "admin"
          ? {}
          : req.user
          ? {
              $or: [
                { isPublic: true },
                { owner: new mongoose.Types.ObjectId(req.user.id) },
              ],
            }
          : { isPublic: true };

      if (search) {
        matchFilter.title = { $regex: search, $options: "i" };
      }
      if (tagsQuery && tagsQuery.length) {
        matchFilter.tags = { $in: tagsQuery };
      }

      effectiveTotal = await Score.countDocuments(matchFilter);

      scores = await Score.aggregate([
        { $match: matchFilter },
        { $addFields: { likesCount: { $size: { $ifNull: ["$likes", []] } } } },
        { $sort: { likesCount: sortDir, createdAt: -1 } },
        { $skip: skip },
        { $limit: parseInt(limit) },
        {
          $lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "owner",
          },
        },
        { $unwind: { path: "$owner", preserveNullAndEmptyArrays: true } },
        { $project: { "owner.password": 0 } },
      ]);
    } else if (sortBy === "rating") {
      const matchFilter =
        req.user && req.user.role === "admin"
          ? {}
          : req.user
          ? {
              $or: [
                { isPublic: true },
                { owner: new mongoose.Types.ObjectId(req.user.id) },
              ],
            }
          : { isPublic: true };

      if (search) {
        matchFilter.title = { $regex: search, $options: "i" };
      }
      if (tagsQuery && tagsQuery.length) {
        matchFilter.tags = { $in: tagsQuery };
      }

      effectiveTotal = await Score.countDocuments(matchFilter);

      scores = await Score.aggregate([
        { $match: matchFilter },
        {
          $addFields: {
            avgRating: {
              $ifNull: [
                {
                  $avg: {
                    $map: {
                      input: { $ifNull: ["$ratings", []] },
                      as: "r",
                      in: "$$r.value",
                    },
                  },
                },
                0,
              ],
            },
          },
        },
        { $sort: { avgRating: sortDir, createdAt: -1 } },
        { $skip: skip },
        { $limit: parseInt(limit) },
        {
          $lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "owner",
          },
        },
        { $unwind: { path: "$owner", preserveNullAndEmptyArrays: true } },
        { $project: { "owner.password": 0 } },
      ]);
    } else if (sortBy === "rating") {
      scores = await Score.aggregate([
        { $match: filter },
        {
          $addFields: {
            avgRating: {
              $ifNull: [
                {
                  $avg: {
                    $map: {
                      input: { $ifNull: ["$ratings", []] },
                      as: "r",
                      in: "$$r.value",
                    },
                  },
                },
                0,
              ],
            },
          },
        },
        { $sort: { avgRating: sortDir, createdAt: -1 } },
        { $skip: skip },
        { $limit: parseInt(limit) },
        {
          $lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "owner",
          },
        },
        { $unwind: { path: "$owner", preserveNullAndEmptyArrays: true } },
        { $project: { "owner.password": 0 } },
      ]);
    } else {
      const sortField = sortBy === "views" ? "views" : "createdAt";
      scores = await Score.find(filter)
        .populate("owner", "username")
        .sort({ [sortField]: sortDir, _id: -1 })
        .skip(skip)
        .limit(parseInt(limit));
    }

    res.json({
      scores,
      total: effectiveTotal,
      page: parseInt(page),
      totalPages: Math.ceil(effectiveTotal / parseInt(limit)),
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching scores", error: error.message });
  }
};

const getMyScores = async (req, res) => {
  try {
    const { search, page = 1, limit = 12 } = req.query;
    const sortBy = (req.query.sortBy || "date").toString();
    const order = (req.query.order || "desc").toString();
    const sortDir = order === "asc" ? 1 : -1;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const tagsQuery = normalizeTags(req.query.tags);

    let filter = { owner: new mongoose.Types.ObjectId(req.user.id) };
    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }
    if (tagsQuery && tagsQuery.length) {
      filter.tags = { $in: tagsQuery };
    }

    const total = await Score.countDocuments(filter);
    let scores;

    if (sortBy === "likes") {
      scores = await Score.aggregate([
        { $match: filter },
        { $addFields: { likesCount: { $size: { $ifNull: ["$likes", []] } } } },
        { $sort: { likesCount: sortDir, createdAt: -1 } },
        { $skip: skip },
        { $limit: parseInt(limit) },
        {
          $lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "owner",
          },
        },
        { $unwind: { path: "$owner", preserveNullAndEmptyArrays: true } },
        { $project: { "owner.password": 0 } },
      ]);
    } else if (sortBy === "rating") {
      scores = await Score.aggregate([
        { $match: filter },
        {
          $addFields: {
            avgRating: {
              $ifNull: [
                {
                  $avg: {
                    $map: {
                      input: { $ifNull: ["$ratings", []] },
                      as: "r",
                      in: "$$r.value",
                    },
                  },
                },
                0,
              ],
            },
          },
        },
        { $sort: { avgRating: sortDir, createdAt: -1 } },
        { $skip: skip },
        { $limit: parseInt(limit) },
        {
          $lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "owner",
          },
        },
        { $unwind: { path: "$owner", preserveNullAndEmptyArrays: true } },
        { $project: { "owner.password": 0 } },
      ]);
    } else {
      const sortField = sortBy === "views" ? "views" : "createdAt";
      scores = await Score.find(filter)
        .populate("owner", "username")
        .sort({ [sortField]: sortDir, _id: -1 })
        .skip(skip)
        .limit(parseInt(limit));
    }

    res.json({
      scores,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching scores", error: error.message });
  }
};

const getScoreById = async (req, res) => {
  try {
    const score = await Score.findById(req.params.id).populate(
      "owner",
      "username"
    );
    if (!score) return res.status(404).json({ message: "Score not found" });

    // access check
    const isOwner =
      score.owner &&
      req.user &&
      (score.owner._id.toString() === req.user.id ||
        score.owner.toString() === req.user.id);
    const isAdmin = req.user && req.user.role === "admin";

    if (!score.isPublic && !isOwner && !isAdmin) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this score" });
    }

    // Respect opt-out flag to avoid counting views in editor or special cases
    const noCount = req.query.noCount === "1" || req.query.noCount === "true";
    if (noCount) {
      return res.json(score);
    }

    // Increment views atomically and return updated document
    const updated = await Score.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate("owner", "username");

    const resultDoc = updated || score;
    const resultObj = resultDoc.toObject();

    // Lazy migration: ensure parts exist
    if (!resultObj.parts || resultObj.parts.length === 0) {
      resultObj.parts = [
        {
          name: "Main",
          program: resultObj.instrumentProgram || 0,
          content: resultObj.content || "",
          voiceId: "1",
        },
      ];
    }

    return res.json(resultObj);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching score", error: error.message });
  }
};

const updateScore = async (req, res) => {
  try {
    const score = await Score.findById(req.params.id);
    if (!score) return res.status(404).json({ message: "Score not found" });

    if (
      score.owner &&
      score.owner.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res
        .status(401)
        .json({ message: "Not authorized to edit this score" });
    }

    const {
      title,
      content,
      isPublic,
      tags,
      instrumentProgram,
      parts,
      notationType,
    } = req.body;
    const parsedProgram = parseInstrumentProgram(instrumentProgram);
    if (parsedProgram === null) {
      return res.status(400).json({
        message:
          "Invalid instrumentProgram (must be an integer between 0 and 127)",
      });
    }

    score.title = title || score.title;
    score.isPublic = isPublic !== undefined ? isPublic : score.isPublic;
    score.notationType = notationType || score.notationType;
    if (tags !== undefined) {
      score.tags = normalizeTags(tags);
    }


    // Handle parts update with backward compatibility
    if (parts !== undefined) {
      const normalized = normalizeParts(parts);
      if (normalized && normalized.length > 0) {
        score.parts = normalized;
        // Sync back to legacy fields
        score.content = normalized[0].content;
        score.instrumentProgram = normalized[0].program;
      }
    } else {
      // Legacy update path
      if (content !== undefined) score.content = content;
      if (parsedProgram !== undefined) score.instrumentProgram = parsedProgram;

      // Sync forward to parts
      if (!score.parts || score.parts.length === 0) {
        score.parts = [
          {
            name: "Main",
            program: score.instrumentProgram,
            content: score.content,
            voiceId: "1",
          },
        ];
      } else {
        // Update first part if it exists
        if (content !== undefined) score.parts[0].content = content;
        if (parsedProgram !== undefined) score.parts[0].program = parsedProgram;
      }
    }

    const updatedScore = await score.save();
    res.json(updatedScore);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating score", error: error.message });
  }
};

const deleteScore = async (req, res) => {
  try {
    const score = await Score.findById(req.params.id);
    if (!score) return res.status(404).json({ message: "Score not found" });

    if (
      score.owner &&
      score.owner.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res
        .status(401)
        .json({ message: "Not authorized to delete this score" });
    }

    await score.deleteOne();
    res.json({ message: "Score removed" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting score", error: error.message });
  }
};

const toggleLike = async (req, res) => {
  try {
    const score = await Score.findById(req.params.id);
    if (!score) return res.status(404).json({ message: "Score not found" });

    // Ensure likes array exists (migration support)
    if (!score.likes) score.likes = [];

    const index = score.likes.indexOf(req.user.id);
    if (index === -1) {
      score.likes.push(req.user.id);
    } else {
      score.likes.splice(index, 1);
    }
    await score.save();
    res.json(score.likes);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error toggling like", error: error.message });
  }
};

const rateScore = async (req, res) => {
  try {
    const { value } = req.body;
    const ratingValue = parseInt(value);
    if (!ratingValue || ratingValue < 1 || ratingValue > 5) {
      return res.status(400).json({ message: "Invalid rating value" });
    }

    const score = await Score.findById(req.params.id).populate(
      "owner",
      "username"
    );
    if (!score) return res.status(404).json({ message: "Score not found" });

    // access: user must be able to view the score
    const isOwner =
      score.owner &&
      (score.owner._id?.toString?.() === req.user.id ||
        score.owner.toString?.() === req.user.id);
    const isAdmin = req.user && req.user.role === "admin";
    if (!score.isPublic && !isOwner && !isAdmin) {
      return res
        .status(403)
        .json({ message: "Not authorized to rate this score" });
    }

    if (!Array.isArray(score.ratings)) score.ratings = [];
    const idx = score.ratings.findIndex(
      (r) => r.user.toString() === req.user.id
    );
    if (idx >= 0) {
      score.ratings[idx].value = ratingValue;
    } else {
      score.ratings.push({ user: req.user.id, value: ratingValue });
    }

    await score.save();
    res.json(score.ratings);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error rating score", error: error.message });
  }
};

const getLikedScores = async (req, res) => {
  try {
    const { search, page = 1, limit = 12 } = req.query;
    const sortBy = (req.query.sortBy || "date").toString();
    const order = (req.query.order || "desc").toString();
    const sortDir = order === "asc" ? 1 : -1;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const tagsQuery = normalizeTags(req.query.tags);

    let filter = { likes: new mongoose.Types.ObjectId(req.user.id) };
    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }
    if (tagsQuery && tagsQuery.length) {
      filter.tags = { $in: tagsQuery };
    }

    const total = await Score.countDocuments(filter);
    let scores;

    if (sortBy === "likes") {
      scores = await Score.aggregate([
        { $match: filter },
        { $addFields: { likesCount: { $size: { $ifNull: ["$likes", []] } } } },
        { $sort: { likesCount: sortDir, createdAt: -1 } },
        { $skip: skip },
        { $limit: parseInt(limit) },
        {
          $lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "owner",
          },
        },
        { $unwind: { path: "$owner", preserveNullAndEmptyArrays: true } },
        { $project: { "owner.password": 0 } },
      ]);
    } else {
      const sortField = sortBy === "views" ? "views" : "createdAt";
      scores = await Score.find(filter)
        .populate("owner", "username")
        .sort({ [sortField]: sortDir, _id: -1 })
        .skip(skip)
        .limit(parseInt(limit));
    }

    res.json({
      scores,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching liked scores", error: error.message });
  }
};

module.exports = {
  createScore,
  getScores,
  getMyScores,
  getLikedScores,
  getScoreById,
  updateScore,
  deleteScore,
  toggleLike,
  rateScore,
};
