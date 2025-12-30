const Score = require("../models/Score");
const mongoose = require("mongoose");

const createScore = async (req, res) => {
  try {
    const { title, content, isPublic } = req.body;
    const score = new Score({
      title,
      content,
      isPublic,
      owner: req.user.id,
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

    let filter = { owner: req.user.id };
    if (search) {
      filter.title = { $regex: search, $options: "i" };
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

    return res.json(updated || score);
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

    const { title, content, isPublic } = req.body;
    score.title = title || score.title;
    score.content = content || score.content;
    score.isPublic = isPublic !== undefined ? isPublic : score.isPublic;

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

    let filter = { likes: req.user.id };
    if (search) {
      filter.title = { $regex: search, $options: "i" };
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
