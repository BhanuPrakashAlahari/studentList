const mongoose = require('mongoose');

/**
 * DownloadLog — records every time a student's PDF is downloaded.
 * This satisfies the requirement: "data that is downloaded has to be stored in MongoDB"
 */
const downloadLogSchema = new mongoose.Schema(
  {
    admission_number: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    student_name: {
      type: String,
    },
    section: {
      type: String,
    },
    downloaded_at: {
      type: Date,
      default: Date.now,
    },
    ip_address: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const DownloadLog = mongoose.model('DownloadLog', downloadLogSchema);

module.exports = DownloadLog;
