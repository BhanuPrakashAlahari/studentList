const express = require('express');
const router = express.Router();
const {
  getStudentById,
  downloadStudentPDF,
} = require('../controllers/studentController');

/**
 * Student Routes
 *
 * GET /api/students/:studentId          → Check if student exists, returns JSON
 * GET /api/students/:studentId/download → Generate and download PDF
 */

// Lookup student by ID
router.get('/:studentId', getStudentById);

// Download PDF for a student
router.get('/:studentId/download', downloadStudentPDF);

module.exports = router;
