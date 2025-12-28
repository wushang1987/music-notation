const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('./src/models/User');

dotenv.config();

async function makeAdmin(email) {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const user = await User.findOneAndUpdate({ email }, { role: 'admin' }, { new: true });
        if (user) {
            console.log(`Success: ${email} is now an admin.`);
        } else {
            console.log(`Error: User with email ${email} not found.`);
        }
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
    } finally {
        await mongoose.disconnect();
    }
}

const email = process.argv[2];
if (!email) {
    console.log('Usage: node makeAdmin.js <email>');
    process.exit(1);
}

makeAdmin(email);
