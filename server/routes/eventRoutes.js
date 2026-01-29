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

router.route('/')
  .post(createEvent)
  .get(getEvents);

router.route('/:id')
  .get(getEventById)
  .put(updateEvent)
  .delete(deleteEvent);

module.exports = router;