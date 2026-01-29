const express = require('express');
const dotenv = require('dotenv').config();
const cors = require('cors')
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes.js');
const taskRoutes = require('./routes/taskRoutes');
const eventRoutes = require('./routes/eventRoutes');
const resourceRoutes = require('./routes/resourceRoutes');

connectDB();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false}));
app.use(cors());

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/resources', resourceRoutes);

// Create uploads directory if it doesn't exist
const fs = require('fs');
const uploadsDir = 'uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

app.get('/', (req, res) => {
  res.send('API is running');
});

app.listen(5000, () => console.log(`Server started on port 5000`));
