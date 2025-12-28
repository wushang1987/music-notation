const express = require('express');
const { createComment, getCommentsByScore } = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/:scoreId', getCommentsByScore);
router.post('/', protect, createComment);

module.exports = router;
