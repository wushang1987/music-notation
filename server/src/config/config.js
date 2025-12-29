const dotenv = require('dotenv');
const path = require('path');

// Load environment variables based on NODE_ENV
const envPath = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
dotenv.config({ path: path.resolve(process.cwd(), envPath) });

module.exports = {
    MONGODB_URI: process.env.MONGODB_URI,
    PORT: process.env.PORT || 5000,
    NODE_ENV: process.env.NODE_ENV || 'development'
};
