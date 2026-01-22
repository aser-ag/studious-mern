const express = require('express');
const dotenv = require('dotenv').config();
const cors = require('cors')
const connectDB = require('./config/db');

connectDB();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false}));
app.use(cors());

//app.use('api/users', require('./routes/userRoutes'));
//app.use('api/courses', require('./routes/courseRoutes'));

app.listen(5000, () => console.log(`Server started on port 5000`));