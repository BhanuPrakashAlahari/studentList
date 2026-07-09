const Student = require('../models/Student');
const DownloadLog = require('../models/DownloadLog');
const PDFDocument = require('pdfkit');

// ── Subject database (from HTML reference) ────────────────────────────────────
const SUBJECT_DB = {
  MPC: {
    PUC1: [
      { name: 'English', code: '25PEN101' },
      { name: 'Mathematics', code: '25PMA102' },
      { name: 'Physics', code: '25PPY103' },
      { name: 'Chemistry', code: '25PCH104' },
      { name: 'Telugu', code: '25PTE105' },
      { name: 'Computer Programming', code: '25PCP106' },
      { name: 'Elementary Biology', code: '25PEB107' },
      { name: 'Physics Lab', code: '25PPY111' },
      { name: 'Chemistry Lab', code: '25PCH112' },
      { name: 'Computer Programming Lab', code: '25PCP113' },
    ],
    PUC2: [
      { name: 'English', code: '25PEN201' },
      { name: 'Mathematics', code: '25PMA202' },
      { name: 'Physics', code: '25PPY203' },
      { name: 'Chemistry', code: '25PCH204' },
      { name: 'Telugu', code: '25PTE205' },
      { name: 'Computer Programming', code: '25PCP206' },
      { name: 'Elementary Biology', code: '25PEB207' },
      { name: 'Physics Lab', code: '25PPY211' },
      { name: 'Chemistry Lab', code: '25PCH212' },
      { name: 'Computer Programming Lab', code: '25PCP213' },
    ],
  },
  MBIPC: {
    PUC1: [
      { name: 'English', code: '25PEN101' },
      { name: 'Mathematics', code: '25PMA102' },
      { name: 'Physics', code: '25PPY103' },
      { name: 'Chemistry', code: '25PCH104' },
      { name: 'Telugu-1', code: '25PTE105' },
      { name: 'Computer Programming', code: '25PCP106' },
      { name: 'Biology', code: '25PBI107' },
      { name: 'Physics Lab', code: '25PPY111' },
      { name: 'Chemistry Lab', code: '25PCH112' },
      { name: 'Computer Programming Lab', code: '25PCP113' },
      { name: 'Biology Lab', code: '25PBI114' },
    ],
    PUC2: [
      { name: 'English', code: '25PEN201' },
      { name: 'Mathematics', code: '25PMA202' },
      { name: 'Physics', code: '25PPY203' },
      { name: 'Chemistry', code: '25PCH204' },
      { name: 'Telugu-1', code: '25PTE205' },
      { name: 'Computer Programming', code: '25PCP206' },
      { name: 'Biology', code: '25PBE207' },
      { name: 'Physics Lab', code: '25PPY211' },
      { name: 'Chemistry Lab', code: '25PCH212' },
      { name: 'Computer Programming Lab', code: '25PCP213' },
      { name: 'Biology Lab', code: '25PBI214' },
    ],
  },
};

// Year is fixed to P2 for all students; track defaults to MPC
function getSubjects() {
  return SUBJECT_DB.MPC.PUC2;
}

// ── Shared helper: draw one registration form copy ────────────────────────────
function drawFormCopy(doc, student, subjects, startY, margin, contentW, copyLabel) {
  const rowH = 24; // Increased from 20 for 11pt font padding
  const tblRowH = 20; // Increased from 16 for 11pt font padding
  let y = startY;

  // ── Copy title ──────────────────────────────────────────────────────────────
  doc
    .font('Helvetica-Bold')
    .fontSize(12.5) // Increased from 10.5
    .fillColor('#000')
    .text(
      `REGISTRATION FORM (${copyLabel}) - AY: 2026-27`,
      margin, y,
      { align: 'center', width: contentW, underline: false }
    );

  // Underline the title manually
  const titleW = contentW;
  y = doc.y + 2;
  doc
    .moveTo(margin, y)
    .lineTo(margin + titleW, y)
    .strokeColor('#555')
    .lineWidth(0.5)
    .stroke();
  y += 6;

  // ── Meta table: ID / Name / Dept / Year ──────────────────────────────────
  const col1 = contentW * 0.35;
  const col2 = contentW * 0.65;

  // Outer border
  doc.rect(margin, y, contentW, rowH * 2).strokeColor('#888').lineWidth(0.5).stroke();
  // Middle horizontal
  doc.moveTo(margin, y + rowH).lineTo(margin + contentW, y + rowH).stroke();
  // Vertical divider
  doc.moveTo(margin + col1, y).lineTo(margin + col1, y + rowH * 2).stroke();

  doc.font('Helvetica-Bold').fontSize(11).fillColor('#000'); // Increased from 9
  doc.text(`ID No.: ${student.admission_number}`, margin + 6, y + 6, { width: col1 - 12, lineBreak: false });
  doc.text(`Name of the Student : ${student.name}`, margin + col1 + 6, y + 6, { width: col2 - 12, lineBreak: false });
  doc.text(`Department : ${student.department}`, margin + 6, y + rowH + 6, { width: col1 - 12, lineBreak: false });
  doc.text('Year : P2', margin + col1 + 6, y + rowH + 6, { width: col2 - 12, lineBreak: false });

  y += rowH * 2 + 8;

  // ── "Registration Details:" heading ──────────────────────────────────────
  doc.font('Helvetica-Bold').fontSize(11.5).fillColor('#000') // Increased from 9.5
    .text('Registration Details:', margin, y, { underline: true });
  y = doc.y + 4;

  // ── Subject table: 3 columns — S.No | Name | Code ────────────────────────
  const colWidths = [
    contentW * 0.10,   // S.No
    contentW * 0.55,   // Name of the Subject
    contentW * 0.35,   // Subject Code
  ];
  const headers = ['S.No', 'Name of the Subject', 'Subject Code'];

  // Header row — light grey fill
  doc.rect(margin, y, contentW, tblRowH).fillColor('#f2f2f2').fill();
  doc.rect(margin, y, contentW, tblRowH).strokeColor('#888').lineWidth(0.4).stroke();

  doc.font('Helvetica-Bold').fontSize(11).fillColor('#000'); // Increased from 9
  let x = margin;
  headers.forEach((h, i) => {
    doc.text(h, x + 3, y + 5, {
      width: colWidths[i] - 6,
      align: i === 0 ? 'center' : 'left',
      lineBreak: false,
    });
    if (i < headers.length - 1) {
      doc.moveTo(x + colWidths[i], y).lineTo(x + colWidths[i], y + tblRowH).stroke();
    }
    x += colWidths[i];
  });
  y += tblRowH;

  // Data rows
  doc.font('Helvetica').fontSize(11); // Increased from 9
  subjects.forEach((subj, idx) => {
    doc.rect(margin, y, contentW, tblRowH).strokeColor('#888').lineWidth(0.4).stroke();

    x = margin;
    [String(idx + 1), subj.name, subj.code].forEach((cell, ci) => {
      doc.fillColor('#000').text(cell, x + 3, y + 5, {
        width: colWidths[ci] - 6,
        align: ci === 0 ? 'center' : 'left',
        lineBreak: false,
      });
      if (ci < colWidths.length - 1) {
        doc.moveTo(x + colWidths[ci], y).lineTo(x + colWidths[ci], y + tblRowH).stroke();
      }
      x += colWidths[ci];
    });
    y += tblRowH;
  });

  // ── Instructions ───────────────────────────────────────────────────────────
  y += 8;
  doc.font('Helvetica-Bold').fontSize(10.5).fillColor('#000') // Increased from 8.5
    .text('Instructions:', margin, y, { underline: true });
  y = doc.y + 4;

  const instructions = [
    'I am aware that minimum of 75% attendance is necessary during the semester to appear in EST Examinations.',
    'I am aware of all the academic regulations circulated to me earlier.',
    'I am aware that my application for scholarship will be stalled if my attendance falls below 75%.',
  ];
  doc.font('Helvetica').fontSize(10); // Increased from 8
  instructions.forEach((line) => {
    doc.text(`• ${line}`, margin + 8, y, { width: contentW - 10, lineBreak: true });
    y = doc.y + 2;
  });

  // ── Signature block (fixed near the bottom of A4 page to maintain clean alignment) ──
  const sigTop = doc.page.height - 85;
  const sigLabels = ['Student Signature', 'Faculty Advisor', 'Head of the Department'];
  const sigW = contentW / 3;
  sigLabels.forEach((label, i) => {
    const sx = margin + sigW * i + 5;
    const lineEnd = margin + sigW * i + sigW - 10;
    doc.moveTo(sx, sigTop).lineTo(lineEnd, sigTop).strokeColor('#555').lineWidth(0.5).stroke();
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#000')
      .text(label, sx, sigTop + 6, { width: sigW - 15, align: 'center', lineBreak: false });
  });

  return sigTop + 25;
}

// ── GET /api/students/:studentId ──────────────────────────────────────────────
const getStudentById = async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await Student.findOne({
      admission_number: studentId.toUpperCase().trim(),
    }).select('-__v');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: `No student record found for ID: ${studentId}`,
      });
    }

    return res.status(200).json({ success: true, data: student });
  } catch (error) {
    console.error('getStudentById error:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching student.' });
  }
};

// ── GET /api/students/:studentId/download ─────────────────────────────────────
const downloadStudentPDF = async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await Student.findOne({
      admission_number: studentId.toUpperCase().trim(),
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: `No student record found for ID: ${studentId}`,
      });
    }

    // ── Log the download ─────────────────────────────────────────────────────
    await DownloadLog.create({
      admission_number: student.admission_number,
      student_name: student.name,
      section: student.section,
      ip_address: req.ip || req.socket.remoteAddress,
    });

    // ── Create PDF ───────────────────────────────────────────────────────────
    const doc = new PDFDocument({
      size: 'A4',
      margin: 0,
      info: {
        Title: `Registration Form - ${student.admission_number}`,
        Author: 'RGUKT',
      },
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="reg-form-${student.admission_number}.pdf"`
    );
    doc.pipe(res);

    const pageWidth = doc.page.width;   // 595.28
    const margin = 35;
    const contentW = pageWidth - margin * 2;
    const subjects = getSubjects();

    // ── SHARED HEADER (once at top of page) ──────────────────────────────────
    let y = 28;

    // University name — red bold
    doc
      .font('Helvetica-Bold')
      .fontSize(13)
      .fillColor('#b30000')
      .text(
        'Rajiv Gandhi University of Knowledge Technologies - Ongole',
        margin, y,
        { align: 'center', width: contentW }
      );
    y = doc.y;

    // Sub-title
    doc
      .font('Helvetica')
      .fontSize(7.5)
      .fillColor('#b30000')
      .text(
        '(Established by the Govt. of Andhra Pradesh and recognized as per Section 2(f), 12(B) of UGC Act, 1956)',
        margin, y,
        { align: 'center', width: contentW }
      );
    y = doc.y + 3;

    // Orange divider
    doc
      .rect(margin, y, contentW, 2)
      .fillColor('#f39c12')
      .fill();
    y += 8;

    // ── SINGLE COPY ───────────────────────────────────────────────────────────
    drawFormCopy(doc, student, subjects, y, margin, contentW, 'OFFICE COPY');

    doc.end();
  } catch (error) {
    console.error('downloadStudentPDF error:', error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Error generating PDF.' });
    }
  }
};

module.exports = { getStudentById, downloadStudentPDF };
