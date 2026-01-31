const mongoose = require("mongoose");

const ipUsageSchema = new mongoose.Schema(
    {
        ip: {
            type: String,
            required: true,
            index: true,
        },
        date: {
            type: String, // format YYYY-MM-DD
            required: true,
            index: true,
        },
        count: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

// Compound index for unique constraints if needed, or just fast lookup
ipUsageSchema.index({ ip: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("IpUsage", ipUsageSchema);
