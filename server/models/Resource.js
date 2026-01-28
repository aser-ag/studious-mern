const mongoose = require('mongoose');

const resourceSchema = mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Course',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    fileName: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
    },
    fileSize: {
      type: Number,
    },
  },
  {
    timestamps: { createdAt: 'uploadedAt' },
  }
);

module.exports = mongoose.model('Resource', resourceSchema);
