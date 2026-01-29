const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent
} = require('../controllers/eventController');

// Apply auth middleware to all routes
router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Events
 *   description: Calendar event management endpoints
 */

/**
 * @swagger
 * /api/events:
 *   get:
 *     summary: Get all events for authenticated user
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's events with populated course and task data
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
 *                     type: object
 *                     nullable: true
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 507f1f77bcf86cd799439013
 *                       title:
 *                         type: string
 *                         example: Web Development
 *                   task:
 *                     type: object
 *                     nullable: true
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 507f1f77bcf86cd799439014
 *                       title:
 *                         type: string
 *                         example: Complete project
 *                   title:
 *                     type: string
 *                     example: Study Session
 *                   start:
 *                     type: string
 *                     format: date-time
 *                     example: 2025-03-15T14:00:00.000Z
 *                   end:
 *                     type: string
 *                     format: date-time
 *                     nullable: true
 *                     example: 2025-03-15T16:00:00.000Z
 *                   notes:
 *                     type: string
 *                     example: Bring laptop and notes
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
  .get(getEvents);

/**
 * @swagger
 * /api/events:
 *   post:
 *     summary: Create a new event
 *     tags: [Events]
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
 *               - start
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 example: Team Meeting
 *               start:
 *                 type: string
 *                 format: date-time
 *                 example: 2025-03-15T14:00:00.000Z
 *               end:
 *                 type: string
 *                 format: date-time
 *                 example: 2025-03-15T15:00:00.000Z
 *               notes:
 *                 type: string
 *                 maxLength: 500
 *                 example: Weekly sync meeting
 *               course:
 *                 type: string
 *                 nullable: true
 *                 example: 507f1f77bcf86cd799439013
 *               task:
 *                 type: string
 *                 nullable: true
 *                 example: 507f1f77bcf86cd799439014
 *     responses:
 *       201:
 *         description: Event created successfully
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
 *                   example: Team Meeting
 *                 start:
 *                   type: string
 *                   format: date-time
 *                   example: 2025-03-15T14:00:00.000Z
 *                 end:
 *                   type: string
 *                   format: date-time
 *                   nullable: true
 *                   example: 2025-03-15T15:00:00.000Z
 *                 notes:
 *                   type: string
 *                   example: Weekly sync meeting
 *                 course:
 *                   type: string
 *                   nullable: true
 *                   example: 507f1f77bcf86cd799439013
 *                 task:
 *                   type: string
 *                   nullable: true
 *                   example: 507f1f77bcf86cd799439014
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
 *                   example: Title and start time are required
 *       401:
 *         description: Not authenticated or invalid course/task
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
  .post(createEvent);

/**
 * @swagger
 * /api/events/{id}:
 *   get:
 *     summary: Get a single event by ID with populated data
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event details with populated course and task
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
 *                   type: object
 *                   nullable: true
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 507f1f77bcf86cd799439013
 *                     title:
 *                       type: string
 *                       example: Web Development
 *                     description:
 *                       type: string
 *                       example: Full stack web development
 *                 task:
 *                   type: object
 *                   nullable: true
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 507f1f77bcf86cd799439014
 *                     title:
 *                       type: string
 *                       example: Complete project
 *                     details:
 *                       type: string
 *                       example: Finish backend API
 *                 title:
 *                   type: string
 *                   example: Study Session
 *                 start:
 *                   type: string
 *                   format: date-time
 *                   example: 2025-03-15T14:00:00.000Z
 *                 end:
 *                   type: string
 *                   format: date-time
 *                   nullable: true
 *                   example: 2025-03-15T16:00:00.000Z
 *                 notes:
 *                   type: string
 *                   example: Bring laptop and notes
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Not authenticated or not authorized to access this event
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Not authorized
 *       404:
 *         description: Event not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Event not found
 *       500:
 *         description: Server error
 */
router.route('/:id')
  .get(getEventById);

/**
 * @swagger
 * /api/events/{id}:
 *   put:
 *     summary: Update an event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
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
 *                 example: Updated Meeting Title
 *               start:
 *                 type: string
 *                 format: date-time
 *                 example: 2025-03-15T15:00:00.000Z
 *               end:
 *                 type: string
 *                 format: date-time
 *                 example: 2025-03-15T16:30:00.000Z
 *               notes:
 *                 type: string
 *                 maxLength: 500
 *                 example: Updated meeting notes
 *               course:
 *                 type: string
 *                 nullable: true
 *                 example: 507f1f77bcf86cd799439013
 *               task:
 *                 type: string
 *                 nullable: true
 *                 example: 507f1f77bcf86cd799439014
 *     responses:
 *       200:
 *         description: Event updated successfully
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
 *                   example: Updated Meeting Title
 *                 start:
 *                   type: string
 *                   format: date-time
 *                   example: 2025-03-15T15:00:00.000Z
 *                 end:
 *                   type: string
 *                   format: date-time
 *                   nullable: true
 *                   example: 2025-03-15T16:30:00.000Z
 *                 notes:
 *                   type: string
 *                   example: Updated meeting notes
 *                 course:
 *                   type: string
 *                   nullable: true
 *                   example: 507f1f77bcf86cd799439013
 *                 task:
 *                   type: string
 *                   nullable: true
 *                   example: 507f1f77bcf86cd799439014
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Not authenticated or not authorized
 *       404:
 *         description: Event not found
 *       500:
 *         description: Server error
 */
router.route('/:id')
  .put(updateEvent);

/**
 * @swagger
 * /api/events/{id}:
 *   delete:
 *     summary: Delete an event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Event removed
 *       401:
 *         description: Not authenticated or not authorized
 *       404:
 *         description: Event not found
 *       500:
 *         description: Server error
 */
router.route('/:id')
  .delete(deleteEvent);

module.exports = router;