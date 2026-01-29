const express = require('express');
const dotenv = require('dotenv').config();
const cors = require('cors')
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes.routes.js');
const courseRoutes = require('./routes/courseRoutes.routes.js');
const taskRoutes = require('./routes/taskRoutes.routes.js');
const eventRoutes = require('./routes/eventRoutes.routes.js');
const resourceRoutes = require('./routes/resourceRoutes.routes.js');

connectDB();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false}));
app.use(cors());

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Studious MERN API',
      version: '1.0.0',
      description: 'API documentation for Studious MERN application',
      contact: {
        name: 'Your Name',
        email: 'your.email@example.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./routes/*.js'], // Path to your route files
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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
