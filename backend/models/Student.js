const mongoose = require('mongoose');

/**
 * Student Schema — matches the students.json data structure from RGUKT Ongole.
 * Fields: s_no, name, gender, admission_number, section
 * Derived fields: department, year (computed from section name)
 */
const studentSchema = new mongoose.Schema(
  {
    s_no: {
      type: Number,
    },
    name: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
      uppercase: true,
    },
    gender: {
      type: String,
      enum: ['M', 'F', 'm', 'f'],
      trim: true,
    },
    admission_number: {
      type: String,
      required: [true, 'Admission number is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    section: {
      type: String,
      trim: true,
    },
    // Derived fields (computed during seed, stored for fast lookup)
    department: {
      type: String,
      default: 'PUC',
    },
    year: {
      type: String,
      default: 'P1',
    },
  },
  {
    timestamps: true,
  }
);

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
