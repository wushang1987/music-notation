const mongoose = require("mongoose");

const scoreSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true }, // ABC notation content
    // General MIDI program number (0-127). Used for playback timbre.
    instrumentProgram: { type: Number, min: 0, max: 127, default: 0 },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    isPublic: { type: Boolean, default: false },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    views: { type: Number, default: 0 },
    ratings: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        value: { type: Number, min: 1, max: 5, required: true },
      },
    ],
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Score", scoreSchema);
