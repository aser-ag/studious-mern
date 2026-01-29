const Task = require('../models/Task');
const Course = require('../models/Course');

exports.createTask = async (req, res) => {
  const { title, details, course, dueDate } = req.body;

  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }

  if (!course) {
    return res.status(400).json({ message: 'Course is required' });
  }

  // Verify the course exists and belongs to the user
  const foundCourse = await Course.findById(course);
  if (!foundCourse || foundCourse.user.toString() !== req.user.id) {
    return res.status(401).json({ message: 'Invalid course' });
  }

  const task = await Task.create({
    user: req.user.id,
    title,
    details: details || '',  // Match model field name
    course,
    dueDate,
    status: 'todo',  // Set default status from model
  });

  res.status(201).json(task);
};

exports.getTasks = async (req, res) => {
  const tasks = await Task.find({ user: req.user.id }).sort('-createdAt');
  res.json(tasks);
};

exports.getTaskById = async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  if (task.user.toString() !== req.user.id) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  res.json(task);
};

exports.updateTask = async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  if (task.user.toString() !== req.user.id) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  // Update only the fields that exist in the model
  task.title = req.body.title ?? task.title;
  task.details = req.body.details ?? task.details;
  task.status = req.body.status ?? task.status;
  task.dueDate = req.body.dueDate ?? task.dueDate;

  const updatedTask = await task.save();
  res.json(updatedTask);
};

exports.deleteTask = async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  if (task.user.toString() !== req.user.id) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  await task.deleteOne();
  res.json({ message: 'Task removed' });
};