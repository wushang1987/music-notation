const express = require("express");
const {
  createAlbum,
  getAlbums,
  getAlbumById,
  updateAlbum,
  deleteAlbum,
  addScoreToAlbum,
  removeScoreFromAlbum,
} = require("../controllers/albumController");
const { protect, resolveUser } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", resolveUser, getAlbums);
router.get("/:id", resolveUser, getAlbumById);
router.post("/", protect, createAlbum);
router.put("/:id", protect, updateAlbum);
router.delete("/:id", protect, deleteAlbum);
router.put("/:id/scores/:scoreId", protect, addScoreToAlbum);
router.delete("/:id/scores/:scoreId", protect, removeScoreFromAlbum);

module.exports = router;
