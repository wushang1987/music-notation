const express = require("express");
const {
  createScore,
  getScores,
  getMyScores,
  getLikedScores,
  getScoreById,
  updateScore,
  deleteScore,
  toggleLike,
  rateScore,
} = require("../controllers/scoreController");
const { protect, resolveUser } = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/", resolveUser, getScores);
router.get("/my", protect, getMyScores);
router.get("/liked", protect, getLikedScores);
router.get("/:id", resolveUser, getScoreById);
router.post("/", protect, createScore);
router.put("/:id", protect, updateScore);
router.delete("/:id", protect, deleteScore);
router.put("/:id/like", protect, toggleLike);
router.put("/:id/rate", protect, rateScore);

module.exports = router;
