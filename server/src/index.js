const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const config = require("./config/config");

const app = express();
const PORT = config.PORT;

app.use(cors());
app.use(express.json());

mongoose
  .connect(config.MONGODB_URI, {
    dbName: config.DB_NAME,
  })
  .then(() => {
    console.log(`Connected to MongoDB (${config.NODE_ENV} mode)`);
    // Log database name if possible (security tip: don't log URI)
    const dbName = mongoose.connection.name;
    console.log(`Using database: ${dbName}`);
  })
  .catch((err) => console.error("MongoDB connection error:", err));

app.get("/", (req, res) => {
  res.send("Music Notation API is running");
});

// Import routes
const authRoutes = require("./routes/authRoutes");
const scoreRoutes = require("./routes/scoreRoutes");
const commentRoutes = require("./routes/commentRoutes");
const userRoutes = require("./routes/userRoutes");
const albumRoutes = require("./routes/albumRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/scores", scoreRoutes);
app.use("/api/albums", albumRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/users", userRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
