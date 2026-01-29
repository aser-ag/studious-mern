const Course = require('../models/Course');

// @desc    Create a course
// @route   POST /api/courses
// @access  Private
const createCourse = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const course = await Course.create({
      user: req.user.id,
      title,
      description,
    });

    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all user courses
// @route   GET /api/courses
// @access  Private
const getCourses = async (req, res) => {
  const courses = await Course.find({ user: req.user.id }).sort('-createdAt');
  res.json(courses);
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Private
const getCourseById = async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return res.status(404).json({ message: 'Course not found' });
  }

  if (course.user.toString() !== req.user.id) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  res.json(course);
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private
const updateCourse = async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return res.status(404).json({ message: 'Course not found' });
  }

  if (course.user.toString() !== req.user.id) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  course.title = req.body.title ?? course.title;
  course.description = req.body.description ?? course.description;

  const updatedCourse = await course.save();
  res.json(updatedCourse);
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private
const deleteCourse = async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return res.status(404).json({ message: 'Course not found' });
  }

  if (course.user.toString() !== req.user.id) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  await course.deleteOne();
  res.json({ message: 'Course removed' });
};

module.exports = {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse
};