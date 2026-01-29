const Resource = require('../models/Resource');
const Course = require('../models/Course');
const path = require('path');

// @desc    Upload a resource
// @route   POST /api/resources/upload
// @access  Private
exports.uploadResource = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    const { course } = req.body;

    if (!course) {
      return res.status(400).json({ message: 'Course ID is required' });
    }

    // Verify course exists and belongs to user
    const foundCourse = await Course.findById(course);
    if (!foundCourse || foundCourse.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Invalid course' });
    }

    const resource = await Resource.create({
      user: req.user.id,
      course,
      fileName: req.file.originalname,
      filePath: req.file.path,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
    });

    res.status(201).json(resource);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all resources for a course
// @route   GET /api/resources/course/:courseId
// @access  Private
exports.getCourseResources = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const resources = await Resource.find({ course: req.params.courseId })
      .sort('-uploadedAt');
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single resource
// @route   GET /api/resources/:id
// @access  Private
exports.getResourceById = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id).populate('course', 'title');

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    if (resource.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.json(resource);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete resource
// @route   DELETE /api/resources/:id
// @access  Private
exports.deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    if (resource.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Here you would also delete the actual file from storage
    // For now, just delete the database record
    await resource.deleteOne();
    res.json({ message: 'Resource removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};