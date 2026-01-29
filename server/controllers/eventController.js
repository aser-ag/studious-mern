const Event = require('../models/Event');
const Course = require('../models/Course');
const Task = require('../models/Task');

// @desc    Create an event
// @route   POST /api/events
// @access  Private
exports.createEvent = async (req, res) => {
  try {
    const { title, start, end, notes, course, task } = req.body;

    if (!title || !start) {
      return res.status(400).json({ message: 'Title and start time are required' });
    }

    // If course is provided, verify it belongs to user
    if (course) {
      const foundCourse = await Course.findById(course);
      if (!foundCourse || foundCourse.user.toString() !== req.user.id) {
        return res.status(401).json({ message: 'Invalid course' });
      }
    }

    // If task is provided, verify it belongs to user
    if (task) {
      const foundTask = await Task.findById(task);
      if (!foundTask || foundTask.user.toString() !== req.user.id) {
        return res.status(401).json({ message: 'Invalid task' });
      }
    }

    const event = await Event.create({
      user: req.user.id,
      title,
      start,
      end,
      notes: notes || '',
      course: course || null,
      task: task || null,
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all user events
// @route   GET /api/events
// @access  Private
exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find({ user: req.user.id })
      .populate('course', 'title')
      .populate('task', 'title')
      .sort('start');
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Private
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('course', 'title description')
      .populate('task', 'title details');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Update allowed fields
    event.title = req.body.title ?? event.title;
    event.start = req.body.start ?? event.start;
    event.end = req.body.end ?? event.end;
    event.notes = req.body.notes ?? event.notes;
    event.course = req.body.course ?? event.course;
    event.task = req.body.task ?? event.task;

    const updatedEvent = await event.save();
    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await event.deleteOne();
    res.json({ message: 'Event removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};