const express = require('express');
const router = express.Router();
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Task management endpoints
 */

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get all tasks for authenticated user
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's tasks
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
 *                   course:
 *                     type: string
 *                     example: 507f1f77bcf86cd799439013
 *                   title:
 *                     type: string
 *                     example: Complete project
 *                   details:
 *                     type: string
 *                     example: Finish the backend API
 *                   status:
 *                     type: string
 *                     enum: [todo, in_progress, done]
 *                     example: todo
 *                   dueDate:
 *                     type: string
 *                     format: date-time
 *                     nullable: true
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
  .get(getTasks);

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
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
 *               - course
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 example: Study for exam
 *               details:
 *                 type: string
 *                 maxLength: 500
 *                 example: Review chapters 1-5
 *               course:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439013
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 example: 2025-12-31T23:59:59.000Z
 *     responses:
 *       201:
 *         description: Task created successfully
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
 *                 course:
 *                   type: string
 *                   example: 507f1f77bcf86cd799439013
 *                 title:
 *                   type: string
 *                   example: Study for exam
 *                 details:
 *                   type: string
 *                   example: Review chapters 1-5
 *                 status:
 *                   type: string
 *                   enum: [todo, in_progress, done]
 *                   example: todo
 *                 dueDate:
 *                   type: string
 *                   format: date-time
 *                   nullable: true
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Bad request - missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Title is required
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
router.route('/')
  .post(createTask);

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Get a single task by ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task details
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
 *                 course:
 *                   type: string
 *                   example: 507f1f77bcf86cd799439013
 *                 title:
 *                   type: string
 *                   example: Complete project
 *                 details:
 *                   type: string
 *                   example: Finish the backend API
 *                 status:
 *                   type: string
 *                   enum: [todo, in_progress, done]
 *                   example: todo
 *                 dueDate:
 *                   type: string
 *                   format: date-time
 *                   nullable: true
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Not authenticated or not authorized to access this task
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Not authorized
 *       404:
 *         description: Task not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Task not found
 *       500:
 *         description: Server error
 */
router.route('/:id')
  .get(getTaskById);

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Update a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
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
 *                 example: Updated task title
 *               details:
 *                 type: string
 *                 maxLength: 500
 *                 example: Updated task details
 *               status:
 *                 type: string
 *                 enum: [todo, in_progress, done]
 *                 example: in_progress
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 example: 2025-12-31T23:59:59.000Z
 *     responses:
 *       200:
 *         description: Task updated successfully
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
 *                 course:
 *                   type: string
 *                   example: 507f1f77bcf86cd799439013
 *                 title:
 *                   type: string
 *                   example: Updated task title
 *                 details:
 *                   type: string
 *                   example: Updated task details
 *                 status:
 *                   type: string
 *                   enum: [todo, in_progress, done]
 *                   example: in_progress
 *                 dueDate:
 *                   type: string
 *                   format: date-time
 *                   nullable: true
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Not authenticated or not authorized
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 */
router.route('/:id')
  .put(updateTask);

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Task removed
 *       401:
 *         description: Not authenticated or not authorized
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 */
router.route('/:id')
  .delete(deleteTask);

module.exports = router;