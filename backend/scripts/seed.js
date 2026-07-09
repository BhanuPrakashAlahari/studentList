/**
 * Seed Script — imports all students from data/students.json into MongoDB.
 *
 * Usage:
 *   node scripts/seed.js          → Import (skip existing, idempotent)
 *   node scripts/seed.js --reset  → Drop collection completely, then import fresh
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// ── Derive department and year from admission_number ─────────────────────────
// Year digits in ID: O25xxxx → 2025 intake → P1 (first year)
//                    O24xxxx → 2024 intake → P2 (second year)
function deriveDeptAndYear(admissionNumber) {
  const idYear = admissionNumber.slice(1, 3); // "25" or "24"
  const year = idYear === '25' ? 'P1' : idYear === '24' ? 'P2' : 'P1';
  return { department: 'PUC', year };
}

async function seed() {
  const reset = process.argv.includes('--reset');

  console.log('🔗  Connecting to MongoDB…');
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  console.log('✅  Connected:', mongoose.connection.host);

  // Use raw driver to avoid Mongoose index sync issues
  const db = mongoose.connection.db;
  const col = db.collection('students');

  if (reset) {
    console.log('🗑   Dropping students collection entirely…');
    try {
      await col.drop();
      console.log('✅  Collection dropped.');
    } catch (e) {
      if (e.code === 26) {
        console.log('ℹ️   Collection did not exist (fresh start).');
      } else {
        throw e;
      }
    }
  } else {
    // Non-reset mode: only drop the stale studentId_1 index if present
    try {
      await col.dropIndex('studentId_1');
      console.log('✅  Dropped stale studentId_1 index.');
    } catch {
      // OK — index doesn't exist
    }
  }

  // Load and normalize JSON
  const dataPath = path.join(__dirname, '../data/students.json');
  const rawData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  console.log(`📦  Loaded ${rawData.length} records from students.json`);

  const now = new Date();
  const students = rawData.map((s) => {
    const admNum = s.admission_number?.trim().toUpperCase();
    const { department, year } = deriveDeptAndYear(admNum);
    return {
      s_no: s.s_no,
      name: s.name?.trim().toUpperCase(),
      gender: s.gender?.trim().toUpperCase(),
      admission_number: admNum,
      section: s.section?.trim(),
      department,
      year,
      createdAt: now,
      updatedAt: now,
    };
  });

  // Ensure index exists on admission_number before bulk insert
  await col.createIndex({ admission_number: 1 }, { unique: true });

  // Bulk upsert via ordered bulkWrite so one failure doesn't stop others
  const ops = students.map((s) => ({
    updateOne: {
      filter: { admission_number: s.admission_number },
      update: { $setOnInsert: s },
      upsert: true,
    },
  }));

  console.log('⏳  Running bulk upsert…');
  const result = await col.bulkWrite(ops, { ordered: false });

  console.log('\n🎉  Seed complete!');
  console.log(`   ✅ Inserted: ${result.upsertedCount}`);
  console.log(`   ⏭  Matched (already exist): ${result.matchedCount}`);

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌  Seed failed:', err.message);
  process.exit(1);
});
