const mongoose = require('mongoose');

const taskSchema = mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Course',
    },
    title: {
      type: String,
      required: true,
    },
    details: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['todo', 'in_progress', 'done'],
      default: 'todo',
    },
    dueDate: {
      type: Date,
    },
  },
  {
    timestamps: true, // handles created_at & updated_at
  }
);

module.exports = mongoose.model('Task', taskSchema);
