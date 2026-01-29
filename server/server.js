const express = require('express');
const dotenv = require('dotenv').config();
const cors = require('cors')
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes.js');
const taskRoutes = require('./routes/taskRoutes');

connectDB();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false}));
app.use(cors());

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/tasks', taskRoutes);

app.get('/', (req, res) => {
  res.send('API is running');
});

app.listen(5000, () => console.log(`Server started on port 5000`));
