const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware');
const {
  uploadResource,
  getCourseResources,
  getResourceById,
  deleteResource
} = require('../controllers/resourceController');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Apply auth middleware to all routes
router.use(protect);

router.post('/upload', upload.single('file'), uploadResource);
router.get('/course/:courseId', getCourseResources);
router.route('/:id')
  .get(getResourceById)
  .delete(deleteResource);

module.exports = router;