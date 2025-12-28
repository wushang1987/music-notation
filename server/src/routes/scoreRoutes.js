const express = require('express');
const { createScore, getScores, getMyScores, getScoreById, updateScore, deleteScore } = require('../controllers/scoreController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', getScores); // Public + My scores (if logged in, might need optional auth middleware?)
router.get('/my', protect, getMyScores);
router.get('/:id', getScoreById); // Public or Owned
router.post('/', protect, createScore);
router.put('/:id', protect, updateScore);
router.delete('/:id', protect, deleteScore);

module.exports = router;
