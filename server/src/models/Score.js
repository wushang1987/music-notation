const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true }, // ABC notation content
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    isPublic: { type: Boolean, default: false },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

module.exports = mongoose.model('Score', scoreSchema);
