const mongoose = require('mongoose');
const config = require('./src/config/config');

async function verifyConnection() {
    try {
        console.log(`Attempting to connect with NODE_ENV: ${config.NODE_ENV}`);

        await mongoose.connect(config.MONGODB_URI);

        const dbName = mongoose.connection.name;
        console.log(`Successfully connected to MongoDB!`);
        console.log(`Effective Database Name: "${dbName}"`);

        if (dbName === 'test') {
            console.warn('\n[WARNING] Your connection is using the "test" database.');
            console.warn('To fix this, please update your MONGODB_URI in your .env or .env.production file.');
            console.warn('Example format: mongodb+srv://user:pass@cluster.mongodb.net/music-notation?appName=Cluster0');
        } else {
            console.log(`\n[SUCCESS] Your connection is using the "${dbName}" database.`);
        }

    } catch (err) {
        console.error('Connection error:', err.message);
    } finally {
        await mongoose.disconnect();
    }
}

verifyConnection();
