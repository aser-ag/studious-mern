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

/**
 * @swagger
 * tags:
 *   name: Resources
 *   description: File resource management endpoints
 */

/**
 * @swagger
 * /api/resources/upload:
 *   post:
 *     summary: Upload a file resource
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - course
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File to upload
 *               course:
 *                 type: string
 *                 description: Course ID to associate the resource with
 *                 example: 507f1f77bcf86cd799439011
 *     responses:
 *       201:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: 507f1f77bcf86cd799439021
 *                 user:
 *                   type: string
 *                   example: 507f1f77bcf86cd799439012
 *                 course:
 *                   type: string
 *                   example: 507f1f77bcf86cd799439011
 *                 fileName:
 *                   type: string
 *                   example: syllabus.pdf
 *                 filePath:
 *                   type: string
 *                   example: uploads/1234567890-syllabus.pdf
 *                 fileType:
 *                   type: string
 *                   example: application/pdf
 *                 fileSize:
 *                   type: integer
 *                   example: 1024
 *                 uploadedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Bad request - missing file or course ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Please upload a file
 *       401:
 *         description: Not authenticated or invalid course
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid course
 *       500:
 *         description: Server error
 */
router.post('/upload', upload.single('file'), uploadResource);

/**
 * @swagger
 * /api/resources/course/{courseId}:
 *   get:
 *     summary: Get all resources for a specific course
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *     responses:
 *       200:
 *         description: List of course resources
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: 507f1f77bcf86cd799439021
 *                   user:
 *                     type: string
 *                     example: 507f1f77bcf86cd799439012
 *                   course:
 *                     type: string
 *                     example: 507f1f77bcf86cd799439011
 *                   fileName:
 *                     type: string
 *                     example: syllabus.pdf
 *                   filePath:
 *                     type: string
 *                     example: uploads/1234567890-syllabus.pdf
 *                   fileType:
 *                     type: string
 *                     example: application/pdf
 *                   fileSize:
 *                     type: integer
 *                     example: 1024
 *                   uploadedAt:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Not authenticated or not authorized to access this course
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Not authorized
 *       404:
 *         description: Course not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Course not found
 *       500:
 *         description: Server error
 */
router.get('/course/:courseId', getCourseResources);

/**
 * @swagger
 * /api/resources/{id}:
 *   get:
 *     summary: Get a single resource by ID
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Resource ID
 *     responses:
 *       200:
 *         description: Resource details with populated course data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: 507f1f77bcf86cd799439021
 *                 user:
 *                   type: string
 *                   example: 507f1f77bcf86cd799439012
 *                 course:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 507f1f77bcf86cd799439011
 *                     title:
 *                       type: string
 *                       example: Web Development
 *                 fileName:
 *                   type: string
 *                   example: syllabus.pdf
 *                 filePath:
 *                   type: string
 *                   example: uploads/1234567890-syllabus.pdf
 *                 fileType:
 *                   type: string
 *                   example: application/pdf
 *                 fileSize:
 *                   type: integer
 *                   example: 1024
 *                 uploadedAt:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Not authenticated or not authorized to access this resource
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Not authorized
 *       404:
 *         description: Resource not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Resource not found
 *       500:
 *         description: Server error
 */
router.route('/:id')
  .get(getResourceById);

/**
 * @swagger
 * /api/resources/{id}:
 *   delete:
 *     summary: Delete a resource
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Resource ID
 *     responses:
 *       200:
 *         description: Resource deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Resource removed
 *       401:
 *         description: Not authenticated or not authorized
 *       404:
 *         description: Resource not found
 *       500:
 *         description: Server error
 */
router.route('/:id')
  .delete(deleteResource);

module.exports = router;