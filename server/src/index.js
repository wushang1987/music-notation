const app = require("./app");
const mongoose = require("mongoose");
const config = require("./config/config");

const PORT = config.PORT;

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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

