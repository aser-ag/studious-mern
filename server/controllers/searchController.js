const Course = require('../models/Course');
const Task = require('../models/Task');
const Event = require('../models/Event');

/**
 * @desc    Search across Courses, Tasks, and Events
 * @route   GET /api/search
 * @access  Private
 */
const searchGlobal = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const regex = new RegExp(q, 'i'); // Case-insensitive regex

    // perform parallel searches found by user
    const [courses, tasks, events] = await Promise.all([
      Course.find({
        user: req.user._id,
        $or: [{ title: regex }, { description: regex }],
      }).limit(5),
      Task.find({
        user: req.user._id,
        $or: [{ title: regex }, { details: regex }],
      }).limit(5),
      Event.find({
        user: req.user._id,
        $or: [{ title: regex }, { notes: regex }],
      }).limit(5),
    ]);

    res.status(200).json({
      courses,
      tasks,
      events,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  searchGlobal,
};
