const express = require('express');
const router = express.Router();
const {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
} = require('../controllers/courseController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Courses
 *   description: Course management endpoints
 */

/**
 * @swagger
 * /api/courses:
 *   get:
 *     summary: Get all courses for authenticated user
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's courses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: 507f1f77bcf86cd799439011
 *                   user:
 *                     type: string
 *                     example: 507f1f77bcf86cd799439012
 *                   title:
 *                     type: string
 *                     example: Web Development
 *                   description:
 *                     type: string
 *                     example: Full stack web development course
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.route('/')
  .get(getCourses);

/**
 * @swagger
 * /api/courses:
 *   post:
 *     summary: Create a new course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 example: Advanced Mathematics
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 example: Calculus and linear algebra
 *     responses:
 *       201:
 *         description: Course created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: 507f1f77bcf86cd799439011
 *                 user:
 *                   type: string
 *                   example: 507f1f77bcf86cd799439012
 *                 title:
 *                   type: string
 *                   example: Advanced Mathematics
 *                 description:
 *                   type: string
 *                   example: Calculus and linear algebra
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Bad request - title is required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Title is required
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.route('/')
  .post(createCourse);

/**
 * @swagger
 * /api/courses/{id}:
 *   get:
 *     summary: Get a single course by ID
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Course details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: 507f1f77bcf86cd799439011
 *                 user:
 *                   type: string
 *                   example: 507f1f77bcf86cd799439012
 *                 title:
 *                   type: string
 *                   example: Web Development
 *                 description:
 *                   type: string
 *                   example: Full stack web development course
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
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
router.route('/:id')
  .get(getCourseById);

/**
 * @swagger
 * /api/courses/{id}:
 *   put:
 *     summary: Update a course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 example: Updated Course Title
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 example: Updated course description
 *     responses:
 *       200:
 *         description: Course updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: 507f1f77bcf86cd799439011
 *                 user:
 *                   type: string
 *                   example: 507f1f77bcf86cd799439012
 *                 title:
 *                   type: string
 *                   example: Updated Course Title
 *                 description:
 *                   type: string
 *                   example: Updated course description
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Not authenticated or not authorized
 *       404:
 *         description: Course not found
 *       500:
 *         description: Server error
 */
router.route('/:id')
  .put(updateCourse);

/**
 * @swagger
 * /api/courses/{id}:
 *   delete:
 *     summary: Delete a course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Course deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Course removed
 *       401:
 *         description: Not authenticated or not authorized
 *       404:
 *         description: Course not found
 *       500:
 *         description: Server error
 */
router.route('/:id')
  .delete(deleteCourse);

module.exports = router;