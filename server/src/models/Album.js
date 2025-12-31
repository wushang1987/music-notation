const mongoose = require("mongoose");

const albumSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    coverUrl: { type: String, default: "" },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isPublic: { type: Boolean, default: false },
    scores: [{ type: mongoose.Schema.Types.ObjectId, ref: "Score" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Album", albumSchema);
