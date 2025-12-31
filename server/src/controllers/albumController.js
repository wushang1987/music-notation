const mongoose = require("mongoose");
const Album = require("../models/Album");
const Score = require("../models/Score");

const buildAlbumVisibilityFilter = (req) => {
  if (req.user && req.user.role === "admin") return {};
  if (req.user) {
    return {
      $or: [
        { isPublic: true },
        { owner: new mongoose.Types.ObjectId(req.user.id) },
      ],
    };
  }
  return { isPublic: true };
};

const isOwner = (docOwner, req) => {
  if (!req.user || !docOwner) return false;
  const ownerId =
    typeof docOwner === "object" && docOwner._id ? docOwner._id : docOwner;
  return ownerId.toString() === req.user.id;
};

const isAdmin = (req) => req.user && req.user.role === "admin";

const canViewScore = (score, req) => {
  if (!score) return false;
  if (isAdmin(req)) return true;
  if (score.isPublic) return true;
  return isOwner(score.owner, req);
};

const createAlbum = async (req, res) => {
  try {
    const { title, coverUrl, isPublic } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }

    const album = new Album({
      title: title.trim(),
      coverUrl: coverUrl || "",
      isPublic: !!isPublic,
      owner: req.user.id,
      scores: [],
    });

    const saved = await album.save();
    const populated = await Album.findById(saved._id).populate(
      "owner",
      "username"
    );

    return res.status(201).json(populated || saved);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error creating album", error: error.message });
  }
};

const getAlbums = async (req, res) => {
  try {
    const { search, page = 1, limit = 12 } = req.query;
    const sortBy = (req.query.sortBy || "date").toString();
    const order = (req.query.order || "desc").toString();
    const sortDir = order === "asc" ? 1 : -1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = buildAlbumVisibilityFilter(req);
    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }

    const total = await Album.countDocuments(filter);

    const sortField = sortBy === "date" ? "createdAt" : "createdAt";

    const albums = await Album.find(filter)
      .populate("owner", "username")
      .sort({ [sortField]: sortDir, _id: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    return res.json({
      albums,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error fetching albums", error: error.message });
  }
};

const getAlbumById = async (req, res) => {
  try {
    const album = await Album.findById(req.params.id)
      .populate("owner", "username")
      .populate({
        path: "scores",
        select: "title owner isPublic createdAt",
        populate: { path: "owner", select: "username" },
      });

    if (!album) return res.status(404).json({ message: "Album not found" });

    const viewerIsOwner = isOwner(album.owner, req);
    const viewerIsAdmin = isAdmin(req);

    if (!album.isPublic && !viewerIsOwner && !viewerIsAdmin) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this album" });
    }

    const obj = album.toObject();
    if (Array.isArray(obj.scores)) {
      obj.scores = obj.scores.filter((s) => canViewScore(s, req));
    }

    return res.json(obj);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error fetching album", error: error.message });
  }
};

const updateAlbum = async (req, res) => {
  try {
    const album = await Album.findById(req.params.id);
    if (!album) return res.status(404).json({ message: "Album not found" });

    if (!isAdmin(req) && !isOwner(album.owner, req)) {
      return res
        .status(401)
        .json({ message: "Not authorized to edit this album" });
    }

    const { title, coverUrl, isPublic } = req.body;

    if (title !== undefined) {
      if (!title || !title.trim()) {
        return res.status(400).json({ message: "Title is required" });
      }
      album.title = title.trim();
    }
    if (coverUrl !== undefined) {
      album.coverUrl = coverUrl || "";
    }
    if (isPublic !== undefined) {
      album.isPublic = !!isPublic;
    }

    const saved = await album.save();
    const populated = await Album.findById(saved._id).populate(
      "owner",
      "username"
    );

    return res.json(populated || saved);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error updating album", error: error.message });
  }
};

const deleteAlbum = async (req, res) => {
  try {
    const album = await Album.findById(req.params.id);
    if (!album) return res.status(404).json({ message: "Album not found" });

    if (!isAdmin(req) && !isOwner(album.owner, req)) {
      return res
        .status(401)
        .json({ message: "Not authorized to delete this album" });
    }

    await album.deleteOne();
    return res.json({ message: "Album removed" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error deleting album", error: error.message });
  }
};

const addScoreToAlbum = async (req, res) => {
  try {
    const { id, scoreId } = req.params;

    const album = await Album.findById(id);
    if (!album) return res.status(404).json({ message: "Album not found" });

    if (!isAdmin(req) && !isOwner(album.owner, req)) {
      return res
        .status(401)
        .json({ message: "Not authorized to modify this album" });
    }

    const score = await Score.findById(scoreId);
    if (!score) return res.status(404).json({ message: "Score not found" });

    if (!isAdmin(req) && !score.isPublic) {
      const scoreOwnerId = score.owner ? score.owner.toString() : "";
      if (scoreOwnerId !== req.user.id) {
        return res.status(403).json({
          message: "Not authorized to add this private score to an album",
        });
      }
    }

    if (!Array.isArray(album.scores)) album.scores = [];
    const already = album.scores.some((s) => s.toString() === scoreId);
    if (!already) {
      album.scores.push(scoreId);
      await album.save();
    }

    const populated = await Album.findById(album._id)
      .populate("owner", "username")
      .populate({
        path: "scores",
        select: "title owner isPublic createdAt",
        populate: { path: "owner", select: "username" },
      });

    const obj = populated ? populated.toObject() : album.toObject();
    if (Array.isArray(obj.scores)) {
      obj.scores = obj.scores.filter((s) => canViewScore(s, req));
    }

    return res.json(obj);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error adding score to album", error: error.message });
  }
};

const removeScoreFromAlbum = async (req, res) => {
  try {
    const { id, scoreId } = req.params;

    const album = await Album.findById(id);
    if (!album) return res.status(404).json({ message: "Album not found" });

    if (!isAdmin(req) && !isOwner(album.owner, req)) {
      return res
        .status(401)
        .json({ message: "Not authorized to modify this album" });
    }

    if (!Array.isArray(album.scores)) album.scores = [];
    album.scores = album.scores.filter((s) => s.toString() !== scoreId);
    await album.save();

    const populated = await Album.findById(album._id)
      .populate("owner", "username")
      .populate({
        path: "scores",
        select: "title owner isPublic createdAt",
        populate: { path: "owner", select: "username" },
      });

    const obj = populated ? populated.toObject() : album.toObject();
    if (Array.isArray(obj.scores)) {
      obj.scores = obj.scores.filter((s) => canViewScore(s, req));
    }

    return res.json(obj);
  } catch (error) {
    return res.status(500).json({
      message: "Error removing score from album",
      error: error.message,
    });
  }
};

module.exports = {
  createAlbum,
  getAlbums,
  getAlbumById,
  updateAlbum,
  deleteAlbum,
  addScoreToAlbum,
  removeScoreFromAlbum,
};
