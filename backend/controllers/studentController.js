const Student = require('../models/Student');
const DownloadLog = require('../models/DownloadLog');
const PDFDocument = require('pdfkit');

// ── Subject database (from HTML reference) ────────────────────────────────────
const SUBJECT_DB = {
  MPC: {
    PUC1: [
      { name: 'English', code: '25PEN101', type: 'Core 1', credits: 4 },
      { name: 'Mathematics', code: '25PMA102', type: 'Core 2', credits: 5 },
      { name: 'Physics', code: '25PPY103', type: 'Core 3', credits: 4 },
      { name: 'Chemistry', code: '25PCH104', type: 'Core 5', credits: 4 },
      { name: 'Telugu', code: '25PTE105', type: 'Core 7', credits: 3 },
      { name: 'Computer Programming', code: '25PCP106', type: 'Core 8', credits: 2 },
      { name: 'Elementary Biology', code: '25PEB107', type: 'Core 10', credits: 0 },
      { name: 'Physics Lab', code: '25PPY111', type: 'Core 4', credits: 1 },
      { name: 'Chemistry Lab', code: '25PCH112', type: 'Core 6', credits: 1 },
      { name: 'Computer Programming Lab', code: '25PCP113', type: 'Core 9', credits: 1 }
    ],
    PUC2: [
      { name: 'English', code: '25PEN201', type: 'Core 1', credits: 4 },
      { name: 'Mathematics', code: '25PMA202', type: 'Core 2', credits: 5 },
      { name: 'Physics', code: '25PPY203', type: 'Core 3', credits: 4 },
      { name: 'Chemistry', code: '25PCH204', type: 'Core 5', credits: 4 },
      { name: 'Telugu', code: '25PTE205', type: 'Core 7', credits: 3 },
      { name: 'Computer Programming', code: '25PCP206', type: 'Core 8', credits: 2 },
      { name: 'Elementary Biology', code: '25PEB207', type: 'Core 10', credits: 0 },
      { name: 'Physics Lab', code: '25PPY211', type: 'Core 4', credits: 1 },
      { name: 'Chemistry Lab', code: '25PCH212', type: 'Core 6', credits: 1 },
      { name: 'Computer Programming Lab', code: '25PCP213', type: 'Core 9', credits: 1 }
    ]
  },
  MBIPC: {
    PUC1: [
      { name: 'English', code: '25PEN101', type: 'Core 1', credits: 4 },
      { name: 'Mathematics', code: '25PMA102', type: 'Core 2', credits: 5 },
      { name: 'Physics', code: '25PPY103', type: 'Core 3', credits: 4 },
      { name: 'Chemistry', code: '25PCH104', type: 'Core 5', credits: 4 },
      { name: 'Telugu-1', code: '25PTE105', type: 'Core 7', credits: 3 },
      { name: 'Computer Programming', code: '25PCP106', type: 'Core 8', credits: 2 },
      { name: 'Biology', code: '25PBI107', type: 'Core 10', credits: 0 },
      { name: 'Physics Lab', code: '25PPY111', type: 'Core 4', credits: 1 },
      { name: 'Chemistry Lab', code: '25PCH112', type: 'Core 6', credits: 1 },
      { name: 'Computer Programming Lab', code: '25PCP113', type: 'Core 9', credits: 1 },
      { name: 'Biology Lab', code: '25PBI114', type: 'Core 11', credits: 1 }
    ],
    PUC2: [
      { name: 'English', code: '25PEN201', type: 'Core 1', credits: 4 },
      { name: 'Mathematics', code: '25PMA202', type: 'Core 2', credits: 5 },
      { name: 'Physics', code: '25PPY203', type: 'Core 3', credits: 4 },
      { name: 'Chemistry', code: '25PCH204', type: 'Core 5', credits: 4 },
      { name: 'Telugu-1', code: '25PTE205', type: 'Core 7', credits: 3 },
      { name: 'Computer Programming', code: '25PCP206', type: 'Core 8', credits: 2 },
      { name: 'Biology', code: '25PBE207', type: 'Core 10', credits: 0 },
      { name: 'Physics Lab', code: '25PPY211', type: 'Core 4', credits: 1 },
      { name: 'Chemistry Lab', code: '25PCH212', type: 'Core 6', credits: 1 },
      { name: 'Computer Programming Lab', code: '25PCP213', type: 'Core 9', credits: 1 },
      { name: 'Biology Lab', code: '25PBI214', type: 'Core 11', credits: 1 }
    ]
  }
};

// Year is fixed to P2 for all students; track defaults to MPC
function getSubjects() {
  return SUBJECT_DB.MPC.PUC2;
}

// ── Shared helper: draw one registration form copy ────────────────────────────
function drawFormCopy(doc, student, subjects, startY, margin, contentW, copyLabel) {
  const rowH = 24; 
  const tblRowH = 20; 
  let y = startY;

  // ── Meta table: ID / Name / Dept / Year / Copy (4 columns) ──────────────────
  const col1 = contentW * 0.38;
  const col2 = contentW * 0.38;
  const col3 = contentW * 0.12;
  const col4 = contentW * 0.12;

  // Outer border
  doc.rect(margin, y, contentW, rowH * 2).strokeColor('#000').lineWidth(0.6).stroke();
  // Vertical dividers
  doc.moveTo(margin + col1, y).lineTo(margin + col1, y + rowH * 2).stroke();
  doc.moveTo(margin + col1 + col2, y).lineTo(margin + col1 + col2, y + rowH * 2).stroke();
  doc.moveTo(margin + col1 + col2 + col3, y).lineTo(margin + col1 + col2 + col3, y + rowH * 2).stroke();
  // Horizontal divider (skips the spanned 4th column)
  doc.moveTo(margin, y + rowH).lineTo(margin + col1 + col2 + col3, y + rowH).stroke();

  doc.font('Helvetica-Bold').fontSize(11).fillColor('#000');
  
  // Row 1
  doc.text(`ID No.: ${student.admission_number}`, margin + 6, y + 6, { width: col1 - 12, lineBreak: false });
  doc.text(`Name of the Student: ${student.name}`, margin + col1 + 6, y + 6, { width: col2 - 12, lineBreak: false });
  
  // Row 2
  doc.text(`Department: ${student.department}`, margin + 6, y + rowH + 6, { width: col1 - 12, lineBreak: false });
  doc.text('Year: P2', margin + col1 + 6, y + rowH + 6, { width: col2 - 12, lineBreak: false });

  // Column 4: Office/Student Copy label (spanned vertically)
  const copyTextLines = copyLabel.split(' ');
  const firstWord = copyTextLines[0].charAt(0) + copyTextLines[0].slice(1).toLowerCase(); // 'Office' or 'Student'
  doc.text(firstWord, margin + col1 + col2 + col3, y + 12, { width: col4, align: 'center' });
  doc.text('Copy', margin + col1 + col2 + col3, y + 26, { width: col4, align: 'center' });

  y += rowH * 2 + 10;

  // ── "Registration Details:" heading ──────────────────────────────────────
  doc.font('Helvetica-Bold').fontSize(11.5).fillColor('#000')
    .text('Registration Details:', margin, y, { underline: true });
  y = doc.y + 4;

  // ── Subject table: 5 columns — S.No | Subject | Code | Type | Credits ─────
  const colWidths = [
    contentW * 0.08,   // S.No
    contentW * 0.48,   // Name of the Subject
    contentW * 0.22,   // Subject Code
    contentW * 0.12,   // Type
    contentW * 0.10,   // Credits
  ];
  const headers = ['S.No', 'Name of the Subject', 'Subject Code', 'Type', 'Credits'];

  // Header row — light grey fill
  doc.rect(margin, y, contentW, tblRowH).fillColor('#f2f2f2').fill();
  doc.rect(margin, y, contentW, tblRowH).strokeColor('#000').lineWidth(0.5).stroke();

  doc.font('Helvetica-Bold').fontSize(11).fillColor('#000');
  let x = margin;
  headers.forEach((h, i) => {
    doc.text(h, x + 3, y + 5, {
      width: colWidths[i] - 6,
      align: i === 0 || i === 3 || i === 4 ? 'center' : 'left',
      lineBreak: false,
    });
    if (i < headers.length - 1) {
      doc.moveTo(x + colWidths[i], y).lineTo(x + colWidths[i], y + tblRowH).stroke();
    }
    x += colWidths[i];
  });
  y += tblRowH;

  // Data rows
  doc.font('Helvetica').fontSize(11);
  subjects.forEach((subj, idx) => {
    doc.rect(margin, y, contentW, tblRowH).strokeColor('#000').lineWidth(0.4).stroke();

    x = margin;
    const cells = [
      String(idx + 1),
      subj.name,
      subj.code,
      subj.type || 'Core',
      String(subj.credits !== undefined ? subj.credits : 4)
    ];

    cells.forEach((cell, ci) => {
      doc.fillColor('#000').text(cell, x + 3, y + 5, {
        width: colWidths[ci] - 6,
        align: ci === 0 || ci === 3 || ci === 4 ? 'center' : 'left',
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
  doc.font('Helvetica-Bold').fontSize(10.5).fillColor('#000')
    .text('Instructions:', margin, y, { underline: true });
  y = doc.y + 4;

  const instructions = [
    'I am aware that minimum of 75% attendance is necessary during the semester to appear in EST Examinations.',
    'I am aware of all the academic regulations circulated to me earlier.',
    'I am aware that my application for scholarship will be stalled if my attendance falls below 75%.',
  ];
  doc.font('Helvetica').fontSize(10);
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
    doc.moveTo(sx, sigTop).lineTo(lineEnd, sigTop).strokeColor('#000').lineWidth(0.5).stroke();
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

    // ── HEADER (exactly matching screenshot) ──────────────────────────────────
    let y = 30;

    // University name — plain black bold
    doc
      .font('Helvetica-Bold')
      .fontSize(13)
      .fillColor('#000000')
      .text(
        'Rajiv Gandhi University of Knowledge Technologies-Ongole',
        margin, y,
        { align: 'center', width: contentW }
      );
    y = doc.y + 2;

    // Academic Year
    doc
      .font('Helvetica')
      .fontSize(10)
      .fillColor('#000000')
      .text(
        'Academic Year: 2026-27, Semester I',
        margin, y,
        { align: 'center', width: contentW }
      );
    y = doc.y + 2;

    // Title: Registration form (bold, underlined)
    doc
      .font('Helvetica-Bold')
      .fontSize(11.5)
      .fillColor('#000000')
      .text(
        'Registration form',
        margin, y,
        { align: 'center', width: contentW, underline: true }
      );
    y = doc.y + 12;

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
