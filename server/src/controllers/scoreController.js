const Score = require("../models/Score");

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
    const scores = await Score.find(filter)
      .populate("owner", "username")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

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

const getMyScores = async (req, res) => {
  try {
    const { search, page = 1, limit = 12 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let filter = { owner: req.user.id };

    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }

    const total = await Score.countDocuments(filter);
    const scores = await Score.find(filter)
      .populate("owner", "username")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

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

const getLikedScores = async (req, res) => {
  try {
    const { search, page = 1, limit = 12 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let filter = { likes: req.user.id };

    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }

    const total = await Score.countDocuments(filter);
    const scores = await Score.find(filter)
      .populate("owner", "username")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

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
};
