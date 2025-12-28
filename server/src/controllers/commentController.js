const Comment = require('../models/Comment');
const Score = require('../models/Score');

const createComment = async (req, res) => {
    try {
        const { content, scoreId } = req.body;

        // Check if score exists and is accessible
        const score = await Score.findById(scoreId);
        if (!score) return res.status(404).json({ message: 'Score not found' });

        // Assuming if you can see it, you can comment. 
        // Logic: Public or Own or (if sharing logic existed) Shared.
        if (!score.isPublic && score.owner.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to comment on this score' });
        }

        const comment = new Comment({
            content,
            score: scoreId,
            user: req.user.id,
        });
        const savedComment = await comment.save();
        const populatedComment = await savedComment.populate('user', 'username');
        res.status(201).json(populatedComment);
    } catch (error) {
        res.status(500).json({ message: 'Error creating comment', error: error.message });
    }
};

const getCommentsByScore = async (req, res) => {
    try {
        const comments = await Comment.find({ score: req.params.scoreId }).populate('user', 'username').sort({ createdAt: -1 });
        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching comments', error: error.message });
    }
};

module.exports = { createComment, getCommentsByScore };
