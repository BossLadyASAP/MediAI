import express from 'express';
import { Symptom, Meal, Medication, Mood } from '../models/tracker';
import { Types } from 'mongoose';

const router = express.Router();

// Middleware to get userId from auth (placeholder)
function getUserId(req: any): Types.ObjectId {
  // Replace with your actual auth logic
  return req.user?._id || new Types.ObjectId('000000000000000000000000');
}

// --- SYMPTOMS ---
router.post('/symptoms', async (req, res) => {
  try {
    const user = getUserId(req);
    const { date, description, severity, notes } = req.body;
    const symptom = await Symptom.create({ user, date, description, severity, notes });
    res.status(201).json(symptom);
  } catch (err) {
    res.status(400).json({ error: 'Failed to log symptom', details: err });
  }
});

router.get('/symptoms', async (req, res) => {
  try {
    const user = getUserId(req);
    const symptoms = await Symptom.find({ user }).sort({ date: -1 });
    res.json(symptoms);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch symptoms' });
  }
});

// --- MEALS ---
router.post('/meals', async (req, res) => {
  try {
    const user = getUserId(req);
    const { date, meal, notes } = req.body;
    const mealEntry = await Meal.create({ user, date, meal, notes });
    res.status(201).json(mealEntry);
  } catch (err) {
    res.status(400).json({ error: 'Failed to log meal', details: err });
  }
});

router.get('/meals', async (req, res) => {
  try {
    const user = getUserId(req);
    const meals = await Meal.find({ user }).sort({ date: -1 });
    res.json(meals);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch meals' });
  }
});

// --- MEDICATIONS ---
router.post('/medications', async (req, res) => {
  try {
    const user = getUserId(req);
    const { date, medication, dose, notes } = req.body;
    const med = await Medication.create({ user, date, medication, dose, notes });
    res.status(201).json(med);
  } catch (err) {
    res.status(400).json({ error: 'Failed to log medication', details: err });
  }
});

router.get('/medications', async (req, res) => {
  try {
    const user = getUserId(req);
    const meds = await Medication.find({ user }).sort({ date: -1 });
    res.json(meds);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch medications' });
  }
});

// --- MOODS ---
router.post('/moods', async (req, res) => {
  try {
    const user = getUserId(req);
    const { date, mood } = req.body;
    const moodEntry = await Mood.findOneAndUpdate(
      { user, date },
      { mood },
      { upsert: true, new: true }
    );
    res.status(201).json(moodEntry);
  } catch (err) {
    res.status(400).json({ error: 'Failed to log mood', details: err });
  }
});

router.get('/moods', async (req, res) => {
  try {
    const user = getUserId(req);
    const moods = await Mood.find({ user }).sort({ date: -1 });
    res.json(moods);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch moods' });
  }
});

// --- ANALYSIS ---
router.get('/analysis', async (req, res) => {
  try {
    const user = getUserId(req);
    // Symptoms
    const symptoms = await Symptom.find({ user });
    const symptomCounts: Record<string, number> = {};
    const severityCounts: Record<string, number> = { mild: 0, moderate: 0, severe: 0 };
    symptoms.forEach((s: any) => {
      symptomCounts[s.description] = (symptomCounts[s.description] || 0) + 1;
      severityCounts[s.severity] = (severityCounts[s.severity] || 0) + 1;
    });
    const mostCommonSymptoms = Object.entries(symptomCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([desc, count]) => ({ description: desc, count }));
    // Medications
    const medications = await Medication.find({ user });
    const medDates = new Set(medications.map((m: any) => m.date.toISOString().slice(0, 10)));
    // Mood
    const moods = await Mood.find({ user });
    const moodCounts: Record<string, number> = {};
    moods.forEach((m: any) => { moodCounts[m.mood] = (moodCounts[m.mood] || 0) + 1; });
    res.json({
      symptomSummary: {
        total: symptoms.length,
        bySeverity: severityCounts,
        mostCommon: mostCommonSymptoms,
      },
      medicationSummary: {
        total: medications.length,
        adherenceDays: medDates.size,
      },
      moodSummary: {
        total: moods.length,
        byMood: moodCounts,
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to analyze tracker data' });
  }
});

// --- PDF EXPORT ---
router.get('/export-pdf', async (req, res) => {
  try {
    const user = getUserId(req);
    const [symptoms, meals, medications, moods] = await Promise.all([
      Symptom.find({ user }),
      Meal.find({ user }),
      Medication.find({ user }),
      Mood.find({ user })
    ]);
    // Use same analysis as /analysis endpoint
    const symptomCounts: Record<string, number> = {};
    const severityCounts: Record<string, number> = { mild: 0, moderate: 0, severe: 0 };
    symptoms.forEach((s: any) => {
      symptomCounts[s.description] = (symptomCounts[s.description] || 0) + 1;
      severityCounts[s.severity] = (severityCounts[s.severity] || 0) + 1;
    });
    const mostCommonSymptoms = Object.entries(symptomCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([desc, count]) => ({ description: desc, count }));
    const medDates = new Set(medications.map((m: any) => m.date.toISOString().slice(0, 10)));
    const moodCounts: Record<string, number> = {};
    moods.forEach((m: any) => { moodCounts[m.mood] = (moodCounts[m.mood] || 0) + 1; });
    const analysis = {
      symptomSummary: {
        total: symptoms.length,
        bySeverity: severityCounts,
        mostCommon: mostCommonSymptoms,
      },
      medicationSummary: {
        total: medications.length,
        adherenceDays: medDates.size,
      },
      moodSummary: {
        total: moods.length,
        byMood: moodCounts,
      }
    };
    await generateHealthReportPDF({ symptoms, meals, medications, moods, analysis, res });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate PDF report' });
  }
});

export default router;
