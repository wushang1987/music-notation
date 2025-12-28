const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));

app.get('/', (req, res) => {
    res.send('Music Notation API is running');
});

// Import routes
const authRoutes = require('./routes/authRoutes');
const scoreRoutes = require('./routes/scoreRoutes');
const commentRoutes = require('./routes/commentRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/scores', scoreRoutes);
app.use('/api/comments', commentRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
