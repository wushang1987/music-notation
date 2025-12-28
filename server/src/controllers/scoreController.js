const Score = require('../models/Score');

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
        res.status(500).json({ message: 'Error creating score', error: error.message });
    }
};

const getScores = async (req, res) => {
    try {
        // Get all public scores OR my scores
        // For now, let's just return public scores and my scores
        const scores = await Score.find({
            $or: [{ isPublic: true }, { owner: req.user ? req.user.id : null }]
        }).populate('owner', 'username');
        res.json(scores);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching scores', error: error.message });
    }
};

const getMyScores = async (req, res) => {
    try {
        const scores = await Score.find({ owner: req.user.id });
        res.json(scores);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching scores', error: error.message });
    }
};

const getScoreById = async (req, res) => {
    try {
        const score = await Score.findById(req.params.id).populate('owner', 'username');
        if (!score) return res.status(404).json({ message: 'Score not found' });

        // access check
        if (!score.isPublic && (!req.user || score.owner._id.toString() !== req.user.id)) {
            return res.status(403).json({ message: 'Not authorized to view this score' });
        }

        res.json(score);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching score', error: error.message });
    }
};

const updateScore = async (req, res) => {
    try {
        const score = await Score.findById(req.params.id);
        if (!score) return res.status(404).json({ message: 'Score not found' });

        if (score.owner.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized to edit this score' });
        }

        const { title, content, isPublic } = req.body;
        score.title = title || score.title;
        score.content = content || score.content;
        score.isPublic = isPublic !== undefined ? isPublic : score.isPublic;

        const updatedScore = await score.save();
        res.json(updatedScore);
    } catch (error) {
        res.status(500).json({ message: 'Error updating score', error: error.message });
    }
};

const deleteScore = async (req, res) => {
    try {
        const score = await Score.findById(req.params.id);
        if (!score) return res.status(404).json({ message: 'Score not found' });

        if (score.owner.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized to delete this score' });
        }

        await score.deleteOne();
        res.json({ message: 'Score removed' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting score', error: error.message });
    }
};

module.exports = { createScore, getScores, getMyScores, getScoreById, updateScore, deleteScore };
