const mongoose = require('mongoose');
const config = require('./src/config/config');

(async () => {
  try {
    console.log('Testing MongoDB connection to', config.MONGODB_URI);
    await mongoose.connect(config.MONGODB_URI, { dbName: config.DB_NAME });
    console.log('Mongoose connected successfully');
    const admin = mongoose.connection.db.admin();
    const info = await admin.serverStatus();
    console.log('MongoDB version:', info.version);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('MongoDB connection failed:', err);
    process.exit(1);
  }
})();
